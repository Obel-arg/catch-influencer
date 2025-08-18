/**
 * Modelo de Suscripciones
 */

export interface SubscriptionPlan {
  id: string;
  name: string;
  code: string;
  description?: string;
  price_monthly: number;
  price_yearly: number;
  currency: string;
  tokens_included: number;
  max_users: number;
  max_campaigns?: number;
  max_teams?: number;
  max_influencers?: number;
  max_api_requests_daily?: number;
  features: Record<string, any>;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  is_public: boolean;
  sort_order: number;
  trial_days: number;
  legacy: boolean;
  metadata?: Record<string, any>;
}

export interface SubscriptionPlanCreateDTO {
  name: string;
  code: string;
  description?: string;
  price_monthly: number;
  price_yearly: number;
  currency?: string;
  tokens_included: number;
  max_users: number;
  max_campaigns?: number;
  max_teams?: number;
  max_influencers?: number;
  max_api_requests_daily?: number;
  features: Record<string, any>;
  is_active?: boolean;
  is_public?: boolean;
  sort_order?: number;
  trial_days?: number;
}

export interface OrganizationSubscription {
  id: string;
  organization_id: string;
  plan_id: string;
  status: 'active' | 'past_due' | 'canceled' | 'trialing' | 'incomplete' | 'unpaid';
  current_period_start: string;
  current_period_end: string;
  trial_start?: string;
  trial_end?: string;
  created_at: string;
  updated_at: string;
  cancel_at_period_end: boolean;
  payment_method_id?: string;
  external_subscription_id?: string;
  external_customer_id?: string;
  quantity: number;
  billing_cycle: 'monthly' | 'yearly';
  next_billing_date?: string;
  price_override?: number;
  canceled_at?: string;
  ended_at?: string;
  cancellation_reason?: string;
  payment_status?: string;
  metadata?: Record<string, any>;
}

export interface OrganizationSubscriptionCreateDTO {
  organization_id: string;
  plan_id: string;
  status?: 'active' | 'trialing';
  trial_end?: string;
  payment_method_id?: string;
  external_subscription_id?: string;
  external_customer_id?: string;
  quantity?: number;
  billing_cycle?: 'monthly' | 'yearly';
  price_override?: number;
}

export interface OrganizationSubscriptionUpdateDTO {
  plan_id?: string;
  status?: 'active' | 'past_due' | 'canceled' | 'trialing' | 'incomplete' | 'unpaid';
  current_period_end?: string;
  cancel_at_period_end?: boolean;
  payment_method_id?: string;
  quantity?: number;
  billing_cycle?: 'monthly' | 'yearly';
  price_override?: number;
  canceled_at?: string;
  ended_at?: string;
  cancellation_reason?: string;
  payment_status?: string;
  metadata?: Record<string, any>;
}

// Planes de suscripción predefinidos
export const DefaultPlans = {
  FREE_TRIAL: 'free_trial',
  BASIC: 'basic',
  BUSINESS: 'business',
  ENTERPRISE: 'enterprise'
}; 