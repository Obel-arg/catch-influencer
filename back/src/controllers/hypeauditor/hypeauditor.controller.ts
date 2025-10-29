import { Request, Response } from 'express';
import { hypeAuditorService } from '../../services/hypeauditor/hypeauditor.service';
import supabase from '../../config/supabase';

export class HypeAuditorController {
  static async search(req: Request, res: Response) {
    try {
      const body = req.body || {};
      const result = await hypeAuditorService.search(body);
      res.json({ success: true, ...result, provider: 'HypeAuditor' });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
        provider: 'HypeAuditor',
      });
    }
  }

  static async getCreatorReport(req: Request, res: Response) {
    try {
      const { creatorId } = req.params;
      if (!creatorId) {
        return res.status(400).json({
          success: false,
          error: 'Creator ID es requerido',
          provider: 'HypeAuditor',
        });
      }

      const creatorData = await supabase
        .from('influencers')
        .select('main_social_platform, creator_id')
        .eq('id', creatorId)
        .single();
      if (creatorData.error || !creatorData.data) {
        return res.status(404).json({
          success: false,
          error: 'Creator no encontrado',
          provider: 'HypeAuditor',
        });
      }

      const { main_social_platform, creator_id } = creatorData.data;
      if (main_social_platform === 'instagram') {
        return this.getInstagramReport((req.query.username = creator_id), res);
      } else if (main_social_platform === 'youtube') {
        return this.getYouTubeReport((req.query.channel = creator_id), res);
      } else if (main_social_platform === 'tiktok') {
        return this.getTikTokReport((req.query.channel = creator_id), res);
      } else {
        return res.status(400).json({
          success: false,
          error: 'Plataforma no soportada para reportes',
          provider: 'HypeAuditor',
        });
      }
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
        provider: 'HypeAuditor',
      });
    }
  }

  static async getInstagramReport(req: Request, res: Response) {
    try {
      const { username } = req.query;

      if (!username) {
        return res.status(400).json({
          success: false,
          error: 'Username es requerido',
          provider: 'HypeAuditor',
        });
      }

      const result = await hypeAuditorService.getInstagramReport(
        username as string,
      );

      res.json({ success: true, ...result, provider: 'HypeAuditor' });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
        provider: 'HypeAuditor',
      });
    }
  }

  static async getYouTubeReport(req: Request, res: Response) {
    try {
      const { channel } = req.query;
      if (!channel) {
        return res.status(400).json({
          success: false,
          error: 'Username es requerido',
          provider: 'HypeAuditor',
        });
      }

      const result = await hypeAuditorService.getYoutubeReport(
        channel as string,
      );
      res.json({ success: true, ...result, provider: 'HypeAuditor' });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
        provider: 'HypeAuditor',
      });
    }
  }

  static async getTikTokReport(req: Request, res: Response) {
    try {
      const { channel, features } = req.query;
      if (!channel) {
        return res.status(400).json({
          success: false,
          error: 'Username es requerido',
          provider: 'HypeAuditor',
        });
      }

      const result = await hypeAuditorService.getTiktokReport(
        channel as string,
        features as string,
      );
      res.json({ success: true, ...result, provider: 'HypeAuditor' });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
        provider: 'HypeAuditor',
      });
    }
  }
}
