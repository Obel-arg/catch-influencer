import supabase from '../../config/supabase';
import { 
  Payment, 
  PaymentCreateDTO, 
  PaymentUpdateDTO,
  PaymentSummary,
  PaymentStatus,
  PaymentType,
  PaymentMethod
} from '../../models/payment/payment.model';

export class PaymentService {
  async createPayment(data: PaymentCreateDTO): Promise<Payment> {
    const { data: payment, error } = await supabase
      .from('payments')
      .insert([{
        ...data,
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date()
      }])
      .select()
      .single();

    if (error) throw error;
    return payment;
  }

  async getPaymentById(id: string): Promise<Payment> {
    const { data: payment, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return payment;
  }

  async getPaymentsByUser(userId: string): Promise<Payment[]> {
    const { data: payments, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return payments;
  }

  async getPaymentsByOrganization(organizationId: string): Promise<Payment[]> {
    const { data: payments, error } = await supabase
      .from('payments')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return payments;
  }

  async getPaymentsByCampaign(campaignId: string): Promise<Payment[]> {
    const { data: payments, error } = await supabase
      .from('payments')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return payments;
  }

  async updatePayment(id: string, data: PaymentUpdateDTO): Promise<Payment> {
    const updateData: any = {
      ...data,
      updated_at: new Date()
    };

    // Si el estado cambia a completed, actualizar completed_at
    if (data.status === 'completed') {
      updateData.completed_at = new Date();
    }

    const { data: payment, error } = await supabase
      .from('payments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return payment;
  }

  async deletePayment(id: string): Promise<void> {
    const { error } = await supabase
      .from('payments')
      .update({
        deleted_at: new Date(),
        updated_at: new Date()
      })
      .eq('id', id);

    if (error) throw error;
  }

  async getPaymentsByStatus(status: PaymentStatus): Promise<Payment[]> {
    const { data: payments, error } = await supabase
      .from('payments')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return payments;
  }

  async getPaymentsByType(type: PaymentType): Promise<Payment[]> {
    const { data: payments, error } = await supabase
      .from('payments')
      .select('*')
      .eq('payment_type', type)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return payments;
  }

  async getPaymentsByMethod(method: PaymentMethod): Promise<Payment[]> {
    const { data: payments, error } = await supabase
      .from('payments')
      .select('*')
      .eq('payment_method', method)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return payments;
  }

  async getPaymentsByDateRange(startDate: Date, endDate: Date): Promise<Payment[]> {
    const { data: payments, error } = await supabase
      .from('payments')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return payments;
  }

  async calculatePaymentSummary(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<PaymentSummary> {
    const { data: payments, error } = await supabase
      .from('payments')
      .select('*')
      .eq('organization_id', organizationId)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (error) throw error;

    const summary: PaymentSummary = {
      total_amount: 0,
      total_payments: payments.length,
      pending_amount: 0,
      completed_amount: 0,
      failed_amount: 0,
      refunded_amount: 0,
      currency: payments[0]?.currency || 'USD',
      period: {
        start_date: startDate,
        end_date: endDate
      },
      breakdown: {
        by_status: {
          pending: { count: 0, amount: 0 },
          completed: { count: 0, amount: 0 },
          failed: { count: 0, amount: 0 },
          refunded: { count: 0, amount: 0 }
        },
        by_type: {
          campaign_payment: { count: 0, amount: 0 },
          subscription: { count: 0, amount: 0 },
          refund: { count: 0, amount: 0 }
        },
        by_method: {
          bank_transfer: { count: 0, amount: 0 },
          paypal: { count: 0, amount: 0 },
          credit_card: { count: 0, amount: 0 },
          crypto: { count: 0, amount: 0 }
        }
      }
    };

    payments.forEach(payment => {
      // Totales generales
      summary.total_amount += payment.amount;

      // Por estado
      const status = payment.status as keyof typeof summary.breakdown.by_status;
      if (summary.breakdown.by_status[status]) {
        summary.breakdown.by_status[status].count++;
        summary.breakdown.by_status[status].amount += payment.amount;
      }

      // Por tipo
      const paymentType = payment.payment_type as keyof typeof summary.breakdown.by_type;
      if (summary.breakdown.by_type[paymentType]) {
        summary.breakdown.by_type[paymentType].count++;
        summary.breakdown.by_type[paymentType].amount += payment.amount;
      }

      // Por método
      const paymentMethod = payment.payment_method as keyof typeof summary.breakdown.by_method;
      if (summary.breakdown.by_method[paymentMethod]) {
        summary.breakdown.by_method[paymentMethod].count++;
        summary.breakdown.by_method[paymentMethod].amount += payment.amount;
      }

      // Montos por estado
      switch (payment.status) {
        case 'pending':
          summary.pending_amount += payment.amount;
          break;
        case 'completed':
          summary.completed_amount += payment.amount;
          break;
        case 'failed':
          summary.failed_amount += payment.amount;
          break;
        case 'refunded':
          summary.refunded_amount += payment.amount;
          break;
      }
    });

    return summary;
  }
} 