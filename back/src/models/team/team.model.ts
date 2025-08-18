export interface Team {
  id: string;
  name: string;
  description?: string;
  organization_id: string;
  created_by: string;
  status: 'active' | 'inactive' | 'archived';
  settings?: {
    visibility?: 'public' | 'private';
    permissions?: {
      can_invite?: boolean;
      can_edit?: boolean;
      can_delete?: boolean;
    };
    notifications?: {
      email?: boolean;
      push?: boolean;
    };
  };
  metadata?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface TeamCreateDTO {
  name: string;
  description?: string;
  organization_id: string;
  settings?: {
    visibility?: 'public' | 'private';
    permissions?: {
      can_invite?: boolean;
      can_edit?: boolean;
      can_delete?: boolean;
    };
    notifications?: {
      email?: boolean;
      push?: boolean;
    };
  };
  metadata?: Record<string, any>;
}

export interface TeamUpdateDTO extends Partial<TeamCreateDTO> {
  status?: 'active' | 'inactive' | 'archived';
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'admin' | 'member' | 'viewer';
  status: 'active' | 'inactive' | 'pending';
  permissions?: {
    can_edit?: boolean;
    can_delete?: boolean;
    can_invite?: boolean;
  };
  created_at: Date;
  updated_at: Date;
}

export interface TeamMemberCreateDTO {
  team_id: string;
  user_id: string;
  role: 'admin' | 'member' | 'viewer';
  permissions?: {
    can_edit?: boolean;
    can_delete?: boolean;
    can_invite?: boolean;
  };
}

export interface TeamMemberUpdateDTO extends Partial<TeamMemberCreateDTO> {
  status?: 'active' | 'inactive' | 'pending';
} 