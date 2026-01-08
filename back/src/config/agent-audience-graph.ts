import { StateGraph, END, START, Annotation } from "@langchain/langgraph";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";
import { PromptTemplate } from "@langchain/core/prompts";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence, RunnableLambda } from "@langchain/core/runnables";
import { GraphState, AudienceAnalysis } from "./agent-audience";
import { tavily } from "@tavily/core";
import { SearchContext } from "../models/audience/openai-audience-inference.model";

/**
 * Extract JSON from a string that may have trailing text or markdown
 */
/**
 * Sanitize JSON string by removing or escaping invalid control characters
 */
function sanitizeJSON(jsonStr: string): string {
  // First, remove all backspace and other control characters from the entire string
  // This handles control characters in both keys and values
  // eslint-disable-next-line no-control-regex
  const cleaned = jsonStr.replace(
    // eslint-disable-next-line no-control-regex
    /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,
    ""
  );

  // Second pass: Fix common unescaped newlines, tabs, etc. in string values
  // This regex finds string values in JSON and escapes special characters
  return cleaned.replace(/"([^"\\]|\\.)*"/g, (match) => {
    // Don't modify if already properly escaped
    if (
      match.includes("\\n") ||
      match.includes("\\t") ||
      match.includes("\\r")
    ) {
      return match;
    }

    // Replace unescaped newlines and tabs (but not control chars - already removed)
    return match
      .replace(/\n/g, "\\n") // Newlines
      .replace(/\r/g, "\\r") // Carriage returns
      .replace(/\t/g, "\\t"); // Tabs
  });
}

function extractJSON(text: string): string {
  // If it's already an object, return as JSON string
  if (typeof text !== "string") {
    return JSON.stringify(text);
  }

  // Remove markdown code blocks if present
  const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "");

  // Find the first { and the matching closing }
  const startIndex = cleaned.indexOf("{");
  if (startIndex === -1) {
    throw new Error("No JSON object found in response");
  }

  // Find matching closing brace
  let depth = 0;
  let endIndex = -1;
  for (let i = startIndex; i < cleaned.length; i++) {
    if (cleaned[i] === "{") depth++;
    if (cleaned[i] === "}") depth--;
    if (depth === 0) {
      endIndex = i;
      break;
    }
  }

  if (endIndex === -1) {
    throw new Error("Unclosed JSON object in response");
  }

  const extracted = cleaned.substring(startIndex, endIndex + 1);

  // Sanitize the extracted JSON to fix control character issues
  return sanitizeJSON(extracted);
}

/**
 * Create a JSON parser that handles trailing text
 */
function createRobustJsonParser<T>(): RunnableLambda<any, T> {
  return new RunnableLambda({
    func: async (input: any) => {
      let text: string;

      // Handle different input types from LangChain
      if (typeof input === "string") {
        text = input;
      } else if (input?.kwargs?.content) {
        text = input.kwargs.content;
      } else if (input?.content) {
        text = input.content;
      } else if (input?.text) {
        text = input.text;
      } else {
        text = JSON.stringify(input);
      }

      const jsonStr = extractJSON(text);
      return JSON.parse(jsonStr) as T;
    },
  });
}

