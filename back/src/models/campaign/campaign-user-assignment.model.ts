export interface CampaignUserAssignment {
  id: string;
  campaign_id: string;
  user_id: string;
  assigned_by?: string;
  assigned_at: string;
  status: 'active' | 'inactive' | 'removed';
  created_at: string;
  updated_at: string;
}

export interface CampaignUserAssignmentCreateDTO {
  campaign_id: string;
  user_id: string;
  assigned_by?: string;
  status?: 'active' | 'inactive' | 'removed';
}

export interface CampaignUserAssignmentUpdateDTO {
  status?: 'active' | 'inactive' | 'removed';
}

export interface CampaignUserAssignmentWithDetails extends CampaignUserAssignment {
  campaign?: {
    id: string;
    name: string;
    description?: string;
    status: string;
  };
  user?: {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
  assigned_by_user?: {
    id: string;
    email: string;
    full_name?: string;
  };
} 