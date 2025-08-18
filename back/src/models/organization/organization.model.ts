/**
 * Modelo de Organización
 */

export interface Organization {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
  industry?: string;
  size?: 'small' | 'medium' | 'large' | 'enterprise';
  status: 'active' | 'suspended' | 'deleted';
  billing_email?: string;
  billing_details?: Record<string, any>;
  timezone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
  };
  phone?: string;
  tax_id?: string;
  settings?: Record<string, any>;
  metadata?: Record<string, any>;
  onboarding_completed: boolean;
  trial_ends_at?: Date;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface OrganizationCreateDTO {
  name: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
  industry?: string;
  size?: 'small' | 'medium' | 'large' | 'enterprise';
  billing_email?: string;
  billing_details?: Record<string, any>;
  timezone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
  };
  phone?: string;
  tax_id?: string;
  settings?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface OrganizationUpdateDTO extends Partial<OrganizationCreateDTO> {
  status?: 'active' | 'suspended' | 'deleted';
  onboarding_completed?: boolean;
  trial_ends_at?: Date;
} 