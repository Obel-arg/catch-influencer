/**
 * Modelo de Equipos
 */

export interface Team {
  id: string;
  name: string;
  description?: string;
  organization_id: string;
  logo_url?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  is_active: boolean;
  settings?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface TeamCreateDTO {
  name: string;
  description?: string;
  organization_id: string;
  logo_url?: string;
  settings?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface TeamUpdateDTO {
  name?: string;
  description?: string;
  logo_url?: string;
  is_active?: boolean;
  settings?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role_id: string;
  joined_at: string;
  invited_by?: string;
  status: 'active' | 'invited' | 'suspended';
  custom_permissions?: string[];
  created_at: string;
  updated_at: string;
}

export interface TeamMemberCreateDTO {
  team_id: string;
  user_id: string;
  role_id: string;
  invited_by?: string;
  custom_permissions?: string[];
}

export interface TeamMemberUpdateDTO {
  role_id?: string;
  status?: 'active' | 'invited' | 'suspended';
  custom_permissions?: string[];
}

export interface TeamInvitation {
  id: string;
  team_id: string;
  email: string;
  role_id: string;
  token: string;
  invited_by: string;
  created_at: string;
  expires_at: string;
  accepted_at?: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  custom_permissions?: string[];
}

export interface TeamInvitationCreateDTO {
  team_id: string;
  email: string;
  role_id: string;
  invited_by: string;
  expires_at?: string;
  custom_permissions?: string[];
} 