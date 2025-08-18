import { useState, useCallback } from 'react';
import { notificationService } from '@/lib/services/notification';
import { Notification, NotificationPreferences, NotificationSettings } from '@/types/notification';
import { PaginationParams } from '@/types/common';
import { useToast } from '../common/useToast';

export const useNotifications = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const getNotifications = useCallback(async (params?: PaginationParams) => {
    try {
      setLoading(true);
      setError(null);
      const data = await notificationService.getNotifications(params);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al obtener notificaciones';
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

  const markAsRead = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await notificationService.markAsRead(id);
      showToast({
        title: 'Éxito',
        description: 'Notificación marcada como leída',
        status: 'success'
      });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al marcar notificación como leída';
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

  const markAllAsRead = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await notificationService.markAllAsRead();
      showToast({
        title: 'Éxito',
        description: 'Todas las notificaciones marcadas como leídas',
        status: 'success'
      });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al marcar todas las notificaciones como leídas';
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

  const getPreferences = useCallback(async (): Promise<NotificationPreferences | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await notificationService.getPreferences();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al obtener preferencias de notificaciones';
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

  const updatePreferences = useCallback(async (preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await notificationService.updatePreferences(preferences);
      showToast({
        title: 'Éxito',
        description: 'Preferencias actualizadas correctamente',
        status: 'success'
      });
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar preferencias de notificaciones';
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

  const getSettings = useCallback(async (): Promise<NotificationSettings | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await notificationService.getSettings();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al obtener configuración de notificaciones';
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

  const updateSettings = useCallback(async (settings: Partial<NotificationSettings>): Promise<NotificationSettings | null> => {
    try {
      setLoading(true);
      setError(null);
      const data = await notificationService.updateSettings(settings);
      showToast({
        title: 'Éxito',
        description: 'Configuración actualizada correctamente',
        status: 'success'
      });
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar configuración de notificaciones';
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

  return {
    loading,
    error,
    getNotifications,
    markAsRead,
    markAllAsRead,
    getPreferences,
    updatePreferences,
    getSettings,
    updateSettings
  };
}; 