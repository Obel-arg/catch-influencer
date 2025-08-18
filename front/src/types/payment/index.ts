export interface Payment {
  id: string;
  organizationId: string;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "refunded";
  type: "subscription" | "campaign" | "influencer";
  referenceId: string;
  paymentMethodId: string;
  description?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentMethod {
  id: string;
  organizationId: string;
  type: "credit_card" | "bank_transfer" | "paypal";
  status: "active" | "inactive";
  details: {
    last4?: string;
    brand?: string;
    expiryMonth?: number;
    expiryYear?: number;
    accountNumber?: string;
    accountHolder?: string;
    bankName?: string;
    email?: string;
  };
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentHistory {
  id: string;
  paymentId: string;
  organizationId: string;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "refunded";
  type: "charge" | "refund" | "adjustment";
  description?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentDto {
  amount: number;
  currency: string;
  type: "subscription" | "campaign" | "influencer";
  referenceId: string;
  paymentMethodId: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface CreatePaymentMethodDto {
  type: "credit_card" | "bank_transfer" | "paypal";
  details: {
    number?: string;
    expiryMonth?: number;
    expiryYear?: number;
    cvc?: string;
    accountNumber?: string;
    accountHolder?: string;
    bankName?: string;
    email?: string;
  };
  isDefault?: boolean;
}

export interface UpdatePaymentMethodDto {
  status?: "active" | "inactive";
  isDefault?: boolean;
  details?: Partial<PaymentMethod["details"]>;
} 