import { api } from './api';

export interface TwitterPostInfo {
  id: string;
  text: string;
  author: {
    username: string;
    displayName: string;
    profileImage?: string;
  };
  media: {
    photos: string[];
    videos: string[];
  };
  embedHtml?: string;
  thumbnail?: string;
  postUrl: string;
  stats: {
    retweets: number;
    likes: number;
    replies: number;
  };
  createdAt?: string;
}

export interface GenerateThumbnailResponse {
  success: boolean;
  blobUrl?: string;
  originalUrl: string;
  message?: string;
  error?: string;
}

export const twitterService = {
  /**
   * Genera y almacena la miniatura de un tweet en blob storage
   */
  async generateAndStoreThumbnail(postUrl: string): Promise<GenerateThumbnailResponse> {
    try {
      const response = await api.post('/twitter/generate-thumbnail', {
        postUrl: postUrl
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Error generating Twitter thumbnail:', error);
      
      return {
        success: false,
        originalUrl: postUrl,
        error: error.response?.data?.error || error.message || 'Unknown error occurred'
      };
    }
  },

  /**
   * Obtiene información completa de un tweet
   */
  async getPostInfo(postUrl: string): Promise<TwitterPostInfo | null> {
    try {
      const response = await api.get('/twitter/post-info', {
        params: { postUrl }
      });
      
      if (response.data.success) {
        return response.data.data;
      } else {
        console.error('Failed to get post info:', response.data.error);
        return null;
      }
    } catch (error: any) {
      console.error('Error getting Twitter post info:', error);
      return null;
    }
  },

  /**
   * Prueba la conexión con ScreenshotOne API
   */
  async testScreenshotOneConnection(): Promise<boolean> {
    try {
      const response = await api.get('/twitter/test-screenshotone');
      return response.data.success;
    } catch (error: any) {
      console.error('Error testing ScreenshotOne connection:', error);
      return false;
    }
  },

  /**
   * Obtiene información de uso de ScreenshotOne API
   */
  async getScreenshotOneUsage(): Promise<any> {
    try {
      const response = await api.get('/twitter/screenshotone-usage');
      
      if (response.data.success) {
        return response.data.data;
      } else {
        console.error('Failed to get usage info:', response.data.error);
        return null;
      }
    } catch (error: any) {
      console.error('Error getting ScreenshotOne usage:', error);
      return null;
    }
  }
}; 