// --- PROMPTS ---
const ANALYSIS_PROMPT = `
You are an expert social media audience analyst with deep expertise in demographic analysis, social media behavior patterns, and influencer marketing analytics.

## Your Task
Analyze the provided Instagram profile context and estimate the audience demographics with high accuracy.

## Context Provided
{context}

## Analysis Guidelines

### 1. Bio and Username Extraction
- Extract the exact username from the profile URL or context
- Extract the complete bio text as provided
- If bio is missing, use "Not available"

### 2. Age Demographics Analysis (Be Precise and Data-Driven)
Analyze the content, engagement patterns, and profile characteristics to estimate age distribution with high accuracy:

**Age Group Characteristics:**
- **13-17**: Teenagers, typically interested in trends, gaming, entertainment, memes, TikTok-style content, school-related topics
- **18-24**: Young adults, college students, early career, lifestyle content, fashion, travel, relationships, party culture
- **25-34**: Young professionals, career-focused, lifestyle, tech, fashion, home decor, fitness, professional development
- **35-44**: Established professionals, family-oriented content, parenting, home improvement, career advancement, investments
- **45-54**: Mature professionals, family, hobbies, health, travel, financial planning, empty nesters
- **55+**: Seniors, traditional interests, family content, retirement, health, gardening, classic entertainment

**Analysis Factors (Weight Each):**
1. **Content Style**: 
   - Short-form, trendy content → younger (13-24)
   - Professional, educational → older (25-44)
   - Family, traditional → older (35+)

2. **Language & Communication**:
   - Slang, abbreviations, emojis → younger
   - Formal, professional language → older
   - Technical jargon → 25-44

3. **Topics & Themes**:
   - Gaming, memes, trends → 13-24
   - Career, business, tech → 25-34
   - Parenting, family → 30-44
   - Health, retirement → 45+

4. **Visual Aesthetics**:
   - Bright, trendy, filters → younger
   - Professional, clean → 25-44
   - Traditional, warm → 35+

5. **Engagement Patterns** (if available):
   - High engagement, comments → younger
   - Thoughtful, longer comments → older

**Be Realistic**: Most Instagram audiences skew younger (18-34 typically 60-70% combined). Adjust based on niche.

### 3. Gender Demographics (Be Precise Based on Niche)
Estimate male/female distribution with high accuracy based on multiple indicators:

**Analysis Factors:**
1. **Content Themes** (Strong Indicator):
   - Fashion, beauty, makeup, skincare → 70-90% female
   - Gaming, tech reviews, sports → 60-80% male
   - Fitness, lifestyle → 50-60% female
   - Business, finance → 55-65% male
   - Parenting, family → 70-85% female
   - Cars, motorcycles → 75-90% male
   - Food, cooking → 60-70% female
   - Travel → 55-65% female

2. **Visual Style**:
   - Pastel colors, aesthetic, curated → more female
   - Dark, bold, technical → more male
   - Neutral, professional → balanced

3. **Language & Tone**:
   - Emotional, descriptive, community-focused → more female
   - Direct, technical, data-focused → more male

4. **Industry Benchmarks**:
   - Use known industry demographics for the niche
   - Consider Instagram's overall 52% female, 48% male baseline
   - Adjust based on specific content type

**Important:** 
- Percentages must sum to exactly 100
- Be realistic: most niches have clear gender skews
- Don't default to 50/50 unless truly balanced content

### 4. Geographic Distribution (CRITICAL: Must return exactly 10 countries)
You MUST identify and return exactly 10 countries where the audience is located, ranked by percentage.

**Analysis Method:**
1. **Language Analysis**: Primary language in bio, posts, and content
   - Spanish → Focus on: Argentina, Mexico, Spain, Colombia, Chile, Peru, Venezuela, Ecuador, Dominican Republic, Guatemala
   - Portuguese → Focus on: Brazil, Portugal, Angola, Mozambique
   - English → Focus on: United States, United Kingdom, Canada, Australia, India, Philippines, South Africa, Nigeria, Ireland, New Zealand
   - Other languages → Identify corresponding countries

2. **Cultural Markers**: 
   - References to local events, holidays, traditions
   - Currency mentions, local brands, regional slang
   - Time zone indicators in posts

3. **Content Themes**:
   - Local news, regional trends
   - Location tags, geotags (if available)
   - Collaborations with local influencers

**Requirements:**
- Return EXACTLY 10 countries, no more, no less
- Rank countries by percentage (highest first)
- Use full country names (e.g., "United States", not "USA")
- Use valid ISO 3166-1 alpha-2 country codes (2 letters)
- Percentages must sum to exactly 100
- Include major markets even if small percentage (minimum 1-2% for top 10)
- Be realistic: if content is clearly from one region, that region should dominate

## CRITICAL OUTPUT REQUIREMENTS
You MUST return ONLY a valid JSON object. Nothing else.

Rules:
- Start your response with {{ and end with }}
- NO text before the JSON
- NO text after the JSON  
- NO markdown (no \`\`\`, no ##, no bullets)
- NO explanations or comments
- Include ALL required fields: bio, username, age, gender, geography (exactly 10 countries)

{format_instructions}

RESPOND WITH ONLY THE JSON. NO OTHER TEXT.
`;

const DEBATE_PROMPT = `
You are participating in a peer review debate with another AI analyst. Your goal is to critically evaluate the other analyst's work and defend or refine your own analysis.

## Your Original Analysis
{my_analysis}

## Other Analyst's Analysis
{other_analysis}

## Debate Instructions

### Your Task:
1. **Review the other analyst's work**: Identify strengths, weaknesses, and potential errors
2. **Defend your analysis**: Explain why your estimates are accurate based on the context
3. **Refine if needed**: If the other analyst makes a compelling point, acknowledge it and provide a refined estimate
4. **Be specific**: Reference specific data points from the scraped context to support your arguments

### Focus Areas:
- **Age Demographics**: Compare estimates. Are they within 10%? If not, explain why your estimate is more accurate
- **Gender Demographics**: Compare estimates. Consider content themes, visual style, and industry benchmarks
- **Geography**: Compare country lists. Are key markets missing? Are percentages realistic?

## CRITICAL OUTPUT REQUIREMENTS
- Return ONLY valid JSON
- NO markdown formatting (no \`\`\`, no ##, no *)
- NO additional text before or after the JSON
- NO explanations outside the JSON structure
- Valid JSON syntax only

### Output Format:
{format_instructions}

Return a JSON object with this exact structure:
{{
  "argument": "Your detailed argument explaining your position",
  "refined_analysis": null,
  "confidence": "high",
  "key_points": ["point1", "point2"]
}}

If you want to refine your analysis, replace null with:
{{
  "age": {{ "13-17": 5, "18-24": 25, "25-34": 35, "35-44": 20, "45-54": 10, "55+": 5 }},
  "gender": {{ "male": 60, "female": 40 }},
  "geography": [{{ "country": "United States", "country_code": "US", "percentage": 30 }}, ...]
}}
`;

