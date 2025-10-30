import { createClient } from '@supabase/supabase-js';
import { config } from '../../config/environment';
import { Feedback, FeedbackCreateDTO, FeedbackUpdateDTO, FeedbackStats } from '../../models/feedback/feedback.model';
import { SlackService } from '../notification/slack.service';

const supabase = createClient(
  config.supabase.url || '',
  config.supabase.anonKey || ''
);

export class FeedbackService {
  private slackService: SlackService;

  constructor() {
    this.slackService = new SlackService();
  }

  async createFeedback(userId: string, data: FeedbackCreateDTO): Promise<Feedback> {
    try {
      const { data: feedback, error } = await supabase
        .from('feedback')
        .insert([{
          user_id: userId,
          message: data.message,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      // Enviar notificación a Slack de forma asíncrona (no bloquear la respuesta)
      this.sendSlackNotification(feedback, userId).catch(error => {
        console.error('Error enviando notificación a Slack:', error);
      });

      return feedback;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw error;
    }
  }

  private async sendSlackNotification(feedback: Feedback, userId: string): Promise<void> {
    try {
      // Obtener el perfil del usuario
      const { data: userProfile, error: userError } = await supabase
        .from('user_profiles')
        .select('id, full_name, email')
        .eq('user_id', userId)
        .single();

      if (userError) {
        console.warn('No se pudo obtener el perfil del usuario para la notificación de Slack:', userError);
      }

      // Enviar notificación a Slack
      await this.slackService.sendFeedbackNotification(feedback, userProfile);
    } catch (error) {
      console.error('Error en sendSlackNotification:', error);
    }
  }

  async getFeedbackByUser(userId: string): Promise<Feedback[]> {
    try {
      const { data: feedback, error } = await supabase
        .from('feedback')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return feedback || [];
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw error;
    }
  }

  async getAllFeedback(): Promise<Feedback[]> {
    try {
      // Obtener todos los feedbacks sin join
      const { data: feedback, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!feedback || feedback.length === 0) {
        return [];
      }

      // Obtener todos los user_ids únicos
      const userIds = [...new Set(feedback.map(fb => fb.user_id))];

      // Obtener todos los user_profiles en una sola consulta
      const { data: userProfiles, error: userError } = await supabase
        .from('user_profiles')
        .select('id, full_name, email, user_id')
        .in('user_id', userIds);

      if (userError) throw userError;

      // Crear un mapa para acceso rápido
      const userMap = new Map();
      (userProfiles || []).forEach(user => {
        userMap.set(user.user_id, user);
      });

      // Combinar feedback con user_profiles
      const feedbackWithUsers = feedback.map(fb => ({
        ...fb,
        user_profiles: userMap.get(fb.user_id) || null
      }));

      return feedbackWithUsers;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw error;
    }
  }

  async updateFeedback(feedbackId: string, data: FeedbackUpdateDTO): Promise<Feedback> {
    try {
      const updateData: any = {
        ...data,
        updated_at: new Date().toISOString()
      };

      if (data.status === 'resolved') {
        updateData.resolved_at = new Date().toISOString();
      }

      const { data: feedback, error } = await supabase
        .from('feedback')
        .update(updateData)
        .eq('id', feedbackId)
        .select()
        .single();

      if (error) throw error;
      return feedback;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw error;
    }
  }

  async getFeedbackStats(): Promise<FeedbackStats> {
    try {
      const { data: pending, error: pendingError } = await supabase
        .from('feedback')
        .select('id', { count: 'exact' })
        .eq('status', 'pending');

      if (pendingError) throw pendingError;

      const { data: resolved, error: resolvedError } = await supabase
        .from('feedback')
        .select('id', { count: 'exact' })
        .eq('status', 'resolved');

      if (resolvedError) throw resolvedError;

      return {
        total_pending: pending?.length || 0,
        total_resolved: resolved?.length || 0
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw error;
    }
  }

  async getPendingFeedbackCount(): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('id')
        .eq('status', 'pending');

      if (error) throw error;
      return data?.length || 0;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw error;
    }
  }

  async deleteFeedback(feedbackId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('feedback')
        .delete()
        .eq('id', feedbackId);

      if (error) throw error;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw error;
    }
  }
} 