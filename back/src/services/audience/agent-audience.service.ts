import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { AudienceAnalysis, GraphState } from "../../config/agent-audience";
import { tavily } from "@tavily/core";
import * as dotenv from "dotenv";
import * as fs from "fs/promises";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";
import { config } from "../../config/environment";
import {
  CostEntry,
  AgenticAudienceInferenceDB,
  SearchContext,
  InferenceOptions,
  InferenceResult,
  SupportedPlatform,
} from "../../models/audience/openai-audience-inference.model";
import { BaseAudienceService } from "./base-audience.service";
import {
  createAudienceGraph,
  GraphNodeContext,
} from "../../config/agent-audience-graph";

dotenv.config();

export class AgentAudienceService extends BaseAudienceService {
  private llamaModel: ChatGroq;
  private geminiModel: ChatGoogleGenerativeAI;
  private judgeModel: ChatGoogleGenerativeAI;
  private jsonParser: JsonOutputParser<AudienceAnalysis>;
  private tavilyClient: ReturnType<typeof tavily>;
  private supabase: ReturnType<typeof createClient>;

  constructor() {
    super();
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

    // Inicializar cliente de Supabase
    this.supabase = createClient(
      config.supabase.url || "",
      config.supabase.anonKey || ""
    );
  }

  // --- MÉTODOS PRIVADOS ---

  /**
   * Detect platform from URL
   */
  private detectPlatformFromUrl(url: string): SupportedPlatform {
    const urlLower = url.toLowerCase();
    if (urlLower.includes("instagram.com")) {
      return "instagram";
    }
    if (urlLower.includes("youtube.com") || urlLower.includes("youtu.be")) {
      return "youtube";
    }
    if (urlLower.includes("tiktok.com")) {
      return "tiktok";
    }
    if (urlLower.includes("twitter.com") || urlLower.includes("x.com")) {
      return "twitter";
    }
    if (urlLower.includes("twitch.tv")) {
      return "twitch";
    }
    if (urlLower.includes("threads.net")) {
      return "threads";
    }
    // Default to instagram for backward compatibility
    return "instagram";
  }

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

  /**
   * Get log file path (use /tmp in production for writable filesystem)
   */
  private getLogFilePath(): string {
    const isProduction =
      process.env.NODE_ENV === "production" || process.env.VERCEL;

    if (isProduction) {
      // Use /tmp directory in serverless environments (writable)
      return "/tmp/agent-audience-costs.log";
    } else {
      // Use configured path in development
      return path.join(process.cwd(), "logs", "agent-audience-costs.log");
    }
  }

  private async recordCost(entry: CostEntry): Promise<void> {
    try {
      const logFile = this.getLogFilePath();
      const logDir = path.dirname(logFile);

      // Ensure log directory exists (ignore errors in production)
      await fs.mkdir(logDir, { recursive: true }).catch(() => {});

      const line = `${entry.timestamp.toISOString()},${entry.operation},${
        entry.cost
      },${entry.model},${entry.success ? "success" : "failed"},${
        entry.url || ""
      }\n`;
      await fs.appendFile(logFile, line);
    } catch (error) {
      // Don't fail the request if cost tracking fails
      console.warn("Cost tracking warning:", error);
    }
  }

  /**
   * Database cache methods
   */

