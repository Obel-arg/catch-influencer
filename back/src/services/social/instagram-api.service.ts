const axios = require('axios');
const cheerio = require('cheerio');
const { BlobStorageService } = require('../blob-storage.service');
const puppeteer = require('puppeteer');

interface InstagramPostData {
  id: string;
  description: string;
  author: {
    username: string;
    fullName: string;
  };
  thumbnails: string[];
  postUrl: string;
  stats: {
    likes: number;
    comments: number;
  };
}

export class InstagramApiService {
  private static readonly USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  private static readonly SCREENSHOT_ONE_API_KEY = process.env.SCREENSHOTONE_API_KEY || '';
  private static readonly SCREENSHOT_ONE_BASE_URL = 'https://api.screenshotone.com/take';
  
  /**
   * Extrae el shortcode de una URL de Instagram
   * Funciona con URLs con y sin username
   */
  private static extractShortcode(url: string): string | null {
    
    // Regex más simple y robusto - busca directamente /p/, /reel/, /tv/ seguido del ID
    const patterns = [
      /\/p\/([A-Za-z0-9_-]+)/,
      /\/reel\/([A-Za-z0-9_-]+)/,
      /\/tv\/([A-Za-z0-9_-]+)/
    ];

    for (let i = 0; i < patterns.length; i++) {
      const pattern = patterns[i];
      const match = url.match(pattern);
      
      if (match && match[1]) {
        return match[1];
      }
    }

    console.error(`❌ [INSTAGRAM-API] No se pudo extraer shortcode de: ${url}`);
    return null;
  }

  /**
   * Verifica si la URL es una historia de Instagram
   */
  private static isInstagramStoryUrl(url: string): boolean {
    if (!url) return false;
    const patterns = [
      /^https?:\/\/(www\.)?instagram\.com\/stories\/[^\/]+\/[0-9]+\/?/i
    ];
    const isStory = patterns.some((p) => p.test(url));
    if (isStory) {
      console.log(`📸 [IG] URL detectada como historia: ${url}`);
    } else {
      console.log(`🖼️ [IG] URL NO es historia: ${url}`);
    }
    return isStory;
  }

