import { Campaign } from "@/types/campaign";
import { useRef, useEffect } from "react";
import { useCampaignInsights } from "@/hooks/use-campaign-insights";
import { MetricsEvolutionChart } from "./MetricsEvolutionChart";
import { CampaignInsightsCard } from "./CampaignInsightsCard";
import { useCampaignEvolutionData } from "./useCampaignEvolutionData";

interface CampaignChartsSectionProps {
  campaign: Campaign;
}

export const CampaignChartsSection = ({ campaign }: CampaignChartsSectionProps) => {
  // Hook para insights de campaña
  const { insights, loading, error, generateInsights, clearError } = useCampaignInsights();
  
  // Hook para datos de evolución
  const { evolutionData, evolutionLoading, hasAttemptedLoad, postsLoading, campaignPosts } = useCampaignEvolutionData(campaign.id);
  
  // Generar insights SOLO UNA VEZ al cargar el componente
  const hasGeneratedInsights = useRef(false);
  
  useEffect(() => {
    // Solo generar insights si la campaña tiene posts
    if (campaign.id && !insights && !loading && !hasGeneratedInsights.current && campaignPosts.length > 0) {
      hasGeneratedInsights.current = true;
      generateInsights(campaign.id);
    }
  }, [campaign.id, campaignPosts.length, insights, loading, generateInsights]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Gráfico de evolución de métricas */}
      <MetricsEvolutionChart
        evolutionData={evolutionData}
        evolutionLoading={evolutionLoading}
        postsLoading={postsLoading}
        hasAttemptedLoad={hasAttemptedLoad}
      />

      {/* Insights IA */}
      <CampaignInsightsCard
        insights={insights}
        loading={loading}
        error={error}
        postsLoading={postsLoading}
        campaignPosts={campaignPosts}
        onGenerateInsights={generateInsights}
        onClearError={clearError}
        campaignId={campaign.id}
      />
    </div>
  );
}; 