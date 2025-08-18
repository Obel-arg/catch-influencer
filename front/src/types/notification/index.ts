export interface Notification {
  id: string;
  type: 'campaign' | 'influencer' | 'payment' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  data?: any;
  createdAt: string;
}

export interface NotificationPreferences {
  id: string;
  userId: string;
  email: boolean;
  push: boolean;
  inApp: boolean;
  types: {
    campaign: boolean;
    influencer: boolean;
    payment: boolean;
    system: boolean;
  };
  updatedAt: string;
}

export interface NotificationSettings {
  id: string;
  userId: string;
  frequency: 'realtime' | 'daily' | 'weekly';
  channels: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
  updatedAt: string;
} 