const AGGREGATOR_PROMPT = `
You are a Chief Data Officer and expert in data fusion, statistical analysis, and audience intelligence. Your role is to synthesize multiple data sources into a single, accurate, and reliable audience analysis report.

## Data Sources

### Ground Truth (Scraper Data - Most Reliable)
This is the raw scraped data from the Instagram profile. Use this as the primary source for factual information.
{scraped_data}

### Source 1: LLaMA Analysis
{llama_data}

### Source 2: Gemini Analysis
{gemini_data}

### Debate History
{debate_history}

## Synthesis Rules

### 1. Factual Data (Use Ground Truth)
- **username**: Extract EXACTLY from Ground Truth. Must match the Instagram handle
- **bio**: Use the bio from either LLaMA or Gemini analysis (whichever is more complete). If both are missing or insufficient, use "Content creator" as fallback. The bio will be replaced with an AI-generated one later, so any reasonable bio is acceptable here.

### 2. Demographic Estimates (Intelligent Fusion)
For age, gender, and geography demographics:

**Strategy:**
- Review the debate history to understand where analysts agreed/disagreed
- Use weighted averaging: Give more weight to sources that provided strong arguments in debate
- If sources disagree significantly (>20% difference), use the median value
- If one source seems more aligned with Ground Truth context, weight it higher
- Ensure all percentages sum to exactly 100

**Age Demographics:**
- Average the estimates from both AI sources (considering debate refinements)
- Cross-validate with Ground Truth context (content themes, language style)
- Normalize to ensure sum equals 100
- Round to nearest integer

**Gender Demographics:**
- Average the estimates from both AI sources
- Consider Ground Truth context (content type, niche, industry)
- Ensure male + female = 100
- Round to nearest integer

**Geographic Distribution (CRITICAL: Must return exactly 10 countries):**
- Combine countries from both sources
- Merge countries with same country_code and average their percentages
- Sort by percentage (highest first)
- **MUST return exactly 10 countries** - if sources have fewer, add realistic countries based on:
  - Language patterns from Ground Truth
  - Regional proximity to top countries
  - Common Instagram markets (US, UK, CA, AU, DE, FR, ES, IT, BR, MX, AR, etc.)
- Normalize percentages to ensure sum equals exactly 100
- Include countries even if small percentage (minimum 1-2% for 10th country)
- Use standard country names (e.g., "United States", not "USA")
- Use valid ISO 3166-1 alpha-2 country codes (exactly 2 letters)
- Prioritize countries from Ground Truth context (language, cultural markers)

### 3. Quality Validation
Before finalizing, verify:
- ✅ All percentages are between 0 and 100
- ✅ Age percentages sum to 100
- ✅ Gender percentages sum to 100
- ✅ Geography percentages sum to 100
- ✅ Country codes are valid 2-letter ISO codes
- ✅ Country names are standard (e.g., "United States" not "USA")
- ✅ Username matches Instagram handle format
- ✅ Bio is extracted exactly from Ground Truth

## CRITICAL: MANDATORY FIELDS (ALL REQUIRED)
Your JSON response MUST include ALL of these fields or it will FAIL:
1. "bio" (string)
2. "username" (string)  
3. "age" (object with ALL 6 age ranges: "13-17", "18-24", "25-34", "35-44", "45-54", "55+")
4. "gender" (object with "male" and "female" keys)
5. "geography" (array with EXACTLY 10 country objects)

## OUTPUT FORMAT
{format_instructions}

## CRITICAL OUTPUT REQUIREMENTS
You MUST return ONLY valid JSON with ALL 5 REQUIRED FIELDS.

Rules:
- Start your response with {{ and end with }}
- NO text before the JSON
- NO text after the JSON
- NO markdown (no \`\`\`, no ##, no bullets)
- NO explanations or comments
- "age" MUST have all 6 age groups
- "gender" MUST have both male and female (must sum to 100)
- "geography" MUST have exactly 10 countries (percentages must sum to 100)

Example (COPY THIS EXACT STRUCTURE):
{{
  "bio": "Content creator specializing in cooking and lifestyle",
  "username": "example_user",
  "age": {{
    "13-17": 3,
    "18-24": 22,
    "25-34": 38,
    "35-44": 24,
    "45-54": 10,
    "55+": 3
  }},
  "gender": {{
    "male": 35,
    "female": 65
  }},
  "geography": [
    {{ "country": "Argentina", "country_code": "AR", "percentage": 45 }},
    {{ "country": "Mexico", "country_code": "MX", "percentage": 18 }},
    {{ "country": "Spain", "country_code": "ES", "percentage": 12 }},
    {{ "country": "Chile", "country_code": "CL", "percentage": 8 }},
    {{ "country": "Colombia", "country_code": "CO", "percentage": 5 }},
    {{ "country": "Peru", "country_code": "PE", "percentage": 4 }},
    {{ "country": "United States", "country_code": "US", "percentage": 3 }},
    {{ "country": "Uruguay", "country_code": "UY", "percentage": 2 }},
    {{ "country": "Ecuador", "country_code": "EC", "percentage": 2 }},
    {{ "country": "Paraguay", "country_code": "PY", "percentage": 1 }}
  ]
}}

RESPOND WITH ONLY THE JSON OBJECT. NO OTHER TEXT.
`;

