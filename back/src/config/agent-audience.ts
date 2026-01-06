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
  instagramUrl: string;
  rawScrapedData: string;
  llamaAnalysis: Partial<AudienceAnalysis> | null;
  geminiAnalysis: Partial<AudienceAnalysis> | null;
  finalResult: AudienceAnalysis | null;
}
