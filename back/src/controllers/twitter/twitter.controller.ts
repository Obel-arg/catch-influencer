import { Request, Response } from 'express';
import { TwitterApiService } from '../../services/social/twitter-api.service';

class TwitterController {
  /**
   * Genera y almacena la miniatura de un tweet en blob storage
   */
  generateAndStoreThumbnail = async (req: Request, res: Response) => {
    try {
      const { postUrl } = req.body;

      if (!postUrl || typeof postUrl !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'postUrl is required and must be a string'
        });
      }

      // Verificar que sea una URL válida de Twitter
      if (!TwitterApiService.isTwitterUrl(postUrl)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid Twitter URL'
        });
      }



      // Generar y almacenar la miniatura
      const blobUrl = await TwitterApiService.generateAndStoreThumbnail(postUrl);

      if (blobUrl) {

        
        return res.json({
          success: true,
          blobUrl: blobUrl,
          originalUrl: postUrl,
          message: 'Thumbnail generated and stored successfully'
        });
      } else {

        
        return res.status(500).json({
          success: false,
          error: 'Failed to generate thumbnail',
          originalUrl: postUrl
        });
      }

    } catch (error) {

      
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        originalUrl: req.body.postUrl
      });
    }
  };

  /**
   * Obtiene información completa de un tweet (método original para compatibilidad)
   */
  getPostInfo = async (req: Request, res: Response) => {
    try {
      const { postUrl } = req.query;

      if (!postUrl || typeof postUrl !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'postUrl is required and must be a string'
        });
      }

      // Verificar que sea una URL válida de Twitter
      if (!TwitterApiService.isTwitterUrl(postUrl)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid Twitter URL'
        });
      }

    

      // Obtener información del tweet
      const postInfo = await TwitterApiService.getPostInfo(postUrl);

      if (postInfo) {

        
        return res.json({
          success: true,
          data: postInfo,
          originalUrl: postUrl
        });
      } else {

        
        return res.status(500).json({
          success: false,
          error: 'Failed to get post information',
          originalUrl: postUrl
        });
      }

    } catch (error) {

      
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        originalUrl: req.query.postUrl
      });
    }
  };

  /**
   * Prueba la conexión con ScreenshotOne API
   */
  testScreenshotOneConnection = async (req: Request, res: Response) => {
    try {
    

      const isConnected = await TwitterApiService.testScreenshotOneConnection();

      if (isConnected) {

        
        return res.json({
          success: true,
          message: 'ScreenshotOne API connection successful'
        });
      } else {

        
        return res.status(500).json({
          success: false,
          error: 'ScreenshotOne API connection failed'
        });
      }

    } catch (error) {
      console.error('❌ [Twitter Controller] Error probando conexión:', error);
      
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  };

  /**
   * Obtiene información de uso de ScreenshotOne API
   */
  getScreenshotOneUsage = async (req: Request, res: Response) => {
    try {


      const usageInfo = await TwitterApiService.getScreenshotOneUsage();

      if (usageInfo) {

        
        return res.json({
          success: true,
          data: usageInfo
        });
      } else {

        
        return res.status(500).json({
          success: false,
          error: 'Failed to get usage information'
        });
      }

    } catch (error) {

      
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  };
}

export const twitterController = new TwitterController(); 