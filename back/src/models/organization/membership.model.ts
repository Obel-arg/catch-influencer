/**
 * Modelo de Membresías de Organización
 */

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role_id: string;
  joined_at: string;
  invited_by?: string;
  status: 'active' | 'invited' | 'suspended';
  custom_permissions?: string[];
  created_at: string;
  updated_at: string;
  is_owner: boolean;
  last_active_at?: string;
  user_settings?: Record<string, any>;
  primary?: boolean;
}

export interface OrganizationMemberCreateDTO {
  organization_id: string;
  user_id: string;
  role_id: string;
  invited_by?: string;
  custom_permissions?: string[];
  is_owner?: boolean;
  primary?: boolean;
}

export interface OrganizationMemberUpdateDTO {
  role_id?: string;
  status?: 'active' | 'invited' | 'suspended';
  custom_permissions?: string[];
  is_owner?: boolean;
  user_settings?: Record<string, any>;
  primary?: boolean;
}

export interface OrganizationInvitation {
  id: string;
  organization_id: string;
  email: string;
  role_id: string;
  token: string;
  invited_by: string;
  created_at: string;
  expires_at: string;
  accepted_at?: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  custom_permissions?: string[];
  message?: string;
}

export interface OrganizationInvitationCreateDTO {
  organization_id: string;
  email: string;
  role_id: string;
  invited_by: string;
  expires_at?: string;
  custom_permissions?: string[];
  message?: string;
} 