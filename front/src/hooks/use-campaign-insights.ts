import { useState, useCallback, useRef } from 'react';
import { Campaign } from '@/types/campaign';

export interface CampaignInsight {
  title: string;
  description: string;
  type: 'performance' | 'audience' | 'content' | 'strategy' | 'opportunity';
  confidence: number;
  actionable: boolean;
  recommendation?: string;
}

export interface CampaignInsightsResult {
  insights: CampaignInsight[];
  summary: string;
  processingTime: number;
  modelUsed: string;
}

interface UseCampaignInsightsReturn {
  insights: CampaignInsightsResult | null;
  loading: boolean;
  error: string | null;
  generateInsights: (campaignId: string) => Promise<void>;
  clearError: () => void;
  clearInsights: () => void;
}

export const useCampaignInsights = (): UseCampaignInsightsReturn => {
  const [insights, setInsights] = useState<CampaignInsightsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const generatedCampaignId = useRef<string | null>(null);

  const generateInsights = useCallback(async (campaignId: string) => {

    if (insights || loading || generatedCampaignId.current) {
      return;
    }


    setLoading(true);
    setError(null);
    generatedCampaignId.current = campaignId; // Marcar inmediatamente

    try {


      // Forzar la ruta sin /v1 ni variables de entorno
      const response = await fetch(`/api/campaign-insights/${campaignId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });


      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error:', errorText);
        throw new Error(`Error ${response.status}: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();



      if (data.success) {
        setInsights(data.data);
      } else {
        throw new Error(data.error || 'Error generando insights');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('❌ Error completo:', err);
      setError(errorMessage);

      // Si hay error, resetear el campaignId para permitir reintentar
      generatedCampaignId.current = null;
    } finally {
      setLoading(false);
    }
  }, [insights, loading]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearInsights = useCallback(() => {
    setInsights(null);
    generatedCampaignId.current = null;
  }, []);

  return {
    insights,
    loading,
    error,
    generateInsights,
    clearError,
    clearInsights,
  };
};