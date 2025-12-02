// Tipos base para usuarios
export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
  position: string | null;
  company: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  bio: string | null;
  preferences: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// Tipos para miembros de organización
export interface OrganizationMember {
  id: string;
  membership_id: string;
  user_id: string;
  organization_id: string;
  org_role: 'admin' | 'member' | 'viewer';
  permissions: Record<string, any> | null;
  joined_at: string;
  
  // Datos del perfil del usuario
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  profile_role: string | null;
  position: string | null;
  company: string | null;
}

// Tipos para roles y permisos
export type UserRole = 'admin' | 'member' | 'viewer';

export interface UserPermissions {
  // Permisos de campañas
  'campaigns.read': boolean;
  'campaigns.write': boolean;
  'campaigns.delete': boolean;
  'campaigns.manage_team': boolean;
  
  // Permisos de análisis
  'analytics.view': boolean;
  'analytics.export': boolean;
  
  // Permisos de influencers
  'influencers.read': boolean;
  'influencers.write': boolean;
  'influencers.contact': boolean;
  
  // Permisos de usuarios
  'users.read': boolean;
  'users.invite': boolean;
  'users.manage_roles': boolean;
  
  // Permisos de organización
  'organization.manage': boolean;
  'organization.billing': boolean;
  'organization.settings': boolean;
}

// Tipos para formularios y acciones
export interface InviteUserData {
  email: string;
  full_name: string;
  role: UserRole;
  message?: string;
  brand_ids?: string[];
}

export interface UpdateUserRoleData {
  userId: string;
  role: UserRole;
  permissions?: Partial<UserPermissions>;
}

export interface UserListFilters {
  search?: string;
  role?: UserRole | 'all';
  status?: 'active' | 'inactive' | 'all';
  team?: string | 'all';
}

// Tipos para respuestas de la API
export interface GetMembersResponse {
  members: OrganizationMember[];
  total: number;
  page: number;
  limit: number;
}

export interface UserActivityLog {
  id: string;
  user_id: string;
  action: string;
  description: string;
  metadata: Record<string, any> | null;
  created_at: string;
}

// Tipos para estadísticas de usuarios
export interface UserStats {
  total_members: number;
  active_members: number;
  pending_invitations: number;
  admins: number;
  members: number;
  viewers: number;
}

// Tipos para equipos
export interface Team {
  id: string;
  name: string;
  description: string | null;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'lead' | 'member';
  joined_at: string;
  
  // Datos del usuario
  user: UserProfile;
}

// Tipo para asignación de usuarios a campañas
export interface CampaignAssignment {
  id: string;
  campaign_id: string;
  user_id: string;
  role: 'manager' | 'analyst' | 'viewer';
  permissions: string[];
  assigned_at: string;
  assigned_by: string;
} 