  /**
   * Obtiene el HTML de una página de Instagram
   */
  private static async fetchInstagramPage(url: string): Promise<string> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
        },
        timeout: 15000
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo página de Instagram:', error);
      throw error;
    }
  }

  /**
   * Extrae thumbnails del HTML usando múltiples métodos
   */
  private static extractThumbnailsFromHTML(html: string): string[] {
    const $ = cheerio.load(html);
    const thumbnails: string[] = [];

    // Método 1: Buscar en meta tags
    const metaThumbnails = [
      $('meta[property="og:image"]').attr('content'),
      $('meta[name="twitter:image"]').attr('content'),
      $('meta[property="og:image:secure_url"]').attr('content'),
    ].filter(Boolean);
    
    thumbnails.push(...metaThumbnails);

    // Método 2: Buscar en scripts JSON
    $('script[type="application/ld+json"]').each((_i: number, elem: any) => {
      try {
        const jsonData = JSON.parse($(elem).html() || '{}');
        if (jsonData.image) {
          if (Array.isArray(jsonData.image)) {
            thumbnails.push(...jsonData.image);
          } else {
            thumbnails.push(jsonData.image);
          }
        }
        if (jsonData.thumbnailUrl) {
          thumbnails.push(jsonData.thumbnailUrl);
        }
      } catch (e) {
        // Ignorar errores de parsing JSON
      }
    });

    // Método 3: Buscar en el script principal de Instagram
    $('script').each((_i: number, elem: any) => {
      const scriptContent = $(elem).html() || '';
      
      // Buscar patrones de URLs de imágenes de Instagram
      const imagePatterns = [
        /https:\/\/[^"]+\.fbcdn\.net[^"]+\.(jpg|jpeg|png|webp)/gi,
        /https:\/\/[^"]+\.cdninstagram\.com[^"]+\.(jpg|jpeg|png|webp)/gi,
        /"display_url":"([^"]+)"/gi,
        /"thumbnail_src":"([^"]+)"/gi,
        /"src":"([^"]+fbcdn\.net[^"]+)"/gi
      ];

      imagePatterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(scriptContent)) !== null) {
          const url = match[1] || match[0];
          if (url && url.startsWith('http')) {
            const cleanUrl = url.replace(/\\u0026/g, '&').replace(/\\/g, '');
            if (cleanUrl.includes('fbcdn.net') || cleanUrl.includes('cdninstagram.com')) {
              thumbnails.push(cleanUrl);
            }
          }
        }
      });
    });

    // Eliminar duplicados y filtrar URLs válidas
    return [...new Set(thumbnails)].filter(url => 
      url && 
      url.startsWith('http') && 
      (url.includes('fbcdn.net') || url.includes('cdninstagram.com') || url.includes('instagram.com'))
    );
  }

  /**
   * Extrae información de un post de Instagram usando web scraping
   */
  public static async getPostInfo(postUrl: string): Promise<InstagramPostData | null> {
    try {
      
      const shortcode = this.extractShortcode(postUrl);
      if (!shortcode) {
        throw new Error('No se pudo extraer el shortcode de la URL');
      }


      // Método 1: Web scraping del HTML
      try {
        const html = await this.fetchInstagramPage(postUrl);
        const thumbnails = this.extractThumbnailsFromHTML(html);
        
        if (thumbnails.length > 0) {
          
          // Extraer información adicional del HTML
          const $ = cheerio.load(html);
          const title = $('meta[property="og:title"]').attr('content') || '';
          const description = $('meta[property="og:description"]').attr('content') || title;
          
          // Intentar extraer username de la URL o del HTML
          const username = this.extractUsername(postUrl) || '';
          
          return {
            id: shortcode,
            description: description,
            author: {
              username: username,
              fullName: username,
            },
            thumbnails: thumbnails,
            postUrl: postUrl,
            stats: {
              likes: 0,
              comments: 0,
            }
          };
        }
      } catch (scrapingError) {
      }

      // Método 2: Fallback - información básica
      return {
        id: shortcode,
        description: '',
        author: {
          username: this.extractUsername(postUrl) || '',
          fullName: '',
        },
        thumbnails: [],
        postUrl: postUrl,
        stats: {
          likes: 0,
          comments: 0,
        }
      };

    } catch (error) {
      console.error('❌ Error obteniendo información del post:', error);
      return null;
    }
  }

  /**
   * Genera una captura con ScreenshotOne y devuelve la URL directa del PNG
   */
  private static async generateScreenshotOneScreenshot(url: string): Promise<string | null> {
    try {
      const params = new URLSearchParams({
        access_key: this.SCREENSHOT_ONE_API_KEY,
        url: url,
        format: 'png',
        viewport_width: '450',
        viewport_height: '800',
        full_page: 'false',
        delay: '3',
        block_ads: 'true',
        block_trackers: 'true',
        user_agent: this.USER_AGENT,
        wait_until: 'networkidle2'
      });
      // Bloquear recursos pesados para acelerar (no bloquear media aquí por compatibilidad)
      params.append('block_resources', 'stylesheet');
      params.append('block_resources', 'font');

      // Si tenemos sessionid de Instagram, añadir cookies para sesión autenticada
      if (process.env.INSTAGRAM_SESSIONID) {
        const cookies = [
          {
            name: 'sessionid',
            value: process.env.INSTAGRAM_SESSIONID,
            domain: '.instagram.com',
            path: '/',
            httpOnly: true,
            secure: true
          }
        ];
        console.log('🔐 [IG] Agregando cookie sessionid a ScreenshotOne');
        params.append('cookies', JSON.stringify(cookies));
      }

      const screenshotUrl = `${this.SCREENSHOT_ONE_BASE_URL}?${params.toString()}`;
      const head = await axios.head(screenshotUrl, {
        timeout: 10000,
        validateStatus: (status: number) => status < 500
      });
      if (head.status < 500) {
        return screenshotUrl;
      }
      return null;
    } catch (_e) {
      // Fallback simple
      try {
        const simpleParams = new URLSearchParams({
          access_key: this.SCREENSHOT_ONE_API_KEY,
          url: url,
          format: 'png',
          viewport_width: '450',
          viewport_height: '800'
        });
        const simpleUrl = `${this.SCREENSHOT_ONE_BASE_URL}?${simpleParams.toString()}`;
        const head = await axios.head(simpleUrl, { timeout: 10000 });
        if (head.status < 500) return simpleUrl;
        return null;
      } catch {
        return null;
      }
    }
  }

  /**
   * Genera screenshot para historias con ScreenshotOne, permitiendo cookies y sin bloquear media
   */
  private static async generateStoryScreenshotWithScreenshotOne(url: string): Promise<string | null> {
    try {
      const params = new URLSearchParams({
        access_key: this.SCREENSHOT_ONE_API_KEY,
        url: url,
        format: 'png',
        viewport_width: '450',
        viewport_height: '800',
        full_page: 'false',
        delay: '4',
        block_ads: 'true',
        block_trackers: 'true',
        user_agent: this.USER_AGENT,
        wait_until: 'networkidle2'
      });

      // IMPORTANTE: No bloquear "media" para historias
      params.append('block_resources', 'stylesheet');
      params.append('block_resources', 'font');

      if (process.env.INSTAGRAM_SESSIONID) {
        const cookies = [
          {
            name: 'sessionid',
            value: process.env.INSTAGRAM_SESSIONID,
            domain: '.instagram.com',
            path: '/',
            httpOnly: true,
            secure: true
          }
        ];
        params.append('cookies', JSON.stringify(cookies));
      }

      const screenshotUrl = `${this.SCREENSHOT_ONE_BASE_URL}?${params.toString()}`;
      const head = await axios.head(screenshotUrl, {
        timeout: 15000,
        validateStatus: (status: number) => status < 500
      });
      if (head.status < 500) {
        console.log('✅ [IG] ScreenshotOne HEAD ok para historias');
        return screenshotUrl;
      }
      return null;
    } catch {
      console.warn('⚠️ [IG] ScreenshotOne con cookies falló (historias)');
      return null;
    }
  }

  /**
   * Genera una tarjeta visual estética para historias de Instagram
   */
  private static async generateStoryCard(storyUrl: string): Promise<string | null> {
    try {
      const matchParts = storyUrl.match(/instagram\.com\/stories\/([^\/]+)\/([0-9]+)/i);
      const username = matchParts?.[1] || 'unknown';
      const storyId = matchParts?.[2] || Date.now().toString();
      
      // Crear SVG estético para la historia
      const svg = `
        <svg width="400" height="600" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="instagramGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#6B46C1;stop-opacity:1" />
              <stop offset="50%" style="stop-color:#9333EA;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#A855F7;stop-opacity:1" />
            </linearGradient>
            <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
            </linearGradient>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000" flood-opacity="0.15"/>
            </filter>
          </defs>
          
          <!-- Fondo principal -->
          <rect width="400" height="600" rx="24" fill="url(#cardGradient)" filter="url(#shadow)"/>
          
          <!-- Header con gradiente de Instagram -->
          <rect width="400" height="80" rx="24" fill="url(#instagramGradient)"/>
          <rect width="400" height="56" y="24" fill="url(#instagramGradient)"/>
          
          <!-- Icono de Instagram -->
          <circle cx="60" cy="40" r="18" fill="white"/>
          <rect x="48" y="28" width="24" height="24" rx="8" fill="url(#instagramGradient)"/>
          <circle cx="60" cy="40" r="5" fill="white"/>
          <circle cx="66" cy="34" r="2" fill="white"/>
          
          <!-- Título -->
          <text x="95" y="35" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="white">Instagram Story</text>
          <text x="95" y="52" font-family="Arial, sans-serif" font-size="13" fill="rgba(255,255,255,0.9)">@${username}</text>
          
          <!-- Contenido principal -->
          <rect x="40" y="120" width="320" height="380" rx="16" fill="rgba(255,255,255,0.95)" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
          
          <!-- Icono de play/story grande -->
          <circle cx="200" cy="280" r="50" fill="rgba(107,70,193,0.1)" stroke="url(#instagramGradient)" stroke-width="3"/>
          <polygon points="185,260 185,300 215,280" fill="url(#instagramGradient)"/>
          
          <!-- Información de la historia -->
          <text x="200" y="360" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#333" text-anchor="middle">Historia de Instagram</text>
          <text x="200" y="385" font-family="Arial, sans-serif" font-size="14" fill="#666" text-anchor="middle">Contenido multimedia</text>
          
          <!-- Footer simplificado -->
          <rect x="40" y="520" width="320" height="60" rx="12" fill="rgba(255,255,255,0.8)"/>
          <text x="200" y="550" font-family="Arial, sans-serif" font-size="14" fill="#666" text-anchor="middle">@${username}</text>
          <text x="200" y="570" font-family="Arial, sans-serif" font-size="12" fill="#999" text-anchor="middle">Historia de Instagram</text>
          
          <!-- Decoración -->
          <circle cx="350" cy="150" r="30" fill="rgba(168,85,247,0.1)"/>
          <circle cx="50" cy="450" r="25" fill="rgba(147,51,234,0.1)"/>
        </svg>
      `;

      // Convertir SVG a Base64 para usar como Data URL
      const base64Svg = Buffer.from(svg).toString('base64');
      const dataUrl = `data:image/svg+xml;base64,${base64Svg}`;
      
      console.log('✅ [IG] Tarjeta estética generada para @' + username);
      return dataUrl;
    } catch (error) {
      console.error('❌ [IG] Error generando tarjeta estética:', error);
      return null;
    }
  }

  /**
   * Extrae el nombre de usuario de una URL de Instagram
   * Funciona con URLs con username, retorna null para URLs directas
   */
  private static extractUsername(url: string): string | null {
    
    // Método 1: URLs con username como https://www.instagram.com/vaustinl/p/B3cXIshHjlZ/
    const usernameWithPostMatch = url.match(/instagram\.com\/([^\/\?]+)\/(?:p|reel|tv)\//);
    if (usernameWithPostMatch && usernameWithPostMatch[1]) {
      const username = usernameWithPostMatch[1];
      return username;
    }
    
    // Método 2: URLs directas como https://www.instagram.com/p/B3cXIshHjlZ/
    if (url.match(/instagram\.com\/(?:p|reel|tv)\//)) {
      return null;
    }
    
    // Método 3: Fallback general para otros formatos
    const generalMatch = url.match(/instagram\.com\/([^\/\?]+)/);
    if (generalMatch && generalMatch[1] && !['p', 'reel', 'tv'].includes(generalMatch[1])) {
      const username = generalMatch[1];
      return username;
    }
    
    return null;
  }

  /**
   * Obtiene solo el thumbnail de un post de Instagram
   */
  public static async getThumbnail(postUrl: string): Promise<string | null> {
    try {
      // Si es una historia, generar tarjeta estética
      if (this.isInstagramStoryUrl(postUrl)) {
        console.log('🎨 [IG] Generando tarjeta estética para historia');
        return await this.generateStoryCard(postUrl);
      }

      // Para posts normales, intentar obtener información completa
      const postInfo = await this.getPostInfo(postUrl);
      if (postInfo && postInfo.thumbnails.length > 0) {
        return postInfo.thumbnails[0];
      }

      return null;
    } catch (error) {
      console.error('❌ Error obteniendo thumbnail:', error);
      return null;
    }
  }

  /**
   * Verifica si una URL es de Instagram
   * Funciona con URLs con y sin username
   */
  public static isInstagramUrl(url: string): boolean {
    if (!url) return false;
    
    const instagramPatterns = [
      // URLs directas: https://www.instagram.com/p/POST_ID
      /^https?:\/\/(www\.)?instagram\.com\/p\/[A-Za-z0-9_-]+/i,
      /^https?:\/\/(www\.)?instagram\.com\/reel\/[A-Za-z0-9_-]+/i,
      /^https?:\/\/(www\.)?instagram\.com\/tv\/[A-Za-z0-9_-]+/i,
      // Historias: https://www.instagram.com/stories/{username}/{story_id}/
      /^https?:\/\/(www\.)?instagram\.com\/stories\/[^\/]+\/[0-9]+\/?/i,
      
      // URLs con username: https://www.instagram.com/username/p/POST_ID
      /^https?:\/\/(www\.)?instagram\.com\/[^\/]+\/p\/[A-Za-z0-9_-]+/i,
      /^https?:\/\/(www\.)?instagram\.com\/[^\/]+\/reel\/[A-Za-z0-9_-]+/i,
      /^https?:\/\/(www\.)?instagram\.com\/[^\/]+\/tv\/[A-Za-z0-9_-]+/i
    ];
    
    const isValid = instagramPatterns.some(pattern => pattern.test(url));
    
    return isValid;
  }
} 