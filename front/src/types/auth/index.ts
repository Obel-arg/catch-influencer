export interface User {
  id?: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role?: string;
  phone?: string;
  company?: string;
  position?: string;
  address?: string;
  city?: string;
  created_at?: string;
  updated_at?: string;
  email_confirmed_at?: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  full_name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
} 