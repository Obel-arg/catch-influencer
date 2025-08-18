import { config } from '../../config/environment';

interface SlackMessage {
  text?: string;
  blocks?: any[];
  channel?: string;
}

export class SlackService {
  private webhookUrl: string;
  private defaultChannel: string;

  constructor() {
    this.webhookUrl = config.slack?.webhookUrl || '';
    this.defaultChannel = config.slack?.feedbackChannel || '#general';
  }

  async sendMessage(message: SlackMessage): Promise<boolean> {
    try {
      if (!this.webhookUrl) {
        console.warn('Slack webhook URL no configurada');
        return false;
      }

      const payload = {
        text: message.text,
        blocks: message.blocks,
        channel: message.channel || this.defaultChannel
      };

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.error('Error enviando mensaje a Slack:', response.status, response.statusText);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error enviando mensaje a Slack:', error);
      return false;
    }
  }

  async sendFeedbackNotification(feedback: any, userProfile?: any): Promise<boolean> {
    const blocks: any[] = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '📝 Nuevo Feedback Recibido',
          emoji: true
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Usuario:*\n${userProfile?.full_name || 'Usuario anónimo'}`
          },
          {
            type: 'mrkdwn',
            text: `*Email:*\n${userProfile?.email || 'No disponible'}`
          }
        ]
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Mensaje:*\n${feedback.message}`
        }
      }
    ];

    // Agregar ruta si está disponible
    if (feedback.route) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Ruta:*\n${feedback.route}`
        }
      });
    }

    // Agregar timestamp
    blocks.push({
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `📅 Enviado el ${new Date(feedback.created_at).toLocaleString('es-ES', {
            timeZone: 'America/Argentina/Buenos_Aires'
          })}`
        }
      ]
    });



    return this.sendMessage({
      text: `Nuevo feedback de ${userProfile?.full_name || 'Usuario'}`,
      blocks: blocks,
      channel: this.defaultChannel
    });
  }
} 