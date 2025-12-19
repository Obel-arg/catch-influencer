import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";
import { PromptTemplate } from "@langchain/core/prompts";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { AudienceAnalysis } from "../../config/agent-audience";
import { tavily } from "@tavily/core";
import * as dotenv from "dotenv";

dotenv.config();

// --- PROMPTS CONSTANTES ---
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

5. **Engagement Patterns** (if available):
   - Comment style and topics
   - Question types asked

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

4. **Instagram Usage Patterns**:
   - Peak engagement times (indicate time zones)
   - Language of comments and engagement
   - Regional hashtags usage

**Requirements:**
- Return EXACTLY 10 countries, no more, no less
- Rank countries by percentage (highest first)
- Use full country names (e.g., "United States", not "USA")
- Use valid ISO 3166-1 alpha-2 country codes (2 letters)
- Percentages must sum to exactly 100
- Include major markets even if small percentage (minimum 1-2% for top 10)
- Be realistic: if content is clearly from one region, that region should dominate

## Output Requirements
- Return ONLY valid JSON matching this exact structure:
{format_instructions}

## Quality Standards
- Be realistic and data-driven in your estimates
- If information is insufficient, make educated estimates based on profile characteristics
- Ensure all percentages are between 0 and 100
- Ensure all numeric values sum correctly (age: 100%, gender: 100%, geography: 100%)
- Use proper JSON formatting with no additional text or markdown

