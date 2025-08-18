import { useState, useCallback } from 'react';
import { paymentService } from '@/lib/services/payment';
import { Payment, PaymentMethod, PaymentHistory, CreatePaymentDto, CreatePaymentMethodDto, UpdatePaymentMethodDto } from '@/types/payment';
import { PaginationParams } from '@/types/common';
import { useToast } from '../common/useToast';

export function usePayments() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const getPayments = useCallback(async (params?: PaginationParams): Promise<{ data: Payment[]; total: number }> => {
    try {
      setLoading(true);
      setError(null);
      const data = await paymentService.getPayments(params);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al obtener pagos';
      setError(message);
      showToast({
        title: 'Error',
        description: message,
        status: 'error'
      });
      return { data: [], total: 0 };
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const getPaymentById = useCallback(async (id: string): Promise<Payment | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await paymentService.getPaymentById(id);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al obtener pago';
      setError(message);
      showToast({
        title: 'Error',
        description: message,
        status: 'error'
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const createPayment = useCallback(async (data: CreatePaymentDto): Promise<Payment | null> => {
    try {
      setLoading(true);
      setError(null);
      const payment = await paymentService.createPayment(data);
      showToast({
        title: 'Éxito',
        description: 'Pago creado correctamente',
        status: 'success'
      });
      return payment;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear pago';
      setError(message);
      showToast({
        title: 'Error',
        description: message,
        status: 'error'
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const getPaymentMethods = useCallback(async (): Promise<PaymentMethod[]> => {
    try {
      setLoading(true);
      setError(null);
      const data = await paymentService.getPaymentMethods();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al obtener métodos de pago';
      setError(message);
      showToast({
        title: 'Error',
        description: message,
        status: 'error'
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const createPaymentMethod = useCallback(async (data: CreatePaymentMethodDto): Promise<PaymentMethod | null> => {
    try {
      setLoading(true);
      setError(null);
      const method = await paymentService.createPaymentMethod(data);
      showToast({
        title: 'Éxito',
        description: 'Método de pago creado correctamente',
        status: 'success'
      });
      return method;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear método de pago';
      setError(message);
      showToast({
        title: 'Error',
        description: message,
        status: 'error'
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const updatePaymentMethod = useCallback(async (id: string, data: UpdatePaymentMethodDto): Promise<PaymentMethod | null> => {
    try {
      setLoading(true);
      setError(null);
      const method = await paymentService.updatePaymentMethod(id, data);
      showToast({
        title: 'Éxito',
        description: 'Método de pago actualizado correctamente',
        status: 'success'
      });
      return method;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar método de pago';
      setError(message);
      showToast({
        title: 'Error',
        description: message,
        status: 'error'
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const deletePaymentMethod = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await paymentService.deletePaymentMethod(id);
      showToast({
        title: 'Éxito',
        description: 'Método de pago eliminado correctamente',
        status: 'success'
      });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar método de pago';
      setError(message);
      showToast({
        title: 'Error',
        description: message,
        status: 'error'
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const getPaymentHistory = useCallback(async (params?: PaginationParams): Promise<{ data: PaymentHistory[]; total: number }> => {
    try {
      setLoading(true);
      setError(null);
      const data = await paymentService.getPaymentHistory(params);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al obtener historial de pagos';
      setError(message);
      showToast({
        title: 'Error',
        description: message,
        status: 'error'
      });
      return { data: [], total: 0 };
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  return {
    loading,
    error,
    getPayments,
    getPaymentById,
    createPayment,
    getPaymentMethods,
    createPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    getPaymentHistory,
  };
} 