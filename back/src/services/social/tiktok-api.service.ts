const axios = require('axios');
const cheerio = require('cheerio');

interface TikTokVideoData {
  id: string;
  description: string;
  author: {
    username: string;
    nickname: string;
  };
  thumbnails: string[];
  videoUrl: string;
  stats: {
    playCount: number;
    shareCount: number;
    commentCount: number;
    diggCount: number;
  };
}

export class TikTokApiService {
  private static readonly USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
  
  /**
   * Obtiene el HTML de una página de TikTok
   */
  private static async fetchTikTokPage(url: string): Promise<string> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        timeout: 10000
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo página de TikTok:', error);
      throw error;
    }
  }

  /**
   * Extrae thumbnails del HTML usando múltiples métodos
   */
  private static extractThumbnailsFromHTML(html: string): string[] {
    const $ = cheerio.load(html);
    const thumbnails: string[] = [];

    // Método 1: Buscar en scripts JSON-LD
    $('script[type="application/ld+json"]').each((_i: number, elem: any) => {
      try {
        const jsonData = JSON.parse($(elem).html() || '{}');
        if (jsonData.thumbnailUrl) {
          thumbnails.push(jsonData.thumbnailUrl);
        }
        if (jsonData['@graph']) {
          jsonData['@graph'].forEach((item: any) => {
            if (item.thumbnailUrl) thumbnails.push(item.thumbnailUrl);
          });
        }
      } catch (e) {
        // Ignorar errores de parsing JSON
      }
    });

    // Método 2: Buscar en meta tags
    const metaThumbnails = [
      $('meta[property="og:image"]').attr('content'),
      $('meta[name="twitter:image"]').attr('content'),
      $('meta[property="og:image:secure_url"]').attr('content'),
    ].filter(Boolean);
    
    thumbnails.push(...metaThumbnails);

    // Método 3: Buscar en el script principal de TikTok
    $('script').each((_i: number, elem: any) => {
      const scriptContent = $(elem).html() || '';
      
      // Buscar patrones de URLs de imágenes
      const imagePatterns = [
        /https:\/\/[^"]+\.tiktokcdn\.com[^"]+\.(jpg|jpeg|png|webp|avif)/gi,
        /https:\/\/[^"]+\.muscdn\.com[^"]+\.(jpg|jpeg|png|webp|avif)/gi,
        /"cover":"([^"]+)"/gi,
        /"dynamicCover":"([^"]+)"/gi,
        /"originCover":"([^"]+)"/gi
      ];

      imagePatterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(scriptContent)) !== null) {
          const url = match[1] || match[0];
          if (url && url.startsWith('http')) {
            thumbnails.push(url.replace(/\\u0026/g, '&').replace(/\\/g, ''));
          }
        }
      });
    });

    // Eliminar duplicados y filtrar URLs válidas
    return [...new Set(thumbnails)].filter(url => 
      url && 
      url.startsWith('http') && 
      (url.includes('tiktokcdn.com') || url.includes('muscdn.com') || url.includes('tiktok.com'))
    );
  }

  /**
   * Extrae el ID del video de una URL de TikTok
   */
  private static extractVideoId(url: string): string | null {
    const patterns = [
      /\/video\/(\d+)/,
      /\/v\/(\d+)/,
      /tiktok\.com.*\/(\d+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * Extrae información de un video de TikTok usando web scraping
   */
  public static async getVideoInfo(videoUrl: string): Promise<TikTokVideoData | null> {
    try {
      
      const videoId = this.extractVideoId(videoUrl);
      if (!videoId) {
        throw new Error('No se pudo extraer el ID del video de la URL');
      }


      // Método 1: Web scraping del HTML
      try {
        const html = await this.fetchTikTokPage(videoUrl);
        const thumbnails = this.extractThumbnailsFromHTML(html);
        
        if (thumbnails.length > 0) {
          
          // Extraer información adicional del HTML
          const $ = cheerio.load(html);
          const title = $('meta[property="og:title"]').attr('content') || '';
          const description = $('meta[property="og:description"]').attr('content') || title;
          
          // Intentar extraer username de la URL o del HTML
          const username = this.getTikTokUsername(videoUrl) || '';
          
          return {
            id: videoId,
            description: description,
            author: {
              username: username,
              nickname: username,
            },
            thumbnails: thumbnails,
            videoUrl: videoUrl,
            stats: {
              playCount: 0,
              shareCount: 0,
              commentCount: 0,
              diggCount: 0,
            }
          };
        }
      } catch (scrapingError) {
      }

      // Método 2: Intentar con oEmbed de TikTok
      try {
        const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(videoUrl)}`;
        const response = await axios.get(oembedUrl, { timeout: 5000 });
        
        if (response.data && response.data.thumbnail_url) {
          return {
            id: videoId,
            description: response.data.title || '',
            author: {
              username: response.data.author_name || this.getTikTokUsername(videoUrl) || '',
              nickname: response.data.author_name || '',
            },
            thumbnails: [response.data.thumbnail_url],
            videoUrl: videoUrl,
            stats: {
              playCount: 0,
              shareCount: 0,
              commentCount: 0,
              diggCount: 0,
            }
          };
        }
      } catch (oembedError) {
      }

      // Método 3: Fallback - información básica
      return {
        id: videoId,
        description: '',
        author: {
          username: this.getTikTokUsername(videoUrl) || '',
          nickname: '',
        },
        thumbnails: [],
        videoUrl: videoUrl,
        stats: {
          playCount: 0,
          shareCount: 0,
          commentCount: 0,
          diggCount: 0,
        }
      };

    } catch (error) {
      console.error('❌ Error obteniendo información del video:', error);
      return null;
    }
  }

  /**
   * Extrae el nombre de usuario de una URL de TikTok
   */
  private static getTikTokUsername(url: string): string | null {
    const usernameMatch = url.match(/@([^\/]+)/);
    return usernameMatch ? usernameMatch[1] : null;
  }

  /**
   * Obtiene solo el thumbnail de un video de TikTok usando oEmbed
   */
  public static async getThumbnail(videoUrl: string): Promise<string | null> {
    try {
      
      // Método 1: oEmbed (más confiable)
      try {
        const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(videoUrl)}`;
        const response = await axios.get(oembedUrl, {
          timeout: 10000,
          headers: {
            'User-Agent': this.USER_AGENT
          }
        });
        
        if (response.data && response.data.thumbnail_url) {
          return response.data.thumbnail_url;
        }
      } catch (oembedError) {
      }

      // Método 2: Web scraping como fallback
      const videoInfo = await this.getVideoInfo(videoUrl);
      
      if (videoInfo && videoInfo.thumbnails.length > 0) {
        const thumbnail = videoInfo.thumbnails[0];
        return thumbnail;
      }

      return null;
    } catch (error) {
      console.error('❌ Error obteniendo thumbnail:', error);
      return null;
    }
  }

  /**
   * Obtiene trending videos (simulado - TikTok no proporciona API pública)
   */
  public static async getTrendingVideos(count: number = 10) {
    try {
      // Retornar array vacío ya que no tenemos acceso a trending videos
      // sin API oficial de TikTok
      return [];
    } catch (error) {
      console.error('❌ Error obteniendo trending videos:', error);
      return [];
    }
  }
} 