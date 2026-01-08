import { z } from "zod";

// Esquema de salida final
export const AudienceAnalysisSchema = z.object({
  bio: z.string(),
  username: z.string(),
  age: z.object({
    "13-17": z.number(),
    "18-24": z.number(),
    "25-34": z.number(),
    "35-44": z.number(),
    "45-54": z.number(),
    "55+": z.number(),
  }),
  gender: z.object({
    male: z.number(),
    female: z.number(),
  }),
  geography: z.array(
    z.object({
      country: z.string(),
      country_code: z.string().length(2),
      percentage: z.number(),
    })
  ),
});

export type AudienceAnalysis = z.infer<typeof AudienceAnalysisSchema>;

// Estado del Grafo
export interface GraphState {
  instagramUrl: string; // Keep for backward compatibility
  platform: string; // Social media platform (instagram, youtube, tiktok, etc.)
  rawScrapedData: string;
  llamaAnalysis: Partial<AudienceAnalysis> | null;
  geminiAnalysis: Partial<AudienceAnalysis> | null;
  finalResult: AudienceAnalysis | null;
  // Debate fields
  debateHistory: Array<{
    round: number;
    llamaArgument?: string;
    geminiArgument?: string;
  }>;
  round: number;
  consensus: boolean;
  // Parallel execution fields
  generatedBio: string | null;
  searchContext?: any; // SearchContext type
  // Cost tracking
  costs: {
    tavily: number;
    bioGeneration: number;
    llamaAnalysis: number;
    geminiAnalysis: number;
    debate: number;
    aggregation: number;
  };
  // Timing tracking
  timings: {
    scraping: number;
    bioGeneration: number;
    llamaAnalysis: number;
    geminiAnalysis: number;
    debate: number;
    aggregation: number;
  };
}
