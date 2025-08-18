export interface Organization {
  id: string;
  name: string;
  description: string;
  logo?: string;
  website?: string;
  industry?: string;
  size?: "small" | "medium" | "large" | "enterprise";
  status: "active" | "inactive" | "pending";
  settings: {
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    privacy: {
      publicProfile: boolean;
      showMetrics: boolean;
      showTeam: boolean;
    };
    features: {
      [key: string]: boolean;
    };
  };
  subscription: {
    plan: "free" | "basic" | "pro" | "enterprise";
    status: "active" | "canceled" | "expired";
    startDate: Date;
    endDate: Date;
    features: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: "owner" | "admin" | "member" | "viewer";
  status: "active" | "invited" | "suspended";
  permissions: string[];
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationInvitation {
  id: string;
  organizationId: string;
  email: string;
  role: "admin" | "member" | "viewer";
  status: "pending" | "accepted" | "rejected" | "expired";
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationSettings {
  id: string;
  organizationId: string;
  settings: {
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    privacy: {
      publicProfile: boolean;
      showMetrics: boolean;
      showTeam: boolean;
    };
    features: {
      [key: string]: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationMetrics {
  id: string;
  organizationId: string;
  totalCampaigns: number;
  activeCampaigns: number;
  totalInfluencers: number;
  totalBudget: number;
  totalEngagement: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrganizationDto {
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  industry?: string;
  size?: string;
}

export interface UpdateOrganizationDto extends Partial<CreateOrganizationDto> {} 