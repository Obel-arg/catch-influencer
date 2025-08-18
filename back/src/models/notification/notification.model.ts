export type NotificationType = 
  | 'campaign_status'
  | 'content_approval'
  | 'payment_status'
  | 'engagement_alert'
  | 'metrics_update'
  | 'system_alert'
  | 'reminder';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export type NotificationStatus = 'unread' | 'read' | 'archived';

export interface Notification {
  id: string;
  user_id: string;
  organization_id?: string;
  campaign_id?: string;
  content_id?: string;
  influencer_id?: string;
  type: NotificationType;
  priority: NotificationPriority;
  status: NotificationStatus;
  title: string;
  message: string;
  metadata?: {
    action_url?: string;
    action_text?: string;
    data?: {
      [key: string]: any;
    };
  };
  read_at?: Date;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface NotificationCreateDTO {
  user_id: string;
  organization_id?: string;
  campaign_id?: string;
  content_id?: string;
  influencer_id?: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  metadata?: Notification['metadata'];
}

export interface NotificationUpdateDTO {
  status?: NotificationStatus;
  read_at?: Date;
  metadata?: Notification['metadata'];
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  in_app_notifications: boolean;
  notification_types: {
    [key in NotificationType]: boolean;
  };
  created_at: Date;
  updated_at: Date;
}

export interface NotificationPreferencesUpdateDTO {
  email_notifications?: boolean;
  push_notifications?: boolean;
  in_app_notifications?: boolean;
  notification_types?: {
    [key in NotificationType]?: boolean;
  };
} 