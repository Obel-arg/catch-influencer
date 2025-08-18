import { Request, Response } from 'express';
import { AlertManager } from '../../workers/alert-manager';

export class AlertController {
  // Obtener configuración de alertas
  static async getAlertConfig(req: Request, res: Response) {
    try {
      res.json({
        success: true,
        data: {
          enableAlerts: false,
          escalationEnabled: false,
          quietHours: { start: '22:00', end: '08:00' },
          alertChannels: [
            {
              type: 'console',
              name: 'console',
              config: {},
              enabled: true,
              priority: 'low'
            }
          ],
          message: 'Alert system disabled during PostgreSQL migration'
        }
      });
    } catch (error) {
      console.error('❌ [ALERT_CONTROLLER] Error getting alert config:', error);
      res.status(500).json({
        success: false,
        error: 'Error getting alert configuration'
      });
    }
  }

  // Actualizar configuración de alertas
  static async updateAlertConfig(req: Request, res: Response) {
    try {
      const { enableAlerts, escalationEnabled, quietHours } = req.body;
      const alertManager = AlertManager.getInstance();
      
      alertManager.updateConfig({
        enableAlerts,
        escalationEnabled,
        quietHours
      });
      
      res.json({
        success: true,
        message: 'Alert configuration updated successfully'
      });
    } catch (error) {
      console.error('❌ [ALERT_CONTROLLER] Error updating alert config:', error);
      res.status(500).json({
        success: false,
        error: 'Error updating alert configuration'
      });
    }
  }

  // Configurar webhook de Slack
  static async configureSlackWebhook(req: Request, res: Response) {
    try {
      const { webhookUrl } = req.body;
      
      if (!webhookUrl) {
        return res.status(400).json({
          success: false,
          error: 'Webhook URL is required'
        });
      }

      // Validar formato de webhook URL
      if (!webhookUrl.startsWith('https://hooks.slack.com/')) {
        return res.status(400).json({
          success: false,
          error: 'Invalid Slack webhook URL format'
        });
      }

      const alertManager = AlertManager.getInstance();
      
      // Actualizar configuración de Slack
      alertManager.updateConfig({
        alertChannels: [
          {
            type: 'console',
            name: 'console',
            config: {},
            enabled: true,
            priority: 'low'
          },
          {
            type: 'slack',
            name: 'slack',
            config: { webhookUrl },
            enabled: true,
            priority: 'high'
          }
        ]
      });

      // Guardar en variables de entorno (opcional)
      process.env.SLACK_WEBHOOK_URL = webhookUrl;
      
      res.json({
        success: true,
        message: 'Slack webhook configured successfully'
      });
    } catch (error) {
      console.error('❌ [ALERT_CONTROLLER] Error configuring Slack webhook:', error);
      res.status(500).json({
        success: false,
        error: 'Error configuring Slack webhook'
      });
    }
  }

  // Obtener alertas activas
  static async getActiveAlerts(req: Request, res: Response) {
    try {
      res.json({
        success: true,
        data: {
          alerts: [],
          message: 'Alert system disabled during PostgreSQL migration'
        }
      });
    } catch (error) {
      console.error('❌ [ALERT_CONTROLLER] Error getting active alerts:', error);
      res.status(500).json({
        success: false,
        error: 'Error getting active alerts'
      });
    }
  }

  // Obtener métricas de alertas
  static async getAlertMetrics(req: Request, res: Response) {
    try {
      const alertManager = AlertManager.getInstance();
      const metrics = alertManager.getAlertMetrics();
      
      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      console.error('❌ [ALERT_CONTROLLER] Error getting alert metrics:', error);
      res.status(500).json({
        success: false,
        error: 'Error getting alert metrics'
      });
    }
  }

  // Reconocer alerta
  static async acknowledgeAlert(req: Request, res: Response) {
    try {
      res.json({
        success: true,
        message: 'Alert system disabled during PostgreSQL migration'
      });
    } catch (error) {
      console.error('❌ [ALERT_CONTROLLER] Error acknowledging alert:', error);
      res.status(500).json({
        success: false,
        error: 'Error acknowledging alert'
      });
    }
  }

  // Probar notificación de Slack
  static async testSlackNotification(req: Request, res: Response) {
    try {
        res.json({
          success: true,
        message: 'Alert system disabled during PostgreSQL migration'
        });
    } catch (error) {
      console.error('❌ [ALERT_CONTROLLER] Error testing Slack notification:', error);
      res.status(500).json({
        success: false,
        error: 'Error testing Slack notification'
      });
    }
  }
} 