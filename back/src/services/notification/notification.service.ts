import supabase from '../../config/supabase';
import { 
  Notification, 
  NotificationCreateDTO, 
  NotificationUpdateDTO,
  NotificationPreferences,
  NotificationPreferencesUpdateDTO,
  NotificationType,
  NotificationStatus
} from '../../models/notification/notification.model';

export class NotificationService {
  async createNotification(data: NotificationCreateDTO): Promise<Notification> {
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert([{
        ...data,
        status: 'unread',
        created_at: new Date(),
        updated_at: new Date()
      }])
      .select()
      .single();

    if (error) throw error;
    return notification;
  }

  async getNotificationById(id: string): Promise<Notification> {
    const { data: notification, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return notification;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return notifications;
  }

  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'unread')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return notifications;
  }

  async updateNotification(id: string, data: NotificationUpdateDTO): Promise<Notification> {
    const { data: notification, error } = await supabase
      .from('notifications')
      .update({
        ...data,
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return notification;
  }

  async markAsRead(id: string): Promise<Notification> {
    const { data: notification, error } = await supabase
      .from('notifications')
      .update({
        status: 'read',
        read_at: new Date(),
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return notification;
  }

  async markAllAsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({
        status: 'read',
        read_at: new Date(),
        updated_at: new Date()
      })
      .eq('user_id', userId)
      .eq('status', 'unread');

    if (error) throw error;
  }

  async deleteNotification(id: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({
        deleted_at: new Date(),
        updated_at: new Date()
      })
      .eq('id', id);

    if (error) throw error;
  }

  async getNotificationsByType(userId: string, type: NotificationType): Promise<Notification[]> {
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('type', type)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return notifications;
  }

  async getNotificationsByStatus(userId: string, status: NotificationStatus): Promise<Notification[]> {
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return notifications;
  }

  // Preferencias de notificación
  async getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
    const { data: preferences, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return preferences;
  }

  async updateNotificationPreferences(
    userId: string, 
    data: NotificationPreferencesUpdateDTO
  ): Promise<NotificationPreferences> {
    const { data: preferences, error } = await supabase
      .from('notification_preferences')
      .update({
        ...data,
        updated_at: new Date()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return preferences;
  }

  async createNotificationPreferences(
    userId: string,
    data: NotificationPreferencesUpdateDTO
  ): Promise<NotificationPreferences> {
    const defaultPreferences: NotificationPreferences = {
      id: '',
      user_id: userId,
      email_notifications: true,
      push_notifications: true,
      in_app_notifications: true,
      notification_types: {
        campaign_status: true,
        content_approval: true,
        payment_status: true,
        engagement_alert: true,
        metrics_update: true,
        system_alert: true,
        reminder: true
      },
      created_at: new Date(),
      updated_at: new Date()
    };

    const { data: preferences, error } = await supabase
      .from('notification_preferences')
      .insert([{
        ...defaultPreferences,
        ...data
      }])
      .select()
      .single();

    if (error) throw error;
    return preferences;
  }
} 