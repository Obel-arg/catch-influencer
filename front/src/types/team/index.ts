export interface Team {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  status: "active" | "inactive" | "archived";
  type: "internal" | "external" | "hybrid";
  members: TeamMember[];
  roles: TeamRole[];
  settings: {
    permissions: {
      [key: string]: string[];
    };
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    features: {
      [key: string]: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  roleId: string;
  status: "active" | "invited" | "suspended";
  permissions: string[];
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamRole {
  id: string;
  teamId: string;
  name: string;
  description?: string;
  permissions: string[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamInvitation {
  id: string;
  teamId: string;
  email: string;
  roleId: string;
  status: "pending" | "accepted" | "rejected" | "expired";
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTeamDto {
  name: string;
  description?: string;
  type: "internal" | "external" | "hybrid";
  settings?: {
    permissions?: {
      [key: string]: string[];
    };
    notifications?: {
      email?: boolean;
      push?: boolean;
      sms?: boolean;
    };
    features?: {
      [key: string]: boolean;
    };
  };
}

export interface CreateTeamMemberDto {
  userId: string;
  roleId: string;
  permissions?: string[];
}

export interface CreateTeamRoleDto {
  name: string;
  description?: string;
  permissions: string[];
  isDefault?: boolean;
}

export interface CreateTeamInvitationDto {
  email: string;
  roleId: string;
  expiresAt?: Date;
} 