const BIO_PROMPT = `
Sos un generador de biografías breves de creadores de contenido e influencers. 
Tu tarea es escribir una BIO corta y descriptiva del creador.
Reglas estrictas:
- Extensión máxima: 3 a 4 líneas.
- Estilo: narrativo, claro y neutral.
- Enfoque cultural y creativo, no comercial.
- No incluir datos demográficos, métricas, audiencia ni marcas.
- No mencionar colaboraciones, fit comercial ni llamados a la acción.
- No usar emojis, hashtags ni bullets.
- Evitar adjetivos exagerados o lenguaje promocional.
- Contenido obligatorio:
- Quién es el creador.
- Qué lo define creativamente.
- Por qué es relevante en la cultura actual.
Tono:
- Editorial.
- Profesional.
- Objetivo.
Formato de salida:
- Un único párrafo de texto plano.
- Sin títulos.
- Sin saltos innecesarios.
- Frases completas, no cortar frases en medio.
Escribí la BIO como si fuera a incluirse en una ficha descargable para evaluación general del creador.

Información del creador:
{scraped_data}
`;

// --- Graph Node Functions ---

export interface GraphNodeContext {
  llamaModel: ChatGroq;
  geminiModel: ChatGoogleGenerativeAI;
  judgeModel: ChatGoogleGenerativeAI;
  jsonParser: JsonOutputParser<AudienceAnalysis>;
  tavilyClient: ReturnType<typeof tavily>;
  searchContext?: SearchContext;
}

/**
 * Scrape profile data using Tavily
 */
export async function scrapeNode(
  state: GraphState,
  context: GraphNodeContext
): Promise<Partial<GraphState>> {
  const startTime = Date.now();
  console.log(`🕷️ [Graph] Scraping: ${state.instagramUrl}`);

  try {
    const usernameMatch = state.instagramUrl.match(/instagram\.com\/([^/?]+)/);
    const username = usernameMatch ? usernameMatch[1] : state.instagramUrl;
    const searchQuery = `Instagram profile ${username} bio followers posts content`;

    const searchResults = await context.tavilyClient.search(searchQuery, {
      searchDepth: "advanced",
      includeAnswer: true,
      includeRawContent: false,
      maxResults: 10,
      includeImages: false,
    });

    let scrapedData = `Profile URL: ${state.instagramUrl}\n`;
    scrapedData += `Username: ${username}\n\n`;

    if (searchResults.answer) {
      scrapedData += `Summary: ${searchResults.answer}\n\n`;
    }

    if (searchResults.results && searchResults.results.length > 0) {
      scrapedData += `Sources Found:\n`;
      searchResults.results.forEach((result, index) => {
        scrapedData += `\n[Source ${index + 1}]\n`;
        scrapedData += `Title: ${result.title || "N/A"}\n`;
        scrapedData += `URL: ${result.url || "N/A"}\n`;
        if (result.content) {
          scrapedData += `Content: ${result.content.substring(0, 500)}...\n`;
        }
      });
    }

    // Enhance with search context if available
    if (context.searchContext) {
      scrapedData += "\n\n## Search Context Information\n";
      if (context.searchContext.creator_location) {
        scrapedData += `Creator Location: ${context.searchContext.creator_location}\n`;
      }
      if (context.searchContext.target_audience_geo) {
        scrapedData += "Target Audience Geography Preferences:\n";
        if (context.searchContext.target_audience_geo.countries?.length) {
          scrapedData += `Countries: ${context.searchContext.target_audience_geo.countries
            .map((c: { id: string; prc: number }) => `${c.id}(${c.prc}%)`)
            .join(", ")}\n`;
        }
        if (context.searchContext.target_audience_geo.cities?.length) {
          scrapedData += `Cities: ${context.searchContext.target_audience_geo.cities
            .map((c: { id: number; prc: number }) => `${c.id}(${c.prc}%)`)
            .join(", ")}\n`;
        }
      }
      scrapedData +=
        "\nUse this search context to inform your demographic analysis.\n";
    }

    const elapsedTime = Date.now() - startTime;
    console.log(`✅ [Graph] Scraped in ${elapsedTime}ms`);

    return {
      rawScrapedData: scrapedData,
      timings: {
        ...state.timings,
        scraping: elapsedTime,
      },
    };
  } catch (error) {
    console.error(`❌ [Graph] Scraping error:`, error);
    return {
      rawScrapedData: `Profile URL: ${state.instagramUrl}\nError: Failed to scrape profile data.`,
      timings: {
        ...state.timings,
        scraping: Date.now() - startTime,
      },
    };
  }
}

