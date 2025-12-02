export interface CampaignShareToken {
  id: string;
  campaign_id: string;
  share_token: string;
  created_at: Date;
  created_by?: string;
}

export interface CampaignShareTokenCreateDTO {
  campaign_id: string;
  share_token: string;
  created_by?: string;
}
