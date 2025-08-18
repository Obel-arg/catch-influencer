import { Request, Response } from 'express';
import { FeedbackService } from '../../services/feedback/feedback.service';
import { FeedbackCreateDTO, FeedbackUpdateDTO } from '../../models/feedback/feedback.model';

export class FeedbackController {
  private feedbackService: FeedbackService;

  constructor() {
    this.feedbackService = new FeedbackService();
  }

  async createFeedback(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      const feedbackData: FeedbackCreateDTO = req.body;
      
      if (!feedbackData.message || feedbackData.message.trim().length === 0) {
        return res.status(400).json({ error: 'El mensaje es requerido' });
      }

      const feedback = await this.feedbackService.createFeedback(userId, feedbackData);
      
      res.status(201).json({
        success: true,
        data: feedback,
        message: 'Feedback enviado correctamente'
      });
    } catch (error) {
      console.error('Error creating feedback:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  async getUserFeedback(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      const feedback = await this.feedbackService.getFeedbackByUser(userId);
      
      res.json({
        success: true,
        data: feedback
      });
    } catch (error) {
      console.error('Error getting user feedback:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  async getAllFeedback(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      // Verificar si el usuario tiene email de obel.la para acceso administrativo
      const userEmail = req.user?.email;
      if (!userEmail || !userEmail.includes('@obel.la')) {
        return res.status(403).json({ error: 'Acceso denegado. Solo usuarios de Obel pueden ver todos los feedbacks.' });
      }

      const feedback = await this.feedbackService.getAllFeedback();
      
      res.json({
        success: true,
        data: feedback
      });
    } catch (error) {
      console.error('Error getting all feedback:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  async updateFeedback(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      // Verificar si el usuario tiene email de obel.la para acceso administrativo
      const userEmail = req.user?.email;
      if (!userEmail || !userEmail.includes('@obel.la')) {
        return res.status(403).json({ error: 'Acceso denegado. Solo usuarios de Obel pueden actualizar feedbacks.' });
      }

      const feedbackId = req.params.id;
      const updateData: FeedbackUpdateDTO = req.body;

      const feedback = await this.feedbackService.updateFeedback(feedbackId, {
        ...updateData,
        resolved_by: userId
      });
      
      res.json({
        success: true,
        data: feedback,
        message: 'Feedback actualizado correctamente'
      });
    } catch (error) {
      console.error('Error updating feedback:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  async getFeedbackStats(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      // Verificar si el usuario tiene email de obel.la para acceso administrativo
      const userEmail = req.user?.email;
      if (!userEmail || !userEmail.includes('@obel.la')) {
        return res.status(403).json({ error: 'Acceso denegado. Solo usuarios de Obel pueden ver estadísticas de feedback.' });
      }

      const stats = await this.feedbackService.getFeedbackStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error getting feedback stats:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  async getPendingFeedbackCount(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      // Verificar si el usuario tiene email de obel.la para acceso administrativo
      const userEmail = req.user?.email;
      if (!userEmail || !userEmail.includes('@obel.la')) {
        return res.status(403).json({ error: 'Acceso denegado. Solo usuarios de Obel pueden ver el conteo de feedbacks pendientes.' });
      }

      const count = await this.feedbackService.getPendingFeedbackCount();
      
      res.json({
        success: true,
        data: { pending_count: count }
      });
    } catch (error) {
      console.error('Error getting pending feedback count:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  async deleteFeedback(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      // Verificar si el usuario tiene email de obel.la para acceso administrativo
      const userEmail = req.user?.email;
      if (!userEmail || !userEmail.includes('@obel.la')) {
        return res.status(403).json({ error: 'Acceso denegado. Solo usuarios de Obel pueden eliminar feedbacks.' });
      }

      const feedbackId = req.params.id;

      await this.feedbackService.deleteFeedback(feedbackId);
      
      res.json({
        success: true,
        message: 'Feedback eliminado correctamente'
      });
    } catch (error) {
      console.error('Error deleting feedback:', error);
      res.status(500).json({ 
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
} 