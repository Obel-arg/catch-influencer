import { getApiBaseUrl } from './apiBase';

const API_BASE = getApiBaseUrl();

export interface AlertConfig {
  enableAlerts: boolean;
  escalationEnabled: boolean;
  alertChannels: AlertChannel[];
  escalationDelay: number;
  maxEscalations: number;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
    timezone: string;
  };
}

export interface AlertChannel {
  type: 'console' | 'email' | 'slack' | 'webhook';
  name: string;
  config: any;
  enabled: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface Alert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  context: Record<string, any>;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  escalationLevel: number;
  source: string;
  tags: string[];
}

export interface AlertMetrics {
  totalAlerts: number;
  activeAlerts: number;
  acknowledgedAlerts: number;
  alertsBySeverity: Record<string, number>;
  alertsByType: Record<string, number>;
  avgResponseTime: number;
  escalationCount: number;
}

export class AlertApi {
  // Obtener configuración de alertas
  static async getConfig(): Promise<AlertConfig> {
    const response = await fetch(`${API_BASE}/admin/alerts/config`);
    if (!response.ok) {
      throw new Error('Failed to fetch alert config');
    }
    const data = await response.json();
    return data.data;
  }

  // Actualizar configuración de alertas
  static async updateConfig(config: Partial<AlertConfig>): Promise<void> {
    const response = await fetch(`${API_BASE}/admin/alerts/config`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });
    if (!response.ok) {
      throw new Error('Failed to update alert config');
    }
  }

  // Configurar webhook de Slack
  static async configureSlackWebhook(webhookUrl: string): Promise<void> {
    const response = await fetch(`${API_BASE}/admin/alerts/slack/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ webhookUrl }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to configure Slack webhook');
    }
  }

  // Probar notificación de Slack
  static async testSlackNotification(): Promise<void> {
    const response = await fetch(`${API_BASE}/admin/alerts/slack/test`, {
      method: 'POST',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to test Slack notification');
    }
  }

  // Obtener alertas activas
  static async getActiveAlerts(): Promise<Alert[]> {
    const response = await fetch(`${API_BASE}/admin/alerts/alerts`);
    if (!response.ok) {
      throw new Error('Failed to fetch active alerts');
    }
    const data = await response.json();
    return data.data.map((alert: any) => ({
      ...alert,
      timestamp: new Date(alert.timestamp),
      acknowledgedAt: alert.acknowledgedAt ? new Date(alert.acknowledgedAt) : undefined,
    }));
  }

  // Obtener métricas de alertas
  static async getMetrics(): Promise<AlertMetrics> {
    const response = await fetch(`${API_BASE}/admin/alerts/metrics`);
    if (!response.ok) {
      throw new Error('Failed to fetch alert metrics');
    }
    const data = await response.json();
    return data.data;
  }

  // Reconocer alerta
  static async acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<void> {
    const response = await fetch(`${API_BASE}/admin/alerts/alerts/${alertId}/acknowledge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ acknowledgedBy }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to acknowledge alert');
    }
  }
} 