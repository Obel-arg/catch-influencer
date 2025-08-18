import { Request, Response } from 'express';
import { NotificationService } from '../../services/notification/notification.service';
import { 
  NotificationCreateDTO, 
  NotificationUpdateDTO,
  NotificationPreferencesUpdateDTO
} from '../../models/notification/notification.model';

export class NotificationController {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  async createNotification(req: Request, res: Response) {
    try {
      const data: NotificationCreateDTO = req.body;
      const notification = await this.notificationService.createNotification(data);
      res.status(201).json(notification);
    } catch (error) {
      console.error('Error creating notification:', error);
      res.status(500).json({ error: 'Error creating notification' });
    }
  }

  async getNotificationById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const notification = await this.notificationService.getNotificationById(id);
      if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
      }
      res.json(notification);
    } catch (error) {
      console.error('Error getting notification:', error);
      res.status(500).json({ error: 'Error getting notification' });
    }
  }

  async getUserNotifications(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      const notifications = await this.notificationService.getUserNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error('Error getting user notifications:', error);
      res.status(500).json({ error: 'Error getting user notifications' });
    }
  }

  async getUnreadNotifications(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      const notifications = await this.notificationService.getUnreadNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error('Error getting unread notifications:', error);
      res.status(500).json({ error: 'Error getting unread notifications' });
    }
  }

  async updateNotification(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data: NotificationUpdateDTO = req.body;
      const notification = await this.notificationService.updateNotification(id, data);
      res.json(notification);
    } catch (error) {
      console.error('Error updating notification:', error);
      res.status(500).json({ error: 'Error updating notification' });
    }
  }

  async markAsRead(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const notification = await this.notificationService.markAsRead(id);
      res.json(notification);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ error: 'Error marking notification as read' });
    }
  }

  async markAllAsRead(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      await this.notificationService.markAllAsRead(userId);
      res.status(204).send();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({ error: 'Error marking all notifications as read' });
    }
  }

  async deleteNotification(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.notificationService.deleteNotification(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting notification:', error);
      res.status(500).json({ error: 'Error deleting notification' });
    }
  }

  async getNotificationsByType(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { type } = req.params;

      if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      const notifications = await this.notificationService.getNotificationsByType(userId, type as any);
      res.json(notifications);
    } catch (error) {
      console.error('Error getting notifications by type:', error);
      res.status(500).json({ error: 'Error getting notifications by type' });
    }
  }

  async getNotificationsByStatus(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { status } = req.params;

      if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      const notifications = await this.notificationService.getNotificationsByStatus(userId, status as any);
      res.json(notifications);
    } catch (error) {
      console.error('Error getting notifications by status:', error);
      res.status(500).json({ error: 'Error getting notifications by status' });
    }
  }

  // Preferencias de notificación
  async getNotificationPreferences(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      const preferences = await this.notificationService.getNotificationPreferences(userId);
      res.json(preferences);
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      res.status(500).json({ error: 'Error getting notification preferences' });
    }
  }

  async updateNotificationPreferences(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const data: NotificationPreferencesUpdateDTO = req.body;

      if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      const preferences = await this.notificationService.updateNotificationPreferences(userId, data);
      res.json(preferences);
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      res.status(500).json({ error: 'Error updating notification preferences' });
    }
  }

  async createNotificationPreferences(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const data: NotificationPreferencesUpdateDTO = req.body;

      if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      const preferences = await this.notificationService.createNotificationPreferences(userId, data);
      res.status(201).json(preferences);
    } catch (error) {
      console.error('Error creating notification preferences:', error);
      res.status(500).json({ error: 'Error creating notification preferences' });
    }
  }
} 