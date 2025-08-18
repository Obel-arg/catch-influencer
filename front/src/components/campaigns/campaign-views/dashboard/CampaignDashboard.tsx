import { Campaign } from "@/types/campaign";
import { CampaignProgressSection } from "./CampaignProgressSection";
import { CampaignMetricsCards } from "./CampaignMetricsCards";
import { CampaignChartsSection } from "./CampaignChartsSection";
import { CampaignPlatformsSection } from "./CampaignPlatformsSection";
import { CampaignStatsSection } from "./CampaignStatsSection";

interface CampaignDashboardProps {
  campaign: Campaign;
}

export const CampaignDashboard = ({ campaign }: CampaignDashboardProps) => {
  return (
    <div className="space-y-6">
      <CampaignProgressSection campaign={campaign} />
      <CampaignMetricsCards campaign={campaign} />
      <CampaignChartsSection campaign={campaign} />
      <CampaignPlatformsSection campaign={campaign} />
      <CampaignStatsSection campaign={campaign} />
    </div>
  );
}; 