/**
 * Generate bio in parallel (independent of analysis)
 */
export async function bioGeneratorNode(
  state: GraphState,
  context: GraphNodeContext
): Promise<Partial<GraphState>> {
  const startTime = Date.now();
  console.log("✍️ [Graph] Generating bio...");

  try {
    const chain = RunnableSequence.from([
      PromptTemplate.fromTemplate(BIO_PROMPT),
      context.geminiModel,
    ]);

    const response = await chain.invoke({
      scraped_data: state.rawScrapedData,
    });

    let bioContent: string;
    if (typeof response === "string") {
      bioContent = response;
    } else if (response && typeof response === "object") {
      const anyResponse = response as any;
      if (
        anyResponse.kwargs &&
        typeof anyResponse.kwargs.content === "string"
      ) {
        bioContent = anyResponse.kwargs.content;
      } else if (
        "content" in response &&
        typeof (response as any).content === "string"
      ) {
        bioContent = (response as any).content;
      } else if (Array.isArray(response)) {
        bioContent = response
          .map((item: any) =>
            typeof item === "string" ? item : item?.text || item?.content || ""
          )
          .join("");
      } else {
        bioContent = JSON.stringify(response);
      }
    } else {
      bioContent = String(response);
    }

    const cleanBio = bioContent
      .replace(/```/g, "")
      .replace(/^["']|["']$/g, "")
      .trim();

    const elapsedTime = Date.now() - startTime;
    console.log(`✅ [Graph] Bio generated in ${elapsedTime}ms`);

    return {
      generatedBio: cleanBio || "Content creator",
      timings: {
        ...state.timings,
        bioGeneration: elapsedTime,
      },
    };
  } catch (error) {
    console.error(`❌ [Graph] Bio generation error:`, error);
    return {
      generatedBio: "Content creator",
      timings: {
        ...state.timings,
        bioGeneration: Date.now() - startTime,
      },
    };
  }
}

/**
 * Analyze with Llama model
 */
export async function llamaAnalystNode(
  state: GraphState,
  context: GraphNodeContext
): Promise<Partial<GraphState>> {
  const startTime = Date.now();
  console.log("🦙 [Graph] Llama analyzing...");

  try {
    const robustParser = createRobustJsonParser<AudienceAnalysis>();
    const chain = RunnableSequence.from([
      PromptTemplate.fromTemplate(ANALYSIS_PROMPT),
      context.llamaModel,
      robustParser,
    ]);

    const res = await chain.invoke({
      context: state.rawScrapedData,
      format_instructions: context.jsonParser.getFormatInstructions(),
    });

    const elapsedTime = Date.now() - startTime;
    console.log(`✅ [Graph] Llama analysis completed in ${elapsedTime}ms`);

    return {
      llamaAnalysis: res as Partial<AudienceAnalysis>,
      timings: {
        ...state.timings,
        llamaAnalysis: elapsedTime,
      },
    };
  } catch (error) {
    console.error(`❌ [Graph] Llama analysis error:`, error);
    return {
      llamaAnalysis: null,
      timings: {
        ...state.timings,
        llamaAnalysis: Date.now() - startTime,
      },
    };
  }
}

/**
 * Analyze with Gemini model
 */
export async function geminiAnalystNode(
  state: GraphState,
  context: GraphNodeContext
): Promise<Partial<GraphState>> {
  const startTime = Date.now();
  console.log("💎 [Graph] Gemini analyzing...");

  try {
    const robustParser = createRobustJsonParser<AudienceAnalysis>();
    const chain = RunnableSequence.from([
      PromptTemplate.fromTemplate(ANALYSIS_PROMPT),
      context.geminiModel,
      robustParser,
    ]);

    const res = await chain.invoke({
      context: state.rawScrapedData,
      format_instructions: context.jsonParser.getFormatInstructions(),
    });

    const elapsedTime = Date.now() - startTime;
    console.log(`✅ [Graph] Gemini analysis completed in ${elapsedTime}ms`);

    return {
      geminiAnalysis: res as Partial<AudienceAnalysis>,
      timings: {
        ...state.timings,
        geminiAnalysis: elapsedTime,
      },
    };
  } catch (error) {
    console.error(`❌ [Graph] Gemini analysis error:`, error);
    return {
      geminiAnalysis: null,
      timings: {
        ...state.timings,
        geminiAnalysis: Date.now() - startTime,
      },
    };
  }
}

/**
 * Join node - waits for both analyses to complete
 */
export async function joinAnalysesNode(
  state: GraphState,
  context: GraphNodeContext
): Promise<Partial<GraphState>> {
  // This node just passes through - it ensures both analyses are ready
  // LangGraph will call this after both llamaAnalyst and geminiAnalyst complete
  if (!state.llamaAnalysis || !state.geminiAnalysis) {
    // Still waiting for one of them
    return {};
  }
  console.log("✅ [Graph] Both analyses ready, proceeding to debate");
  return {};
}

/**
 * Join node - waits for both bio and debate to complete
 */
export async function joinBioAndDebateNode(
  state: GraphState,
  context: GraphNodeContext
): Promise<Partial<GraphState>> {
  // This node ensures both bio generation and debate are complete before judge
  // LangGraph will call this after both bioGenerator and debate complete
  if (!state.generatedBio || state.consensus === false) {
    // Still waiting - consensus false means debate not complete yet
    return {};
  }
  console.log("✅ [Graph] Bio and debate ready, proceeding to judge");
  return {};
}

/**
 * Check if bio and debate are ready
 */
export function checkBioAndDebateReady(state: GraphState): string {
  // Check that bio is generated and consensus is true (debate completed)
  if (state.generatedBio && state.consensus === true) {
    return "judge";
  }
  return "wait";
}

/**
 * Debate node - models review each other's work
 */
export async function debateNode(
  state: GraphState,
  context: GraphNodeContext
): Promise<Partial<GraphState>> {
  const startTime = Date.now();
  const currentRound = state.round + 1;
  console.log(`💬 [Graph] Debate round ${currentRound}...`);

  if (!state.llamaAnalysis || !state.geminiAnalysis) {
    console.warn("⚠️ [Graph] Missing analyses, skipping debate");
    return {
      round: currentRound,
      consensus: true,
      timings: {
        ...state.timings,
        debate: (state.timings.debate || 0) + (Date.now() - startTime),
      },
    };
  }

  try {
    let llamaArgument: any = null;
    let geminiArgument: any = null;

    // Llama reviews Gemini (with individual error handling)
    try {
      const robustParser = createRobustJsonParser<any>();
      const llamaDebateChain = RunnableSequence.from([
        PromptTemplate.fromTemplate(DEBATE_PROMPT),
        context.llamaModel,
        robustParser,
      ]);

      llamaArgument = await llamaDebateChain.invoke({
        my_analysis: JSON.stringify(state.llamaAnalysis),
        other_analysis: JSON.stringify(state.geminiAnalysis),
        format_instructions: context.jsonParser.getFormatInstructions(),
      });
      console.log("✅ [Graph] Llama debate argument parsed successfully");
    } catch (llamaError) {
      console.warn(
        `⚠️ [Graph] Llama debate failed (JSON parse error), skipping this round:`,
        llamaError instanceof Error ? llamaError.message : llamaError
      );
      // Skip debate if Llama fails to produce valid JSON
      return {
        round: currentRound,
        consensus: true, // Move to judge without debate
        timings: {
          ...state.timings,
          debate: (state.timings.debate || 0) + (Date.now() - startTime),
        },
      };
    }

    // Gemini reviews Llama (with individual error handling)
    try {
      const geminiDebateParser = createRobustJsonParser<any>();
      const geminiDebateChain = RunnableSequence.from([
        PromptTemplate.fromTemplate(DEBATE_PROMPT),
        context.geminiModel,
        geminiDebateParser,
      ]);

      geminiArgument = await geminiDebateChain.invoke({
        my_analysis: JSON.stringify(state.geminiAnalysis),
        other_analysis: JSON.stringify(state.llamaAnalysis),
        format_instructions: context.jsonParser.getFormatInstructions(),
      });
      console.log("✅ [Graph] Gemini debate argument parsed successfully");
    } catch (geminiError) {
      console.warn(
        `⚠️ [Graph] Gemini debate failed (JSON parse error), skipping this round:`,
        geminiError instanceof Error ? geminiError.message : geminiError
      );
      // Skip debate if Gemini fails to produce valid JSON
      return {
        round: currentRound,
        consensus: true, // Move to judge without debate
        timings: {
          ...state.timings,
          debate: (state.timings.debate || 0) + (Date.now() - startTime),
        },
      };
    }

    const debateEntry = {
      round: currentRound,
      llamaArgument: JSON.stringify(llamaArgument),
      geminiArgument: JSON.stringify(geminiArgument),
    };

    // Check for consensus (simplified: if both maintain their positions, no consensus)
    // In a real implementation, you'd parse the arguments and check if they converged
    const hasConsensus = currentRound >= 2; // Max 2 rounds

    const elapsedTime = Date.now() - startTime;
    console.log(
      `✅ [Graph] Debate round ${currentRound} completed in ${elapsedTime}ms`
    );

    return {
      debateHistory: [...state.debateHistory, debateEntry],
      round: currentRound,
      consensus: hasConsensus,
      timings: {
        ...state.timings,
        debate: (state.timings.debate || 0) + elapsedTime,
      },
    };
  } catch (error) {
    console.error(`❌ [Graph] Debate unexpected error:`, error);
    return {
      round: currentRound,
      consensus: true, // Fail fast - move to judge
      timings: {
        ...state.timings,
        debate: (state.timings.debate || 0) + (Date.now() - startTime),
      },
    };
  }
}

/**
 * Judge node - final aggregation
 */
export async function judgeNode(
  state: GraphState,
  context: GraphNodeContext
): Promise<Partial<GraphState>> {
  const startTime = Date.now();
  console.log("⚖️ [Graph] Judge aggregating...");

  try {
    const robustParser = createRobustJsonParser<AudienceAnalysis>();
    const chain = RunnableSequence.from([
      PromptTemplate.fromTemplate(AGGREGATOR_PROMPT),
      context.judgeModel,
      robustParser,
    ]);

    const res = await chain.invoke({
      llama_data: JSON.stringify(state.llamaAnalysis),
      gemini_data: JSON.stringify(state.geminiAnalysis),
      scraped_data: state.rawScrapedData,
      debate_history: JSON.stringify(state.debateHistory),
      format_instructions: context.jsonParser.getFormatInstructions(),
    });

    const result = res as AudienceAnalysis;

    // Debug: Log what the judge returned
    console.log("🔍 [Graph] Judge raw output keys:", Object.keys(result));
    console.log("🔍 [Graph] Judge output sample:", {
      hasAge: !!result.age,
      hasGender: !!result.gender,
      hasGeography: !!result.geography,
      hasBio: !!result.bio,
      hasUsername: !!result.username,
    });

    // Replace bio with generated one
    result.bio = state.generatedBio || result.bio;

    // Validate critical fields - if missing, use fallbacks from original analyses
    if (!result.geography || result.geography.length === 0) {
      console.warn(
        "⚠️ [Graph] Judge didn't return geography, using Llama fallback"
      );
      console.warn(
        "🔍 [Graph] Judge returned:",
        JSON.stringify(result, null, 2)
      );
      result.geography =
        (state.llamaAnalysis as AudienceAnalysis)?.geography ||
        (state.geminiAnalysis as AudienceAnalysis)?.geography ||
        [];
    }

    if (!result.age) {
      console.warn("⚠️ [Graph] Judge didn't return age, using Llama fallback");
      console.warn(
        "🔍 [Graph] Judge returned:",
        JSON.stringify(result, null, 2)
      );
      result.age = (state.llamaAnalysis as AudienceAnalysis)?.age ||
        (state.geminiAnalysis as AudienceAnalysis)?.age || {
          "13-17": 5,
          "18-24": 25,
          "25-34": 35,
          "35-44": 20,
          "45-54": 10,
          "55+": 5,
        };
    }

    if (!result.gender) {
      console.warn(
        "⚠️ [Graph] Judge didn't return gender, using Llama fallback"
      );
      console.warn(
        "🔍 [Graph] Judge returned:",
        JSON.stringify(result, null, 2)
      );
      result.gender = (state.llamaAnalysis as AudienceAnalysis)?.gender ||
        (state.geminiAnalysis as AudienceAnalysis)?.gender || {
          male: 50,
          female: 50,
        };
    }

    const elapsedTime = Date.now() - startTime;
    console.log(`✅ [Graph] Judge completed in ${elapsedTime}ms`);

    return {
      finalResult: result,
      timings: {
        ...state.timings,
        aggregation: elapsedTime,
      },
    };
  } catch (error) {
    console.error(`❌ [Graph] Judge error:`, error);
    throw error;
  }
}

/**
 * Conditional edge: check if debate should continue
 */
export function shouldContinueDebate(state: GraphState): string {
  if (state.consensus || state.round >= 2) {
    return "judge";
  }
  return "debate";
}

/**
 * Check if both analyses are ready
 */
export function checkAnalysesReady(state: GraphState): string {
  if (state.llamaAnalysis && state.geminiAnalysis) {
    return "debate";
  }
  return "wait"; // This will never be reached in practice, but needed for type safety
}

/**
 * Define state annotation using modern LangGraph API
 */
const StateAnnotation = Annotation.Root({
  instagramUrl: Annotation<string>({
    reducer: (x: string, y: string) => y || x,
  }),
  rawScrapedData: Annotation<string>({
    reducer: (x: string, y: string) => y || x,
  }),
  llamaAnalysis: Annotation<Partial<AudienceAnalysis> | null>({
    reducer: (x: any, y: any) => (y !== null && y !== undefined ? y : x),
  }),
  geminiAnalysis: Annotation<Partial<AudienceAnalysis> | null>({
    reducer: (x: any, y: any) => (y !== null && y !== undefined ? y : x),
  }),
  finalResult: Annotation<AudienceAnalysis | null>({
    reducer: (x: any, y: any) => (y !== null && y !== undefined ? y : x),
  }),
  debateHistory: Annotation<
    Array<{
      round: number;
      llamaArgument?: string;
      geminiArgument?: string;
    }>
  >({
    reducer: (x: any[], y: any[]) => y || x,
  }),
  round: Annotation<number>({
    reducer: (x: number, y: number) => y ?? x,
  }),
  consensus: Annotation<boolean>({
    reducer: (x: boolean, y: boolean) => y ?? x,
  }),
  generatedBio: Annotation<string | null>({
    reducer: (x: string | null, y: string | null) => y || x,
  }),
  searchContext: Annotation<any>({
    reducer: (x: any, y: any) => y || x,
  }),
  costs: Annotation<{
    tavily: number;
    bioGeneration: number;
    llamaAnalysis: number;
    geminiAnalysis: number;
    debate: number;
    aggregation: number;
  }>({
    reducer: (x: any, y: any) => (y ? { ...(x || {}), ...y } : x),
  }),
  timings: Annotation<{
    scraping: number;
    bioGeneration: number;
    llamaAnalysis: number;
    geminiAnalysis: number;
    debate: number;
    aggregation: number;
  }>({
    reducer: (x: any, y: any) => (y ? { ...(x || {}), ...y } : x),
  }),
});

/**
 * Create the graph
 */
export function createAudienceGraph(context: GraphNodeContext) {
  const graph = new StateGraph(StateAnnotation)
    .addNode("scrape", (state) => scrapeNode(state, context))
    .addNode("bioGenerator", (state) => bioGeneratorNode(state, context))
    .addNode("llamaAnalyst", (state) => llamaAnalystNode(state, context))
    .addNode("geminiAnalyst", (state) => geminiAnalystNode(state, context))
    .addNode("joinAnalyses", (state) => joinAnalysesNode(state, context))
    .addNode("debate", (state) => debateNode(state, context))
    .addNode("joinBioAndDebate", (state) =>
      joinBioAndDebateNode(state, context)
    )
    .addNode("judge", (state) => judgeNode(state, context))
    .addEdge(START, "scrape")
    // Parallel branches after scraping
    .addEdge("scrape", "bioGenerator")
    .addEdge("scrape", "llamaAnalyst")
    .addEdge("scrape", "geminiAnalyst")
    // Both analysts feed into join node
    .addEdge("llamaAnalyst", "joinAnalyses")
    .addEdge("geminiAnalyst", "joinAnalyses")
    // Join node checks readiness and routes to debate
    .addConditionalEdges("joinAnalyses", checkAnalysesReady, {
      debate: "debate",
      wait: "joinAnalyses", // Will never happen but needed for type safety
    })
    // Conditional: continue debate or go to join (when consensus reached)
    .addConditionalEdges("debate", shouldContinueDebate, {
      debate: "debate",
      judge: "joinBioAndDebate", // Route to join when consensus reached
    })
    // Bio generator feeds to join node
    .addEdge("bioGenerator", "joinBioAndDebate")
    // Join node waits for both bio and debate, then routes to judge
    .addConditionalEdges("joinBioAndDebate", checkBioAndDebateReady, {
      judge: "judge",
      wait: "joinBioAndDebate",
    })
    .addEdge("judge", END);

  return graph.compile();
}
