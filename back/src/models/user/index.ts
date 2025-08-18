export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  organization_id?: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  organization_id?: string;
  created_at: Date;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  email: string;
  password: string;
  name: string;
}

export interface UpdateProfileDTO {
  name: string;
} 