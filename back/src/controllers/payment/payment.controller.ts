import { Request, Response } from 'express';
import { PaymentService } from '../../services/payment/payment.service';
import { PaymentCreateDTO, PaymentUpdateDTO } from '../../models/payment/payment.model';

const paymentService = new PaymentService();

export class PaymentController {
  async createPayment(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      const paymentData: PaymentCreateDTO = {
        ...req.body,
        user_id: userId
      };

      const payment = await paymentService.createPayment(paymentData);
      res.status(201).json(payment);
    } catch (error) {
      res.status(500).json({ error: 'Error al crear el pago' });
    }
  }

  async getPaymentById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const payment = await paymentService.getPaymentById(id);
      res.json(payment);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener el pago' });
    }
  }

  async getPaymentsByUser(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      const payments = await paymentService.getPaymentsByUser(userId);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener los pagos del usuario' });
    }
  }

  async getPaymentsByOrganization(req: Request, res: Response) {
    try {
      const { organizationId } = req.params;
      const payments = await paymentService.getPaymentsByOrganization(organizationId);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener los pagos de la organización' });
    }
  }

  async getPaymentsByCampaign(req: Request, res: Response) {
    try {
      const { campaignId } = req.params;
      const payments = await paymentService.getPaymentsByCampaign(campaignId);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener los pagos de la campaña' });
    }
  }

  async updatePayment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData: PaymentUpdateDTO = req.body;
      const payment = await paymentService.updatePayment(id, updateData);
      res.json(payment);
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar el pago' });
    }
  }

  async deletePayment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await paymentService.deletePayment(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar el pago' });
    }
  }

  async getPaymentsByStatus(req: Request, res: Response) {
    try {
      const { status } = req.params;
      const payments = await paymentService.getPaymentsByStatus(status as any);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener los pagos por estado' });
    }
  }

  async getPaymentsByType(req: Request, res: Response) {
    try {
      const { type } = req.params;
      const payments = await paymentService.getPaymentsByType(type as any);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener los pagos por tipo' });
    }
  }

  async getPaymentsByMethod(req: Request, res: Response) {
    try {
      const { method } = req.params;
      const payments = await paymentService.getPaymentsByMethod(method as any);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener los pagos por método' });
    }
  }

  async getPaymentsByDateRange(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;
      const payments = await paymentService.getPaymentsByDateRange(
        new Date(startDate as string),
        new Date(endDate as string)
      );
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener los pagos por rango de fechas' });
    }
  }

  async getPaymentSummary(req: Request, res: Response) {
    try {
      const { organizationId } = req.params;
      const { startDate, endDate } = req.query;

      const summary = await paymentService.calculatePaymentSummary(
        organizationId,
        new Date(startDate as string),
        new Date(endDate as string)
      );
      res.json(summary);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener el resumen de pagos' });
    }
  }
} 