  /**
   * Check database for cached inference
   */
  private async checkDatabaseCache(
    url: string,
    platform: SupportedPlatform,
    influencerId?: string,
    searchContext?: SearchContext
  ): Promise<AgenticAudienceInferenceDB | null> {
    try {
      console.log(`[Cache Check] Starting database cache check`);
      console.log(`[Cache Check] URL: ${url}`);
      console.log(`[Cache Check] Platform: ${platform}`);
      console.log(`[Cache Check] Influencer ID: ${influencerId || "none"}`);
      console.log(`[Cache Check] Search Context:`, searchContext);

      let query = this.supabase
        .from("agentic_audience_inferences")
        .select("*")
        .eq("url", url)
        .eq("platform", platform);

      // Add influencer_id filter if provided
      if (influencerId && this.isValidUUID(influencerId)) {
        query = query.eq("influencer_id", influencerId);
      }

      // Add search context filters if provided
      if (searchContext?.creator_location) {
        query = query.eq("creator_location", searchContext.creator_location);
      } else {
        // Match entries with no creator_location
        query = query.is("creator_location", null);
      }

      const { data, error } = await query
        .order("inferred_at", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.log(`[Cache Check] Query error:`, error.message);
        return null;
      }

      if (!data) {
        console.log(`[Cache Check] No data found in database`);
        return null;
      }

      console.log(`[Cache Check] Found entry:`, {
        url: data.url,
        platform: data.platform,
        inferred_at: data.inferred_at,
        expires_at: data.expires_at,
        model_used: data.model_used,
      });

      // Check if expired - ensure proper date comparison
      const expiresAt = new Date(data.expires_at as string);
      const now = new Date();

      console.log(`[Cache Check] Expiration check:`);
      console.log(`[Cache Check]   Expires: ${expiresAt.toISOString()}`);
      console.log(`[Cache Check]   Now:     ${now.toISOString()}`);
      console.log(`[Cache Check]   Expired: ${expiresAt < now}`);

      if (expiresAt < now) {
        console.log(`[Cache Check] ❌ Cache EXPIRED - will re-scrape`);
        return null;
      }

      const daysUntilExpiry = Math.ceil(
        (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      console.log(
        `[Cache Check] ✅ Cache HIT - valid for ${daysUntilExpiry} more days`
      );

      return {
        ...data,
        inferred_at: new Date(data.inferred_at as string),
        expires_at: expiresAt,
        created_at: new Date(data.created_at as string),
        updated_at: new Date(data.updated_at as string),
      } as AgenticAudienceInferenceDB;
    } catch (error) {
      console.error("[Cache Check] Error:", error);
      return null;
    }
  }

  /**
   * Validate if string is a valid UUID
   */
  private isValidUUID(str: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }

  /**
   * Store inference result to database
   */
  private async storeToDatabase(
    url: string,
    username: string,
    platform: SupportedPlatform,
    demographics: AudienceAnalysis,
    influencerId?: string,
    cost: number = 0.05,
    profileSnapshot?: Partial<any>,
    searchContext?: SearchContext
  ): Promise<void> {
    try {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days

      // Validate influencer_id is a valid UUID before including it
      const validInfluencerId =
        influencerId && this.isValidUUID(influencerId) ? influencerId : null;

      const record: any = {
        url: url,
        username: username,
        platform: platform,
        audience_demographics: demographics,
        audience_geography: demographics.geography,
        model_used: "agent-audience", // Custom model identifier for this service
        profile_data_snapshot: profileSnapshot || null,
        inferred_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        api_cost: cost,
        // Store search context
        search_context: searchContext || null,
        creator_location: searchContext?.creator_location || null,
        target_audience_geo: searchContext?.target_audience_geo || null,
        // Store bio as description for PDF export
        description: demographics.bio || null,
      };

      // Only add influencer_id if it's a valid UUID
      if (validInfluencerId) {
        record.influencer_id = validInfluencerId;
      }

      // Check if entry exists with same URL + platform + context
      const existing = await this.checkDatabaseCache(
        url,
        platform,
        validInfluencerId || undefined,
        searchContext
      );

      if (existing) {
        // Update existing record
        const { error } = await this.supabase
          .from("agentic_audience_inferences")
          .update(record)
          .eq("id", existing.id);

        if (error) {
          console.error("  Error updating database:", error);
        } else {
          console.log(
            `  ✅ Updated database: ${url} (platform: ${platform})${
              validInfluencerId ? ` (influencer: ${validInfluencerId})` : ""
            }`
          );
        }
      } else {
        // Insert new record
        const { error } = await this.supabase
          .from("agentic_audience_inferences")
          .insert(record);

        if (error) {
          console.error("  Error inserting to database:", error);
        } else {
          console.log(
            `  ✅ Inserted to database: ${url} (platform: ${platform})${
              validInfluencerId ? ` (influencer: ${validInfluencerId})` : ""
            }`
          );
        }
      }
    } catch (error) {
      console.error("  Error storing to database:", error);
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

  // --- MÉTODO PÚBLICO (ENTRY POINT) ---

  async inferAudience(
    url: string,
    options: InferenceOptions = {}
  ): Promise<InferenceResult> {
    const totalStartTime = Date.now();
    const costs = {
      tavily: 0, // Tavily free tier o muy bajo costo
      bioGeneration: 0,
      llamaAnalysis: 0,
      geminiAnalysis: 0,
      debate: 0,
      aggregation: 0,
    };
    const timings = {
      scraping: 0,
      bioGeneration: 0,
      llamaAnalysis: 0,
      geminiAnalysis: 0,
      debate: 0,
      aggregation: 0,
    };

    try {
      // Detect platform from URL if not provided
      const platform = options.platform || this.detectPlatformFromUrl(url);
      
      console.log(`\n🚀 [Service] Starting analysis for: ${url} (platform: ${platform})`);
      console.log("=".repeat(60));

      // Check database cache first (unless force refresh or skip cache)
      if (!options.forceRefresh && !options.skipCache) {
        const dbCached = await this.checkDatabaseCache(
          url,
          platform,
          options.influencerId,
          options.searchContext
        );
        if (dbCached) {
          console.log(`✅ Database cache hit: ${url} (platform: ${platform})`);
          return {
            success: true,
            demographics: {
              inference_source: "agentic",
              model_used: dbCached.model_used,
              inferred_at: dbCached.inferred_at,
              ...dbCached.audience_demographics,
            },
            description: (dbCached as any).description || undefined,
            cached: true,
            cost: 0,
          };
        }
      }

      // If skipGeneration is true and no cache found, return early
      if (options.skipGeneration) {
        console.log(
          `⏭️ Skip generation mode - no cache found for: ${url} (platform: ${platform})`
        );
        return {
          success: true,
          cached: false,
          cost: 0,
        };
      }

      // Initialize graph context
      const graphContext: GraphNodeContext = {
        llamaModel: this.llamaModel,
        geminiModel: this.geminiModel,
        judgeModel: this.judgeModel,
        jsonParser: this.jsonParser,
        tavilyClient: this.tavilyClient,
        searchContext: options.searchContext,
        platform: platform,
      };

      // Create and compile graph
      const graph = createAudienceGraph(graphContext);

      // Initialize state
      const initialState: GraphState = {
        instagramUrl: url, // Keep for backward compatibility with graph state
        platform: platform,
        rawScrapedData: "",
        llamaAnalysis: null,
        geminiAnalysis: null,
        finalResult: null,
        debateHistory: [],
        round: 0,
        consensus: false,
        generatedBio: null,
        searchContext: options.searchContext,
        costs: {
          tavily: 0,
          bioGeneration: 0,
          llamaAnalysis: 0,
          geminiAnalysis: 0,
          debate: 0,
          aggregation: 0,
        },
        timings: {
          scraping: 0,
          bioGeneration: 0,
          llamaAnalysis: 0,
          geminiAnalysis: 0,
          debate: 0,
          aggregation: 0,
        },
      };

      // Execute graph with LangSmith metadata
      console.log("🚀 [Service] Starting LangGraph execution...");

      // Extract username for better run identification in LangSmith (platform-agnostic)
      const usernameMatch = url.match(/\/([^/?]+)/);
      const username = usernameMatch ? usernameMatch[1] : "unknown";

      // Configure LangSmith run metadata
      // LangGraph automatically sends traces to LangSmith when LANGCHAIN_TRACING_V2=true
      // The config object allows us to add metadata that will appear in LangSmith dashboard
      const runConfig = {
        configurable: {
          thread_id: `audience-${username}-${Date.now()}`,
        },
        // Metadata for LangSmith (will appear in dashboard)
        metadata: {
          runName: `audience-analysis-${username}`,
          tags: [
            "agent-audience",
            "langgraph",
            options.influencerId ? "with-influencer-id" : "no-influencer-id",
            options.searchContext?.creator_location
              ? `location-${options.searchContext.creator_location}`
              : "no-location",
          ],
          url,
          platform,
          username,
          influencerId: options.influencerId || null,
          hasSearchContext: !!options.searchContext,
          creatorLocation: options.searchContext?.creator_location || null,
          forceRefresh: options.forceRefresh || false,
        },
      };

      const finalState = await graph.invoke(initialState, runConfig);

      // Extract results from final state
      if (!finalState.finalResult) {
        throw new Error("Graph execution failed - no final result");
      }

      // Normalize geography - ensure it always exists
      const result = finalState.finalResult;
      if (!result.geography || result.geography.length === 0) {
        console.warn("⚠️ [Service] No geography in result, using fallback");
        result.geography = this.normalizeGeography([]);
      } else {
        result.geography = this.normalizeGeography(result.geography);
      }

      // Extract timings and estimate costs
      const stateTimings = finalState.timings || {};
      timings.scraping = stateTimings.scraping || 0;
      timings.bioGeneration = stateTimings.bioGeneration || 0;
      timings.llamaAnalysis = stateTimings.llamaAnalysis || 0;
      timings.geminiAnalysis = stateTimings.geminiAnalysis || 0;
      timings.debate = stateTimings.debate || 0;
      timings.aggregation = stateTimings.aggregation || 0;

      // Estimate costs based on timings and token estimates
      // Note: This is approximate - in production you'd track actual tokens
      const scrapedDataStr = finalState.rawScrapedData || "";
      const generatedBioStr = finalState.generatedBio || "";
      const llamaAnalysisStr = finalState.llamaAnalysis
        ? JSON.stringify(finalState.llamaAnalysis)
        : "";
      const geminiAnalysisStr = finalState.geminiAnalysis
        ? JSON.stringify(finalState.geminiAnalysis)
        : "";

      costs.bioGeneration = this.estimateGeminiCost(
        this.estimateTokens(scrapedDataStr),
        this.estimateTokens(generatedBioStr)
      );
      costs.llamaAnalysis = this.estimateGroqCost(
        this.estimateTokens(scrapedDataStr),
        500
      );
      costs.geminiAnalysis = this.estimateGeminiCost(
        this.estimateTokens(scrapedDataStr),
        500
      );
      costs.debate =
        this.estimateGroqCost(1000, 300) + this.estimateGeminiCost(1000, 300);
      costs.aggregation = this.estimateGeminiCost(
        this.estimateTokens(
          llamaAnalysisStr + geminiAnalysisStr + scrapedDataStr
        ),
        600
      );

      // Registrar costos por modelo/operación
      await Promise.all([
        this.recordCost({
          timestamp: new Date(),
          operation: "tavily_scrape",
          cost: costs.tavily,
          model: "tavily",
          success: true,
          url: url,
        }),
        this.recordCost({
          timestamp: new Date(),
          operation: "bio_generation",
          cost: costs.bioGeneration,
          model: "gemini-2.5-flash",
          success: true,
          url: url,
        }),
        this.recordCost({
          timestamp: new Date(),
          operation: "llama_analysis",
          cost: costs.llamaAnalysis,
          model: "llama-3.1-8b-instant",
          success: true,
          url: url,
        }),
        this.recordCost({
          timestamp: new Date(),
          operation: "gemini_analysis",
          cost: costs.geminiAnalysis,
          model: "gemini-2.5-flash",
          success: true,
          url: url,
        }),
        this.recordCost({
          timestamp: new Date(),
          operation: "debate",
          cost: costs.debate,
          model: "multi-model",
          success: true,
          url: url,
        }),
        this.recordCost({
          timestamp: new Date(),
          operation: "aggregation",
          cost: costs.aggregation,
          model: "gemini-2.5-flash",
          success: true,
          url: url,
        }),
      ]);

      // Calcular totales
      const totalTime = Date.now() - totalStartTime;
      const totalCost =
        costs.tavily +
        costs.bioGeneration +
        costs.llamaAnalysis +
        costs.geminiAnalysis +
        costs.debate +
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
        `  💬 Debate:                 ${
          timings.debate
        }ms (cost: $${costs.debate.toFixed(6)})`
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
      console.log(`  - Debate (Multi-model):    $${costs.debate.toFixed(6)}`);
      console.log(
        `  - Aggregation (Gemini):    $${costs.aggregation.toFixed(6)}`
      );
      console.log(
        `  - Tavily Search:           $${costs.tavily.toFixed(6)} (free tier)`
      );
      console.log("=".repeat(60) + "\n");

      // Store to database
      if (!options.skipCache) {
        await this.storeToDatabase(
          url,
          result.username || "",
          platform,
          result,
          options.influencerId,
          totalCost,
          undefined, // No profile snapshot needed
          options.searchContext
        );
      }

      return {
        success: true,
        demographics: {
          inference_source: "agentic",
          model_used: "agent-audience",
          inferred_at: new Date(),
          is_synthetic: false,
          ...result,
        },
        description: result.bio,
        cached: false,
        cost: totalCost,
      };
    } catch (error) {
      const totalTime = Date.now() - totalStartTime;
      const totalCost =
        costs.tavily +
        costs.bioGeneration +
        costs.llamaAnalysis +
        costs.geminiAnalysis +
        costs.debate +
        costs.aggregation;

      console.error("\n" + "=".repeat(60));
      console.error("❌ ANALYSIS FAILED");
      console.error("=".repeat(60));
      console.error(`⏱️  Time before failure: ${totalTime}ms`);
      console.error(`💰 Cost before failure: $${totalCost.toFixed(6)}`);
      console.error(`❌ Error:`, error);
      console.error("=".repeat(60) + "\n");

      await this.recordCost({
        timestamp: new Date(),
        operation: "pipeline_failure",
        cost: totalCost,
        model: "agent-audience",
        success: false,
        url: url,
      });

      return {
        success: false,
        error: (error as Error).message,
        details: error,
        cost: totalCost,
      };
    }
  }
}