## Example Structure
{{
  "bio": "extracted bio text",
  "username": "extracted_username",
  "age": {{ "13-17": 5, "18-24": 25, "25-34": 35, "35-44": 20, "45-54": 10, "55+": 5 }},
  "gender": {{ "male": 55, "female": 45 }},
  "geography": [
    {{ "country": "United States", "country_code": "US", "percentage": 35 }},
    {{ "country": "United Kingdom", "country_code": "GB", "percentage": 15 }},
    {{ "country": "Canada", "country_code": "CA", "percentage": 12 }},
    {{ "country": "Australia", "country_code": "AU", "percentage": 8 }},
    {{ "country": "Germany", "country_code": "DE", "percentage": 7 }},
    {{ "country": "France", "country_code": "FR", "percentage": 6 }},
    {{ "country": "Spain", "country_code": "ES", "percentage": 5 }},
    {{ "country": "Italy", "country_code": "IT", "percentage": 4 }},
    {{ "country": "Netherlands", "country_code": "NL", "percentage": 3 }},
    {{ "country": "Brazil", "country_code": "BR", "percentage": 5 }}
  ]
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

## Synthesis Rules

### 1. Factual Data (Use Ground Truth)
- **username**: Extract EXACTLY from Ground Truth. Must match the Instagram handle
- **bio**: Use the bio from either LLaMA or Gemini analysis (whichever is more complete). If both are missing or insufficient, use "Content creator" as fallback. The bio will be replaced with an AI-generated one later, so any reasonable bio is acceptable here.

### 2. Demographic Estimates (Intelligent Fusion)
For age, gender, and geography demographics:

**Strategy:**
- Compare all three sources (LLaMA, Gemini, and any hints in Ground Truth)
- Use weighted averaging: Give more weight to sources that provide detailed reasoning
- If sources disagree significantly (>20% difference), use the median value
- If one source seems more aligned with Ground Truth context, weight it higher
- Ensure all percentages sum to exactly 100

**Age Demographics:**
- Average the estimates from both AI sources
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

### 4. Edge Cases
- If a source has null or missing data, use the other source
- If both sources are missing data, make educated estimate based on Ground Truth
- If Ground Truth is insufficient, use average of AI sources
- If percentages don't sum to 100, normalize proportionally

## Output Format
Return ONLY valid JSON matching this structure:
{format_instructions}

## Critical Requirements
- NO additional text, explanations, or markdown
- NO comments in JSON
- Valid JSON syntax only
- All numeric values must be numbers (not strings)
- All percentages must sum correctly
- Use double quotes for all strings

## Example Output
{{
  "bio": "Tech Reviewer 📱 | Gadgets & AI | San Francisco 🇺🇸",
  "username": "techreviewer",
  "age": {{ "13-17": 5, "18-24": 25, "25-34": 35, "35-44": 20, "45-54": 10, "55+": 5 }},
  "gender": {{ "male": 65, "female": 35 }},
  "geography": [
    {{ "country": "United States", "country_code": "US", "percentage": 35 }},
    {{ "country": "United Kingdom", "country_code": "GB", "percentage": 12 }},
    {{ "country": "Canada", "country_code": "CA", "percentage": 10 }},
    {{ "country": "Germany", "country_code": "DE", "percentage": 8 }},
    {{ "country": "Australia", "country_code": "AU", "percentage": 7 }},
    {{ "country": "France", "country_code": "FR", "percentage": 6 }},
    {{ "country": "India", "country_code": "IN", "percentage": 5 }},
    {{ "country": "Spain", "country_code": "ES", "percentage": 4 }},
    {{ "country": "Italy", "country_code": "IT", "percentage": 3 }},
    {{ "country": "Netherlands", "country_code": "NL", "percentage": 10 }}
  ]
}}
`;

export class AgentAudienceService {
  private llamaModel: ChatGroq;
  private geminiModel: ChatGoogleGenerativeAI;
  private judgeModel: ChatGoogleGenerativeAI;
  private jsonParser: JsonOutputParser<AudienceAnalysis>;
  private tavilyClient: ReturnType<typeof tavily>;

  constructor() {
    // 1. Inicializar Modelos
    // Usando llama-3.1-8b-instruct que es más rápido que llama-4-scout-17b
    // Groq optimiza estos modelos para velocidad máxima
    this.llamaModel = new ChatGroq({
      model: "llama-3.1-8b-instant",
      temperature: 0.5,
      apiKey: process.env.GROQ_API_KEY,
    });

    this.geminiModel = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash",
      temperature: 0.5,
      apiKey: process.env.GOOGLE_API_KEY,
    });

    // Modelo con temperatura 0 para la agregación final (más estricto)
    this.judgeModel = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash",
      temperature: 0,
      apiKey: process.env.GOOGLE_API_KEY,
    });

    this.jsonParser = new JsonOutputParser<AudienceAnalysis>();

    // Inicializar cliente de Tavily para web scraping
    this.tavilyClient = tavily({
      apiKey: process.env.TAVILY_API_KEY,
    });
  }

  // --- MÉTODOS PRIVADOS ---

  /**
   * Calcula el costo aproximado de una llamada a Groq
   */
  private estimateGroqCost(inputTokens: number, outputTokens: number): number {
    // Groq pricing: llama-3.1-8b-instruct (más rápido y económico que llama-4-scout-17b)
    // Input: ~$0.05 per 1M tokens
    // Output: ~$0.20 per 1M tokens
    const inputCost = (inputTokens / 1_000_000) * 0.05;
    const outputCost = (outputTokens / 1_000_000) * 0.2;
    return inputCost + outputCost;
  }

  /**
   * Calcula el costo aproximado de una llamada a Gemini
   */
  private estimateGeminiCost(
    inputTokens: number,
    outputTokens: number
  ): number {
    // Gemini 2.5 Flash pricing
    // Input: ~$0.075 per 1M tokens
    // Output: ~$0.30 per 1M tokens
    const inputCost = (inputTokens / 1_000_000) * 0.075;
    const outputCost = (outputTokens / 1_000_000) * 0.3;
    return inputCost + outputCost;
  }

  /**
   * Estima tokens basándose en la longitud del texto
   */
  private estimateTokens(text: string): number {
    // Aproximación: 1 token ≈ 4 caracteres para inglés, ~3 para español
    return Math.ceil(text.length / 3.5);
  }

  private async scrapeProfile(url: string): Promise<string> {
    const startTime = Date.now();
    console.log(`🕷️ [Service] Scraping with Tavily: ${url}`);

    try {
      // Extraer username de la URL de Instagram
      const usernameMatch = url.match(/instagram\.com\/([^/?]+)/);
      const username = usernameMatch ? usernameMatch[1] : url;

      // Construir query de búsqueda para obtener información del perfil
      const searchQuery = `Instagram profile ${username} bio followers posts content`;

      // Realizar búsqueda con Tavily
      const searchResults = await this.tavilyClient.search(searchQuery, {
        searchDepth: "advanced",
        includeAnswer: true,
        includeRawContent: false,
        maxResults: 10,
        includeImages: false,
      });

      // Construir contexto estructurado a partir de los resultados
      let scrapedData = `Profile URL: ${url}\n`;
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

      // Incluir información adicional si está disponible
      if (searchResults.results) {
        const additionalInfo = searchResults.results
          .map((r) => {
            const info: string[] = [];
            if (r.title) info.push(`Title: ${r.title}`);
            if (r.url) info.push(`URL: ${r.url}`);
            return info.join(" | ");
          })
          .filter(Boolean)
          .join("\n");
        if (additionalInfo) {
          scrapedData += `\n\nAdditional Sources:\n${additionalInfo}`;
        }
      }

      const elapsedTime = Date.now() - startTime;
      console.log(
        `✅ [Service] Successfully scraped data for ${username} (${elapsedTime}ms)`
      );
      return scrapedData;
    } catch (error) {
      const elapsedTime = Date.now() - startTime;
      console.error(
        `❌ [Service] Error scraping with Tavily (${elapsedTime}ms):`,
        error
      );
      // Fallback a datos básicos si falla Tavily
      return `Profile URL: ${url}\nError: Failed to scrape profile data. Using fallback.`;
    }
  }

  private async analyzeWithLlama(
    scrapedData: string
  ): Promise<{ result: AudienceAnalysis | null; time: number; cost: number }> {
    const startTime = Date.now();
    console.log("🦙 [Service] LLaMA Running...");
    const chain = RunnableSequence.from([
      PromptTemplate.fromTemplate(ANALYSIS_PROMPT),
      this.llamaModel,
      this.jsonParser,
    ]);

    try {
      const promptText = ANALYSIS_PROMPT.replace(
        "{context}",
        scrapedData
      ).replace(
        "{format_instructions}",
        this.jsonParser.getFormatInstructions()
      );
      const estimatedInputTokens = this.estimateTokens(promptText);
      const estimatedOutputTokens = 500; // Estimación para respuesta JSON

      const res = await chain.invoke({
        context: scrapedData,
        format_instructions: this.jsonParser.getFormatInstructions(),
      });

      const elapsedTime = Date.now() - startTime;
      const cost = this.estimateGroqCost(
        estimatedInputTokens,
        estimatedOutputTokens
      );

      console.log(
        `✅ [LLaMA] Analysis completed in ${elapsedTime}ms (est. cost: $${cost.toFixed(
          6
        )})`
      );

      return {
        result: res as AudienceAnalysis,
        time: elapsedTime,
        cost,
      };
    } catch (e) {
      const elapsedTime = Date.now() - startTime;
      console.error(`❌ [LLaMA] Error after ${elapsedTime}ms:`, e);
      return { result: null, time: elapsedTime, cost: 0 };
    }
  }

  private async analyzeWithGemini(
    scrapedData: string
  ): Promise<{ result: AudienceAnalysis | null; time: number; cost: number }> {
    const startTime = Date.now();
    console.log("💎 [Service] Gemini Running...");
    const chain = RunnableSequence.from([
      PromptTemplate.fromTemplate(ANALYSIS_PROMPT),
      this.geminiModel,
      this.jsonParser,
    ]);

    try {
      const promptText = ANALYSIS_PROMPT.replace(
        "{context}",
        scrapedData
      ).replace(
        "{format_instructions}",
        this.jsonParser.getFormatInstructions()
      );
      const estimatedInputTokens = this.estimateTokens(promptText);
      const estimatedOutputTokens = 500; // Estimación para respuesta JSON

      const res = await chain.invoke({
        context: scrapedData,
        format_instructions: this.jsonParser.getFormatInstructions(),
      });

      const elapsedTime = Date.now() - startTime;
      const cost = this.estimateGeminiCost(
        estimatedInputTokens,
        estimatedOutputTokens
      );

      console.log(
        `✅ [Gemini] Analysis completed in ${elapsedTime}ms (est. cost: $${cost.toFixed(
          6
        )})`
      );

      return {
        result: res as AudienceAnalysis,
        time: elapsedTime,
        cost,
      };
    } catch (e) {
      const elapsedTime = Date.now() - startTime;
      console.error(`❌ [Gemini] Error after ${elapsedTime}ms:`, e);
      return { result: null, time: elapsedTime, cost: 0 };
    }
  }

  /**
   * Normaliza el array de geografía para asegurar exactamente 10 países
   * Sin sesgo por región - confía en los resultados de los modelos AI
   */
  private normalizeGeography(
    geography: Array<{
      country: string;
      country_code: string;
      percentage: number;
    }>
  ): Array<{ country: string; country_code: string; percentage: number }> {
    if (!geography || geography.length === 0) {
      // Si no hay países, retornar países comunes de Instagram como fallback
      return [
        { country: "United States", country_code: "US", percentage: 30 },
        { country: "United Kingdom", country_code: "GB", percentage: 15 },
        { country: "Canada", country_code: "CA", percentage: 10 },
        { country: "Australia", country_code: "AU", percentage: 8 },
        { country: "Germany", country_code: "DE", percentage: 7 },
        { country: "France", country_code: "FR", percentage: 6 },
        { country: "Spain", country_code: "ES", percentage: 5 },
        { country: "Italy", country_code: "IT", percentage: 4 },
        { country: "Brazil", country_code: "BR", percentage: 8 },
        { country: "Mexico", country_code: "MX", percentage: 7 },
      ];
    }

    // Ordenar por porcentaje (mayor a menor)
    const sorted = [...geography].sort((a, b) => b.percentage - a.percentage);

    // Tomar top 10
    const top10 = [...sorted.slice(0, 10)];

    // Si hay menos de 10, completar con países comunes de Instagram (sin sesgo regional)
    if (top10.length < 10) {
      const commonCountries = [
        { country: "United States", country_code: "US" },
        { country: "United Kingdom", country_code: "GB" },
        { country: "Canada", country_code: "CA" },
        { country: "Australia", country_code: "AU" },
        { country: "Germany", country_code: "DE" },
        { country: "France", country_code: "FR" },
        { country: "Spain", country_code: "ES" },
        { country: "Italy", country_code: "IT" },
        { country: "Brazil", country_code: "BR" },
        { country: "Mexico", country_code: "MX" },
        { country: "India", country_code: "IN" },
        { country: "Netherlands", country_code: "NL" },
        { country: "Argentina", country_code: "AR" },
        { country: "Colombia", country_code: "CO" },
        { country: "Japan", country_code: "JP" },
      ];

      const existingCodes = new Set(
        top10.map((g) => g.country_code.toUpperCase())
      );

      for (const common of commonCountries) {
        if (top10.length >= 10) break;
        if (!existingCodes.has(common.country_code)) {
          top10.push({
            country: common.country,
            country_code: common.country_code,
            percentage: 0.1, // Porcentaje mínimo, se normalizará
          });
          existingCodes.add(common.country_code);
        }
      }
    }

    // Normalizar porcentajes para que sumen 100
    const total = top10.reduce((sum, geo) => sum + (geo.percentage || 0), 0);

    if (total === 0) {
      // Si todos son 0, distribuir equitativamente
      const equalPercentage = 100 / top10.length;
      return top10.map((geo) => ({
        country: geo.country,
        country_code: geo.country_code.toUpperCase().substring(0, 2),
        percentage: Math.round(equalPercentage * 10) / 10,
      }));
    }

    const normalized = top10.map((geo) => ({
      country: geo.country,
      country_code: geo.country_code.toUpperCase().substring(0, 2),
      percentage: Math.round((geo.percentage / total) * 1000) / 10,
    }));

    // Ajustar redondeo para que sume exactamente 100
    const sum = normalized.reduce((s, geo) => s + geo.percentage, 0);
    if (Math.abs(sum - 100) > 0.01) {
      normalized[0].percentage += 100 - sum;
      normalized[0].percentage = Math.round(normalized[0].percentage * 10) / 10;
    }

    return normalized;
  }

  /**
   * Genera una bio profesional usando AI basándose en la información encontrada
   */
  private async generateBio(
    scrapedData: string
  ): Promise<{ bio: string; time: number; cost: number }> {
    const startTime = Date.now();
    console.log("✍️ [Service] Generating bio with AI...");

    const bioPrompt = `Basándote en la siguiente información sobre un perfil de Instagram, genera una biografía profesional y concisa para Instagram (máximo 2-3 oraciones).

Información:
{scraped_data}

Requisitos:
- ESCRIBIR EN ESPAÑOL (español de Argentina/México/España según el contexto)
- Ser profesional y atractiva
- Destacar el tema principal, nicho o propósito de la cuenta
- Incluir emojis relevantes si es apropiado
- Máximo 150 caracteres
- Si la información es insuficiente, crear una biografía genérica pero profesional basada en el contexto disponible
- Usar un tono natural y auténtico, como si fuera la propia biografía del influencer

Retorna SOLO el texto de la biografía, sin explicaciones adicionales ni formato.`;

    try {
      const chain = RunnableSequence.from([
        PromptTemplate.fromTemplate(bioPrompt),
        this.geminiModel,
      ]);

      const response = await chain.invoke({
        scraped_data: scrapedData,
      });

      // Extraer contenido de texto
      let bioContent: string;
      if (typeof response === "string") {
        bioContent = response;
      } else if (response && typeof response === "object") {
        // LangChain puede devolver diferentes formatos
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
              typeof item === "string"
                ? item
                : item?.text || item?.content || ""
            )
            .join("");
        } else {
          bioContent = JSON.stringify(response);
        }
      } else {
        bioContent = String(response);
      }

      // Limpiar la bio (remover markdown, espacios extra, etc.)
      const cleanBio = bioContent
        .replace(/```/g, "")
        .replace(/^["']|["']$/g, "")
        .trim()
        .substring(0, 150); // Limitar a 150 caracteres

      const elapsedTime = Date.now() - startTime;
      const estimatedInputTokens = this.estimateTokens(scrapedData);
      const estimatedOutputTokens = this.estimateTokens(cleanBio);
      const cost = this.estimateGeminiCost(
        estimatedInputTokens,
        estimatedOutputTokens
      );

      console.log(
        `✅ [Service] Bio generated in ${elapsedTime}ms (est. cost: $${cost.toFixed(
          6
        )}): ${cleanBio.substring(0, 50)}...`
      );
      return {
        bio: cleanBio || "Content creator",
        time: elapsedTime,
        cost,
      };
    } catch (error) {
      const elapsedTime = Date.now() - startTime;
      console.error(
        `❌ [Service] Error generating bio (${elapsedTime}ms):`,
        error
      );
      return {
        bio: "Content creator",
        time: elapsedTime,
        cost: 0,
      };
    }
  }

  private async aggregateResults(
    llamaResult: AudienceAnalysis | null,
    geminiResult: AudienceAnalysis | null,
    scrapedData: string,
    generatedBio: string
  ): Promise<{ result: AudienceAnalysis; time: number; cost: number }> {
    const startTime = Date.now();
    console.log("⚖️ [Service] Aggregating...");
    const chain = RunnableSequence.from([
      PromptTemplate.fromTemplate(AGGREGATOR_PROMPT),
      this.judgeModel,
      this.jsonParser,
    ]);

    try {
      const promptText = AGGREGATOR_PROMPT.replace(
        "{llama_data}",
        JSON.stringify(llamaResult)
      )
        .replace("{gemini_data}", JSON.stringify(geminiResult))
        .replace("{scraped_data}", scrapedData)
        .replace(
          "{format_instructions}",
          this.jsonParser.getFormatInstructions()
        );
      const estimatedInputTokens = this.estimateTokens(promptText);
      const estimatedOutputTokens = 600; // Estimación para respuesta JSON completa

      const res = await chain.invoke({
        llama_data: JSON.stringify(llamaResult),
        gemini_data: JSON.stringify(geminiResult),
        scraped_data: scrapedData,
        format_instructions: this.jsonParser.getFormatInstructions(),
      });

      const result = res as AudienceAnalysis;

      // Reemplazar la bio con la generada por AI
      result.bio = generatedBio;

      // Normalizar geografía para asegurar exactamente 10 países
      if (result.geography) {
        result.geography = this.normalizeGeography(result.geography);
      }

      const elapsedTime = Date.now() - startTime;
      const cost = this.estimateGeminiCost(
        estimatedInputTokens,
        estimatedOutputTokens
      );

      console.log(
        `✅ [Aggregator] Results aggregated in ${elapsedTime}ms (est. cost: $${cost.toFixed(
          6
        )})`
      );

      return {
        result,
        time: elapsedTime,
        cost,
      };
    } catch (e) {
      const elapsedTime = Date.now() - startTime;
      console.error(`❌ [Aggregator] Error after ${elapsedTime}ms:`, e);
      throw new Error("Aggregation failed");
    }
  }

  // --- MÉTODO PÚBLICO (ENTRY POINT) ---

  public async analyzeProfile(url: string): Promise<AudienceAnalysis> {
    const totalStartTime = Date.now();
    const costs = {
      tavily: 0, // Tavily free tier o muy bajo costo
      bioGeneration: 0,
      llamaAnalysis: 0,
      geminiAnalysis: 0,
      aggregation: 0,
    };
    const timings = {
      scraping: 0,
      bioGeneration: 0,
      llamaAnalysis: 0,
      geminiAnalysis: 0,
      aggregation: 0,
    };

    try {
      console.log(`\n🚀 [Service] Starting analysis for: ${url}`);
      console.log("=".repeat(60));

      // 1. Scrape profile data with Tavily
      const scrapingStart = Date.now();
      const scrapedData = await this.scrapeProfile(url);
      timings.scraping = Date.now() - scrapingStart;

      // 2. Run ALL AI operations in parallel (bio generation + both analyses)
      // This significantly reduces total time since they don't depend on each other
      console.log("🚀 [Service] Starting parallel AI operations...");
      const [bioResult, llamaAnalysis, geminiAnalysis] = await Promise.all([
        this.generateBio(scrapedData),
        this.analyzeWithLlama(scrapedData),
        this.analyzeWithGemini(scrapedData),
      ]);

      timings.bioGeneration = bioResult.time;
      timings.llamaAnalysis = llamaAnalysis.time;
      timings.geminiAnalysis = geminiAnalysis.time;
      costs.bioGeneration = bioResult.cost;
      costs.llamaAnalysis = llamaAnalysis.cost;
      costs.geminiAnalysis = geminiAnalysis.cost;

      // 4. Aggregate results (bio will be replaced with AI-generated one)
      const aggregationResult = await this.aggregateResults(
        llamaAnalysis.result,
        geminiAnalysis.result,
        scrapedData,
        bioResult.bio
      );

      timings.aggregation = aggregationResult.time;
      costs.aggregation = aggregationResult.cost;

      // Calcular totales
      const totalTime = Date.now() - totalStartTime;
      const totalCost =
        costs.tavily +
        costs.bioGeneration +
        costs.llamaAnalysis +
        costs.geminiAnalysis +
        costs.aggregation;

      // Logging detallado
      console.log("\n" + "=".repeat(60));
      console.log("📊 ANALYSIS SUMMARY");
      console.log("=".repeat(60));
      console.log(
        `⏱️  Total Time: ${totalTime}ms (${(totalTime / 1000).toFixed(2)}s)`
      );
      console.log(`💰 Total Estimated Cost: $${totalCost.toFixed(6)}`);
      console.log("\n📈 Breakdown:");
      console.log(
        `  🕷️  Tavily Scraping:     ${
          timings.scraping
        }ms (cost: $${costs.tavily.toFixed(6)})`
      );
      console.log(
        `  ✍️  Bio Generation:       ${
          timings.bioGeneration
        }ms (cost: $${costs.bioGeneration.toFixed(6)})`
      );
      console.log(
        `  🦙 LLaMA Analysis:        ${
          timings.llamaAnalysis
        }ms (cost: $${costs.llamaAnalysis.toFixed(6)})`
      );
      console.log(
        `  💎 Gemini Analysis:       ${
          timings.geminiAnalysis
        }ms (cost: $${costs.geminiAnalysis.toFixed(6)})`
      );
      console.log(
        `  ⚖️  Aggregation:           ${
          timings.aggregation
        }ms (cost: $${costs.aggregation.toFixed(6)})`
      );
      console.log("\n💡 Cost Breakdown:");
      console.log(
        `  - Bio Generation (Gemini): $${costs.bioGeneration.toFixed(6)}`
      );
      console.log(
        `  - LLaMA Analysis (Groq):   $${costs.llamaAnalysis.toFixed(6)}`
      );
      console.log(
        `  - Gemini Analysis:         $${costs.geminiAnalysis.toFixed(6)}`
      );
      console.log(
        `  - Aggregation (Gemini):    $${costs.aggregation.toFixed(6)}`
      );
      console.log(
        `  - Tavily Search:           $${costs.tavily.toFixed(6)} (free tier)`
      );
      console.log("=".repeat(60) + "\n");

      return aggregationResult.result;
    } catch (error) {
      const totalTime = Date.now() - totalStartTime;
      const totalCost =
        costs.tavily +
        costs.bioGeneration +
        costs.llamaAnalysis +
        costs.geminiAnalysis +
        costs.aggregation;

      console.error("\n" + "=".repeat(60));
      console.error("❌ ANALYSIS FAILED");
      console.error("=".repeat(60));
      console.error(`⏱️  Time before failure: ${totalTime}ms`);
      console.error(`💰 Cost before failure: $${totalCost.toFixed(6)}`);
      console.error(`❌ Error:`, error);
      console.error("=".repeat(60) + "\n");

      throw new Error("Failed to analyze profile");
    }
  }
}
