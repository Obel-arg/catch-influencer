import { httpClient } from "../../http";
import { Payment, PaymentMethod, PaymentHistory, CreatePaymentDto, CreatePaymentMethodDto, UpdatePaymentMethodDto } from "@/types/payment";
import { AxiosHeaders } from "axios";
import { PaginationParams } from "@/types/common";

export class PaymentService {
  private static instance: PaymentService;
  private baseUrl = "/payments";

  private constructor() {}

  public static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  async getPayments(params?: PaginationParams): Promise<{ data: Payment[]; total: number }> {
    const response = await httpClient.get<{ data: Payment[]; total: number }>(this.baseUrl, {
      params,
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async getPaymentById(id: string): Promise<Payment> {
    const response = await httpClient.get<Payment>(`${this.baseUrl}/${id}`, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async createPayment(payment: CreatePaymentDto): Promise<Payment> {
    const response = await httpClient.post<Payment>(this.baseUrl, payment, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const response = await httpClient.get<PaymentMethod[]>(`${this.baseUrl}/methods`, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async getPaymentMethodById(id: string): Promise<PaymentMethod> {
    const response = await httpClient.get<PaymentMethod>(`${this.baseUrl}/methods/${id}`, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async createPaymentMethod(method: CreatePaymentMethodDto): Promise<PaymentMethod> {
    const response = await httpClient.post<PaymentMethod>(`${this.baseUrl}/methods`, method, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async updatePaymentMethod(id: string, method: UpdatePaymentMethodDto): Promise<PaymentMethod> {
    const response = await httpClient.put<PaymentMethod>(`${this.baseUrl}/methods/${id}`, method, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }

  async deletePaymentMethod(id: string): Promise<void> {
    await httpClient.delete(`${this.baseUrl}/methods/${id}`, {
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
  }

  async getPaymentHistory(params?: PaginationParams): Promise<{ data: PaymentHistory[]; total: number }> {
    const response = await httpClient.get<{ data: PaymentHistory[]; total: number }>(`${this.baseUrl}/history`, {
      params,
      headers: new AxiosHeaders({
        "Content-Type": "application/json"
      })
    });
    return response.data;
  }
}

export const paymentService = PaymentService.getInstance(); 