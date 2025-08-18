/**
 * Modelo de Roles para el sistema
 */

export interface Role {
  id: string;
  name: string;
  code: string;
  description?: string;
  permissions: string[];
  created_at: string;
  updated_at: string;
  is_system: boolean;
  is_default: boolean;
  level: number;
  metadata?: Record<string, any>;
}

export interface RoleCreateDTO {
  name: string;
  code: string;
  description?: string;
  permissions: string[];
  is_system?: boolean;
  is_default?: boolean;
  level?: number;
}

export interface RoleUpdateDTO {
  name?: string;
  description?: string;
  permissions?: string[];
  is_default?: boolean;
  level?: number;
  metadata?: Record<string, any>;
}

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  organization_id: string;
  team_id?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  expires_at?: string;
  custom_permissions?: string[];
  is_primary: boolean;
  metadata?: Record<string, any>;
}

export interface UserRoleCreateDTO {
  user_id: string;
  role_id: string;
  organization_id: string;
  team_id?: string;
  expires_at?: string;
  custom_permissions?: string[];
  is_primary?: boolean;
}

export interface UserRoleUpdateDTO {
  expires_at?: string;
  custom_permissions?: string[];
  is_primary?: boolean;
  metadata?: Record<string, any>;
}

// Lista de roles predefinidos del sistema
export const SystemRoles = {
  SUPER_ADMIN: 'super_admin',
  ORG_ADMIN: 'org_admin',
  CAMPAIGN_MANAGER: 'campaign_manager',
  ANALYST: 'analyst',
  READ_ONLY: 'read_only'
};

// Lista de permisos disponibles en el sistema
export const Permissions = {
  // Permisos de organización
  ORG_VIEW: 'organization:view',
  ORG_CREATE: 'organization:create',
  ORG_UPDATE: 'organization:update',
  ORG_DELETE: 'organization:delete',

  // Permisos de equipos
  TEAM_VIEW: 'team:view',
  TEAM_CREATE: 'team:create',
  TEAM_UPDATE: 'team:update',
  TEAM_DELETE: 'team:delete',

  // Permisos de usuarios
  USER_VIEW: 'user:view',
  USER_CREATE: 'user:create',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',

  // Permisos de roles
  ROLE_VIEW: 'role:view',
  ROLE_CREATE: 'role:create',
  ROLE_UPDATE: 'role:update',
  ROLE_DELETE: 'role:delete',

  // Permisos de campañas
  CAMPAIGN_VIEW: 'campaign:view',
  CAMPAIGN_CREATE: 'campaign:create',
  CAMPAIGN_UPDATE: 'campaign:update',
  CAMPAIGN_DELETE: 'campaign:delete',

  // Permisos de influencers
  INFLUENCER_VIEW: 'influencer:view',
  INFLUENCER_CREATE: 'influencer:create',
  INFLUENCER_UPDATE: 'influencer:update',
  INFLUENCER_DELETE: 'influencer:delete',

  // Permisos de facturación
  BILLING_VIEW: 'billing:view',
  BILLING_UPDATE: 'billing:update',

  // Permisos de tokens
  TOKEN_VIEW: 'token:view',
  TOKEN_PURCHASE: 'token:purchase',

  // Permisos de reportes
  REPORT_VIEW: 'report:view',
  REPORT_CREATE: 'report:create',
  REPORT_DELETE: 'report:delete',
  
  // Permisos de configuración
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_UPDATE: 'settings:update'
}; 