export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PaymentMethod = 'bank_transfer' | 'paypal' | 'credit_card' | 'crypto';
export type PaymentType = 'campaign_payment' | 'subscription' | 'refund';

export interface Payment {
  id: string;
  user_id: string;
  organization_id: string;
  campaign_id?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  payment_method: PaymentMethod;
  payment_type: PaymentType;
  description: string;
  metadata?: {
    transaction_id?: string;
    payment_details?: {
      bank_account?: string;
      paypal_email?: string;
      card_last4?: string;
    };
    refund_reason?: string;
  };
  created_at: Date;
  updated_at: Date;
  completed_at?: Date;
  deleted_at?: Date;
}

export interface PaymentCreateDTO {
  user_id: string;
  organization_id: string;
  campaign_id?: string;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  payment_type: PaymentType;
  description: string;
  metadata?: Payment['metadata'];
}

export interface PaymentUpdateDTO {
  status?: PaymentStatus;
  payment_method?: PaymentMethod;
  description?: string;
  metadata?: Payment['metadata'];
}

export interface PaymentSummary {
  total_amount: number;
  total_payments: number;
  pending_amount: number;
  completed_amount: number;
  failed_amount: number;
  refunded_amount: number;
  currency: string;
  period: {
    start_date: Date;
    end_date: Date;
  };
  breakdown: {
    by_status: {
      [key in PaymentStatus]: {
        count: number;
        amount: number;
      };
    };
    by_type: {
      [key in PaymentType]: {
        count: number;
        amount: number;
      };
    };
    by_method: {
      [key in PaymentMethod]: {
        count: number;
        amount: number;
      };
    };
  };
} 