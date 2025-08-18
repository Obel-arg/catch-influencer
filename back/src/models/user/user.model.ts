export interface User {
  id: string;
  email: string;
  password?: string;
  full_name?: string;
  name?: string;
  avatar_url?: string;
  role?: string;
  organization_id?: string;
  preferences?: {
    theme?: 'light' | 'dark';
    language?: string;
    notifications?: {
      email?: boolean;
      push?: boolean;
      marketing?: boolean;
    };
    dashboard_layout?: Record<string, any>;
  };
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface UserCreateDTO {
  email: string;
  password: string;
  full_name?: string;
  name?: string;
  avatar_url?: string;
  role?: string;
  organization_id?: string;
  preferences?: {
    theme?: 'light' | 'dark';
    language?: string;
    notifications?: {
      email?: boolean;
      push?: boolean;
      marketing?: boolean;
    };
    dashboard_layout?: Record<string, any>;
  };
}

export interface UserUpdateDTO extends Partial<UserCreateDTO> {
  email?: string;
  password?: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    marketing: boolean;
  };
  dashboard_layout: Record<string, any>;
}

export interface UserSettings {
  phone?: string;
  company?: string;
  position?: string;
  address?: string;
  city?: string;
  two_factor_enabled: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
}

export interface UserLoginDTO {
  email: string;
  password: string;
} 