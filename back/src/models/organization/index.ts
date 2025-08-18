export interface Organization {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface OrganizationMember {
  organization_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  created_at: Date;
  updated_at: Date;
}

export interface CreateOrganizationDTO {
  name: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
} 