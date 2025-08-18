const axios = require('axios');
const cheerio = require('cheerio');
const { BlobStorageService } = require('../blob-storage.service');

interface TwitterPostData {
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

export class TwitterApiService {
  private static readonly USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  private static readonly SCREENSHOT_ONE_API_KEY = 'muApN7NAThedvw';
  private static readonly SCREENSHOT_ONE_BASE_URL = 'https://api.screenshotone.com/take';
  
  /**
   * Extrae el ID del tweet de una URL de Twitter/X
   */
  private static extractTweetId(url: string): string | null {
    const patterns = [
      /twitter\.com\/[^\/]+\/status\/(\d+)/i,
      /x\.com\/[^\/]+\/status\/(\d+)/i,
      /\/status\/(\d+)/i
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
   * Extrae el nombre de usuario de una URL de Twitter/X
   */
  private static extractUsername(url: string): string | null {
    const patterns = [
      /twitter\.com\/([^\/\?]+)\/status/i,
      /x\.com\/([^\/\?]+)\/status/i
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
   * Obtiene información del tweet usando oEmbed de Twitter
   */
  private static async getTwitterOEmbed(url: string): Promise<any> {
    try {
      
      // Twitter oEmbed endpoint
      const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}&omit_script=true&hide_thread=true`;
      
      const response = await axios.get(oembedUrl, {
        headers: {
          'User-Agent': this.USER_AGENT,
          'Accept': 'application/json',
        },
        timeout: 10000
      });

      if (response.data) {
        return response.data;
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Obtiene el HTML de una página de Twitter/X
   */
  private static async fetchTwitterPage(url: string): Promise<string> {
    try {
      // Convertir URL de x.com a twitter.com para mejor compatibilidad
      const twitterUrl = url.replace('x.com', 'twitter.com');
      
      const response = await axios.get(twitterUrl, {
        headers: {
          'User-Agent': this.USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        timeout: 15000
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo página de Twitter:', error);
      throw error;
    }
  }

  /**
   * Extrae información del HTML de Twitter
   */
  private static extractTwitterDataFromHTML(html: string): Partial<TwitterPostData> {
    const $ = cheerio.load(html);
    const data: Partial<TwitterPostData> = {
      media: { photos: [], videos: [] },
      stats: { retweets: 0, likes: 0, replies: 0 }
    };

    // Extraer meta tags
    data.text = $('meta[property="og:description"]').attr('content') || 
                $('meta[name="description"]').attr('content') || '';
    
    // Extraer imágenes
    const ogImage = $('meta[property="og:image"]').attr('content');
    const twitterImage = $('meta[name="twitter:image"]').attr('content');
    
    if (ogImage && ogImage.includes('twimg.com')) {
      data.media!.photos!.push(ogImage);
    }
    if (twitterImage && twitterImage.includes('twimg.com')) {
      data.media!.photos!.push(twitterImage);
    }

    // Eliminar duplicados
    data.media!.photos = [...new Set(data.media!.photos!)];

    return data;
  }

  /**
   * Genera una URL de captura de pantalla del tweet usando múltiples métodos
   */
  private static generateScreenshotUrl(url: string): string {
    // Método 1: Microlink (más confiable, gratuito con límites)
    return `https://api.microlink.io/screenshot?url=${encodeURIComponent(url)}&viewport.width=600&viewport.height=800&type=png&element=article&wait_for=3000`;
  }

  /**
   * Genera una URL de captura de pantalla del tweet usando múltiples servicios como fallback
   */
  private static async generateScreenshotUrlWithFallback(url: string): Promise<string | null> {
    // Esperar forzosamente 5 segundos antes de tomar la captura
    console.log('⏱️ Esperando 5 segundos forzosamente para que la página cargue...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    console.log('✅ Tiempo de espera completado');
    
    const screenshotServices = [
      // Servicio 1: Microlink (más confiable, gratuito con límites)
      `https://api.microlink.io/screenshot?url=${encodeURIComponent(url)}&viewport.width=600&viewport.height=800&type=png&element=article&wait_for=3000`,
      
      // Servicio 2: ScreenshotAPI.net (con token demo)
      `https://shot.screenshotapi.net/screenshot?token=demo&url=${encodeURIComponent(url)}&width=600&height=800&file_type=png&wait_for_event=load&delay=2000`,
      
      // Servicio 3: HTML-CSS-to-Image (más confiable)
      `https://htmlcsstoimage.com/demo_run?url=${encodeURIComponent(url)}&width=600&height=800&format=png&wait_for=3000`,
      
      // Servicio 4: Screenshot.guru (como último recurso)
      `https://screenshot.guru/api/screenshot?url=${encodeURIComponent(url)}&width=600&height=800&format=png&fullpage=false&fresh=true&wait=3000&block_ads=true&hide_cookie_banners=true`
    ];

    for (let i = 0; i < screenshotServices.length; i++) {
      const serviceUrl = screenshotServices[i];
      const serviceName = ['Microlink', 'ScreenshotAPI', 'HTML-CSS-to-Image', 'Screenshot.guru'][i];
      
      try {
        console.log(`🔄 Probando servicio ${serviceName}...`);
        
        // Hacer una petición GET en lugar de HEAD para verificar mejor
        const response = await axios.get(serviceUrl, { 
          timeout: 15000,
          validateStatus: (status: number) => status < 500,
          maxRedirects: 5
        });
        
        if (response.status < 500) {
          console.log(`✅ Servicio ${serviceName} funcionando:`, serviceUrl);
          return serviceUrl;
        }
      } catch (error: any) {
        console.warn(`⚠️ Servicio ${serviceName} falló:`, error.message);
        
        // Si es el último servicio, intentar con una configuración más simple
        if (i === screenshotServices.length - 1) {
          try {
            console.log('🔄 Intentando configuración simple con Screenshot.guru...');
            const simpleUrl = `https://screenshot.guru/api/screenshot?url=${encodeURIComponent(url)}&width=600&height=800&format=png&fullpage=false`;
            const simpleResponse = await axios.get(simpleUrl, { timeout: 10000 });
            if (simpleResponse.status < 500) {
              console.log('✅ Configuración simple funcionando');
              return simpleUrl;
            }
          } catch (simpleError: any) {
            console.warn('⚠️ Configuración simple también falló:', simpleError.message);
          }
        }
        
        continue;
      }
    }

    return null;
  }

  /**
   * Extrae la imagen del JSON de Microlink y la devuelve directamente
   */
  private static async extractImageFromMicrolink(url: string): Promise<string | null> {
    try {
      console.log('🔄 Iniciando extracción de imagen de Microlink...');
      
      // Esperar forzosamente 5 segundos antes de tomar la captura
      console.log('⏱️ Esperando 5 segundos forzosamente para que la página cargue...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      console.log('✅ Tiempo de espera completado');
      
      // Usar Microlink para obtener información del tweet con tiempo de espera extendido
      const microlinkUrl = `https://api.microlink.io?url=${encodeURIComponent(url)}&meta=true&embed=screenshot.url&screenshot=true&viewport.width=600&viewport.height=800&screenshot.type=png&screenshot.wait_for=8000&screenshot.delay=3000&screenshot.element=article`;
      
      console.log('📡 Llamando a Microlink:', microlinkUrl);
      
      const response = await axios.get(microlinkUrl, { 
        timeout: 30000, // Aumentar timeout a 30 segundos
        validateStatus: (status: number) => status < 500
      });
      
      console.log('📥 Respuesta de Microlink recibida, status:', response.status);
      
      // Verificar si la respuesta es una imagen directa
      const contentType = response.headers['content-type'];
      if (contentType && contentType.includes('image/')) {
        console.log('✅ Microlink devolvió una imagen directamente');
        // Devolver la URL de Microlink que genera la imagen
        return microlinkUrl;
      }
      
      // Si no es imagen, intentar parsear como JSON
      try {
        console.log('📄 Intentando parsear respuesta como JSON...');
        const jsonData = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
        
        if (jsonData && jsonData.status === 'success') {
          const data = jsonData.data;
          console.log('📊 Datos de Microlink:', {
            hasImage: !!data.image,
            hasScreenshot: !!data.screenshot,
            imageUrl: data.image?.url,
            screenshotUrl: data.screenshot?.url
          });
          
          // Si hay una imagen de video/media (que no sea del perfil), usarla
          if (data.image && data.image.url) {
            // Verificar que no sea una imagen de perfil (normalmente son cuadradas y pequeñas)
            const isProfileImage = data.image.width === data.image.height && 
                                 (data.image.width <= 400 || data.image.height <= 400) &&
                                 data.image.url.includes('profile_images');
            
            console.log('🔍 Verificando imagen:', {
              width: data.image.width,
              height: data.image.height,
              url: data.image.url,
              isProfileImage
            });
            
            if (!isProfileImage) {
              console.log('✅ Imagen de video/media extraída de Microlink:', data.image.url);
              return data.image.url;
            } else {
              console.log('⚠️ Imagen de perfil detectada en Microlink, buscando captura de pantalla...');
            }
          }
          
          // Si hay una captura de pantalla, usarla
          if (data.screenshot && data.screenshot.url) {
            console.log('✅ Captura de pantalla extraída de Microlink:', data.screenshot.url);
            return data.screenshot.url;
          }
          
          console.log('❌ No se encontró imagen ni screenshot en Microlink');
        } else {
          console.log('❌ Microlink no devolvió status success:', jsonData?.status);
        }
      } catch (jsonError: any) {
        console.log('❌ Error parseando JSON de Microlink:', jsonError.message);
      }
      
      return null;
    } catch (error: any) {
      console.warn('⚠️ Error extrayendo imagen de Microlink:', error.message);
      return null;
    }
  }

  /**
   * Genera una captura de pantalla usando servicios que devuelven imágenes directamente
   */
  private static async generateReliableScreenshot(url: string): Promise<string | null> {
    try {
      // Esperar forzosamente 5 segundos antes de tomar la captura
      console.log('⏱️ Esperando 5 segundos forzosamente para que la página cargue...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      console.log('✅ Tiempo de espera completado');
      
      // Usar servicios que devuelven imágenes directamente con tiempos de espera extendidos
      const reliableServices = [
        // Servicio 1: ScreenshotAPI.net (devuelve imagen directamente)
        `https://shot.screenshotapi.net/screenshot?token=demo&url=${encodeURIComponent(url)}&width=600&height=800&file_type=png&wait_for_event=load&delay=5000`,
        
        // Servicio 2: HTML-CSS-to-Image (devuelve imagen directamente)
        `https://htmlcsstoimage.com/demo_run?url=${encodeURIComponent(url)}&width=600&height=800&format=png&wait_for=8000`,
        
        // Servicio 3: Screenshot.guru (devuelve imagen directamente)
        `https://screenshot.guru/api/screenshot?url=${encodeURIComponent(url)}&width=600&height=800&format=png&fullpage=false&fresh=true&wait=8000&block_ads=true&hide_cookie_banners=true`,
        
        // Servicio 4: Microlink screenshot directo (sin parámetros que generen JSON)
        `https://api.microlink.io/screenshot?url=${encodeURIComponent(url)}&viewport.width=600&viewport.height=800&type=png&element=article&wait_for=8000&delay=3000`
      ];

      for (let i = 0; i < reliableServices.length; i++) {
        const serviceUrl = reliableServices[i];
        const serviceName = ['ScreenshotAPI', 'HTML-CSS-to-Image', 'Screenshot.guru', 'Microlink'][i];
        
        try {
          console.log(`🔄 Probando servicio ${serviceName}...`);
          
          // Verificar que el servicio devuelva una imagen
          const response = await axios.get(serviceUrl, { 
            timeout: 15000,
            validateStatus: (status: number) => status < 500,
            maxRedirects: 5,
            responseType: 'arraybuffer' // Para verificar que es una imagen
          });
          
          if (response.status < 500) {
            // Verificar que el content-type sea de imagen
            const contentType = response.headers['content-type'];
            if (contentType && (contentType.includes('image/') || contentType.includes('application/octet-stream'))) {
              console.log(`✅ Servicio ${serviceName} funcionando y devuelve imagen:`, serviceUrl);
              return serviceUrl;
            } else {
              console.log(`⚠️ Servicio ${serviceName} devuelve ${contentType}, no es imagen`);
            }
          }
        } catch (error: any) {
          console.warn(`⚠️ Servicio ${serviceName} falló:`, error.message);
          
          // Si es el último servicio, intentar con una configuración más simple
          if (i === reliableServices.length - 1) {
            try {
              console.log('🔄 Intentando configuración simple con Screenshot.guru...');
              const simpleUrl = `https://screenshot.guru/api/screenshot?url=${encodeURIComponent(url)}&width=600&height=800&format=png&fullpage=false`;
              const simpleResponse = await axios.get(simpleUrl, { 
                timeout: 10000,
                responseType: 'arraybuffer'
              });
              if (simpleResponse.status < 500) {
                const contentType = simpleResponse.headers['content-type'];
                if (contentType && (contentType.includes('image/') || contentType.includes('application/octet-stream'))) {
                  console.log('✅ Configuración simple funcionando');
                  return simpleUrl;
                }
              }
            } catch (simpleError: any) {
              console.warn('⚠️ Configuración simple también falló:', simpleError.message);
            }
          }
          
          continue;
        }
      }

      return null;
    } catch (error) {
      console.error('❌ Error generando captura confiable:', error);
      return null;
    }
  }

  /**
   * Genera una captura de pantalla usando ScreenshotOne API
   */
  private static async generateScreenshotOneScreenshot(url: string): Promise<string | null> {
    try {
      console.log('🔄 Generando captura con ScreenshotOne API...');
      
      // Parámetros corregidos según la documentación de ScreenshotOne
      const params = new URLSearchParams({
        access_key: this.SCREENSHOT_ONE_API_KEY,
        url: url,
        format: 'png',
        viewport_width: '600',
        viewport_height: '800',
        full_page: 'false',
        delay: '3',
        block_ads: 'true',
        block_trackers: 'true',
        user_agent: this.USER_AGENT,
        // Parámetros específicos para Twitter corregidos
        wait_until: 'networkidle2'
      });
      
      // Agregar block_resources como parámetros separados (array)
      params.append('block_resources', 'image');
      params.append('block_resources', 'stylesheet');
      params.append('block_resources', 'font');
      params.append('block_resources', 'media');
      
      const screenshotUrl = `${this.SCREENSHOT_ONE_BASE_URL}?${params.toString()}`;
      
      console.log('📡 Llamando a ScreenshotOne API...');
      console.log('🔗 URL generada:', screenshotUrl);
      
      // Verificar que la URL es válida antes de hacer la petición
      const testResponse = await axios.head(screenshotUrl, { 
        timeout: 10000,
        validateStatus: (status: number) => status < 500
      });
      
      if (testResponse.status < 500) {
        console.log('✅ ScreenshotOne API funcionando correctamente');
        return screenshotUrl;
      } else {
        console.warn('⚠️ ScreenshotOne API devolvió status:', testResponse.status);
        return null;
      }
      
    } catch (error: any) {
      console.warn('⚠️ Error con ScreenshotOne API:', error.message);
      
      // Intentar con configuración más simple como fallback
      try {
        console.log('🔄 Intentando configuración simple con ScreenshotOne...');
        const simpleParams = new URLSearchParams({
          access_key: this.SCREENSHOT_ONE_API_KEY,
          url: url,
          format: 'png',
          viewport_width: '600',
          viewport_height: '800'
        });
        
        const simpleUrl = `${this.SCREENSHOT_ONE_BASE_URL}?${simpleParams.toString()}`;
        const simpleResponse = await axios.head(simpleUrl, { timeout: 10000 });
        
        if (simpleResponse.status < 500) {
          console.log('✅ Configuración simple de ScreenshotOne funcionando');
          return simpleUrl;
        }
      } catch (simpleError: any) {
        console.warn('⚠️ Configuración simple de ScreenshotOne también falló:', simpleError.message);
      }
      
      return null;
    }
  }

  /**
   * Obtiene información completa de un tweet
   */
  public static async getPostInfo(postUrl: string): Promise<TwitterPostData | null> {
    try {
      
      const tweetId = this.extractTweetId(postUrl);
      const username = this.extractUsername(postUrl);
      
      if (!tweetId) {
        throw new Error('No se pudo extraer el ID del tweet');
      }

     

      // Método 1: Intentar oEmbed primero
      let oembedData = null;
      try {
        oembedData = await this.getTwitterOEmbed(postUrl);
      } catch (error) {
      }

      // Método 2: Web scraping como fallback
      let scrapedData: Partial<TwitterPostData> = {
        media: { photos: [], videos: [] },
        stats: { retweets: 0, likes: 0, replies: 0 }
      };

      try {
        const html = await this.fetchTwitterPage(postUrl);
        scrapedData = this.extractTwitterDataFromHTML(html);
      } catch (scrapingError) {
      }

      // Combinar datos
      const result: TwitterPostData = {
        id: tweetId,
        text: (oembedData as any)?.html ? 
          // Extraer texto del HTML de oEmbed
          cheerio.load((oembedData as any).html)('p').text() || scrapedData.text || '' :
          scrapedData.text || '',
        author: {
          username: username || (oembedData as any)?.author_name || 'usuario',
          displayName: (oembedData as any)?.author_name || username || 'Usuario de Twitter',
          profileImage: undefined
        },
        media: {
          photos: scrapedData.media?.photos || [],
          videos: scrapedData.media?.videos || []
        },
        embedHtml: (oembedData as any)?.html || undefined,
        thumbnail: await this.generateScreenshotOneScreenshot(postUrl) || this.generateScreenshotUrl(postUrl), // Usar ScreenshotOne como prioridad
        postUrl: postUrl,
        stats: scrapedData.stats || { retweets: 0, likes: 0, replies: 0 },
        createdAt: undefined
      };

      return result;

    } catch (error) {
      console.error('❌ Error obteniendo información del tweet:', error);
      return null;
    }
  }

  /**
   * Genera y guarda la miniatura de un tweet en blob storage
   */
  public static async generateAndStoreThumbnail(postUrl: string): Promise<string | null> {
    try {
      console.log('🔄 Generando y guardando miniatura de Twitter en blob storage...');
      
      // Extraer información básica del tweet
      const tweetId = this.extractTweetId(postUrl);
      const username = this.extractUsername(postUrl);
      
      if (!tweetId) {
        throw new Error('No se pudo extraer el ID del tweet');
      }
      
      // MÉTODO 1: ScreenshotOne API (PRIORITARIO - API pagada más confiable)
      try {
        const screenshotOneUrl = await this.generateScreenshotOneScreenshot(postUrl);
        if (screenshotOneUrl) {
          console.log('✅ Captura con ScreenshotOne API generada, guardando en blob...');
          
          // Guardar la imagen en blob storage
          const blobUrl = await BlobStorageService.uploadImageFromUrl(screenshotOneUrl, `twitter-screenshots/${tweetId}-${Date.now()}.png`);
          console.log('✅ Miniatura guardada en blob storage:', blobUrl);
          return blobUrl;
        }
      } catch (error: any) {
        console.warn('⚠️ Error con ScreenshotOne API:', error.message);
      }
      
      // MÉTODO 2: Extraer imagen del JSON de Microlink (fallback gratuito)
      try {
        const extractedImage = await this.extractImageFromMicrolink(postUrl);
        if (extractedImage) {
          console.log('✅ Imagen extraída de Microlink, guardando en blob...');
          
          // Guardar la imagen en blob storage
          const blobUrl = await BlobStorageService.uploadImageFromUrl(extractedImage, `twitter-images/${tweetId}-${Date.now()}.png`);
          console.log('✅ Miniatura guardada en blob storage:', blobUrl);
          return blobUrl;
        }
      } catch (error: any) {
        console.warn('⚠️ Error extrayendo imagen de Microlink:', error.message);
      }
      
      // MÉTODO 3: Generar captura real del contenido del tweet (otros servicios gratuitos)
      try {
        const screenshotUrl = await this.generateReliableScreenshot(postUrl);
        
        if (screenshotUrl) {
          console.log('✅ Captura real de Twitter generada, guardando en blob...');
          
          // Guardar la imagen en blob storage
          const blobUrl = await BlobStorageService.uploadImageFromUrl(screenshotUrl, `twitter-screenshots/${tweetId}-${Date.now()}.png`);
          console.log('✅ Miniatura guardada en blob storage:', blobUrl);
          return blobUrl;
        }
      } catch (screenshotError) {
        console.warn('⚠️ Error generando captura real de Twitter:', screenshotError);
        
        // Intentar con el método de fallback si el principal falla
        try {
          const fallbackUrl = await this.generateScreenshotUrlWithFallback(postUrl);
          if (fallbackUrl) {
            console.log('✅ Captura de fallback generada, guardando en blob...');
            
            // Guardar la imagen en blob storage
            const blobUrl = await BlobStorageService.uploadImageFromUrl(fallbackUrl, `twitter-screenshots/${tweetId}-${Date.now()}.png`);
            console.log('✅ Miniatura guardada en blob storage:', blobUrl);
            return blobUrl;
          }
        } catch (fallbackError) {
          console.warn('⚠️ Error en método de fallback:', fallbackError);
        }
      }
      
      // MÉTODO 4: Intentar obtener imagen de oEmbed (si el tweet tiene media)
      try {
        const oembedData = await this.getTwitterOEmbed(postUrl);
        
        if (oembedData && (oembedData as any).thumbnail_url) {
          console.log('✅ Thumbnail de oEmbed encontrado, guardando en blob...');
          
          // Guardar la imagen en blob storage
          const blobUrl = await BlobStorageService.uploadImageFromUrl((oembedData as any).thumbnail_url, `twitter-thumbnails/${tweetId}-${Date.now()}.png`);
          console.log('✅ Miniatura guardada en blob storage:', blobUrl);
          return blobUrl;
        }
        
        // Si hay HTML embebido, extraer imagen de ahí
        if (oembedData && (oembedData as any).html) {
          const embedHtml = (oembedData as any).html;
          
          const $ = cheerio.load(embedHtml);
          const images = $('img').toArray();
          
          for (const img of images) {
            const src = $(img).attr('src');
            if (src && (src.includes('pbs.twimg.com') || src.includes('twimg.com'))) {
              console.log('✅ Imagen de HTML embebido encontrada, guardando en blob...');
              
              // Guardar la imagen en blob storage
              const blobUrl = await BlobStorageService.uploadImageFromUrl(src, `twitter-images/${tweetId}-${Date.now()}.png`);
              console.log('✅ Miniatura guardada en blob storage:', blobUrl);
              return blobUrl;
            }
          }
        }
      } catch (error) {
        console.warn('⚠️ Error obteniendo oEmbed de Twitter:', error);
      }

      // MÉTODO 5: Intentar extraer imagen del HTML directo
      try {
        const html = await this.fetchTwitterPage(postUrl);
        const scrapedData = this.extractTwitterDataFromHTML(html);
        
        if (scrapedData.media && scrapedData.media.photos && scrapedData.media.photos.length > 0) {
          console.log('✅ Imagen del HTML directo encontrada, guardando en blob...');
          
          // Guardar la imagen en blob storage
          const blobUrl = await BlobStorageService.uploadImageFromUrl(scrapedData.media.photos[0], `twitter-images/${tweetId}-${Date.now()}.png`);
          console.log('✅ Miniatura guardada en blob storage:', blobUrl);
          return blobUrl;
        }
      } catch (error) {
        console.warn('⚠️ Error extrayendo imagen del HTML de Twitter:', error);
      }

      // MÉTODO 6: Generar placeholder mejorado con información del tweet
      const placeholderText = encodeURIComponent(`Tweet${username ? ` by @${username}` : ''}`);
      
      // Opción 1: Usar dummyimage.com (más confiable)
      try {
        const placeholderUrl = `https://dummyimage.com/600x400/1da1f2/ffffff&text=${placeholderText}`;
        const testResponse = await axios.head(placeholderUrl, { timeout: 5000 });
        if (testResponse.status === 200) {
          console.log('✅ Placeholder generado, guardando en blob...');
          
          // Guardar la imagen en blob storage
          const blobUrl = await BlobStorageService.uploadImageFromUrl(placeholderUrl, `twitter-placeholders/${tweetId}-${Date.now()}.png`);
          console.log('✅ Placeholder guardado en blob storage:', blobUrl);
          return blobUrl;
        }
      } catch (error) {
      }
      
      // Opción 2: Usar placehold.co
      try {
        const placeholderUrl = `https://placehold.co/600x400/1da1f2/ffffff/png?text=${placeholderText}`;
        const testResponse = await axios.head(placeholderUrl, { timeout: 5000 });
        if (testResponse.status === 200) {
          console.log('✅ Placeholder generado, guardando en blob...');
          
          // Guardar la imagen en blob storage
          const blobUrl = await BlobStorageService.uploadImageFromUrl(placeholderUrl, `twitter-placeholders/${tweetId}-${Date.now()}.png`);
          console.log('✅ Placeholder guardado en blob storage:', blobUrl);
          return blobUrl;
        }
      } catch (error) {
      }
      
      console.log('❌ No se pudo generar ninguna miniatura para el tweet');
      return null;

    } catch (error) {
      console.error('❌ Error generando y guardando miniatura de Twitter:', error);
      return null;
    }
  }

  /**
   * Obtiene solo la miniatura/captura de un tweet (método original para compatibilidad)
   */
  public static async getThumbnail(postUrl: string): Promise<string | null> {
    try {
      
      // Extraer información básica del tweet
      const tweetId = this.extractTweetId(postUrl);
      const username = this.extractUsername(postUrl);
      
      // MÉTODO 1: ScreenshotOne API (PRIORITARIO - API pagada más confiable)
      try {
        const screenshotOneUrl = await this.generateScreenshotOneScreenshot(postUrl);
        if (screenshotOneUrl) {
          console.log('✅ Captura con ScreenshotOne API generada:', screenshotOneUrl);
          return screenshotOneUrl;
        }
      } catch (error: any) {
        console.warn('⚠️ Error con ScreenshotOne API:', error.message);
      }
      
      // MÉTODO 2: Extraer imagen del JSON de Microlink (fallback gratuito)
      try {
        const extractedImage = await this.extractImageFromMicrolink(postUrl);
        if (extractedImage) {
          return extractedImage;
        }
      } catch (error: any) {
        console.warn('⚠️ Error extrayendo imagen de Microlink:', error.message);
      }
      
      // MÉTODO 3: Generar captura real del contenido del tweet (otros servicios gratuitos)
      try {
        const screenshotUrl = await this.generateReliableScreenshot(postUrl);
        
        if (screenshotUrl) {
          console.log('✅ Captura real de Twitter generada:', screenshotUrl);
          return screenshotUrl;
        }
      } catch (screenshotError) {
        console.warn('⚠️ Error generando captura real de Twitter:', screenshotError);
        
        // Intentar con el método de fallback si el principal falla
        try {
          const fallbackUrl = await this.generateScreenshotUrlWithFallback(postUrl);
          if (fallbackUrl) {
            console.log('✅ Captura de fallback generada:', fallbackUrl);
            return fallbackUrl;
          }
        } catch (fallbackError) {
          console.warn('⚠️ Error en método de fallback:', fallbackError);
        }
      }
      
      // MÉTODO 3: Intentar obtener imagen de oEmbed (si el tweet tiene media)
      try {
        const oembedData = await this.getTwitterOEmbed(postUrl);
        
        if (oembedData && (oembedData as any).thumbnail_url) {
          return (oembedData as any).thumbnail_url;
        }
        
        // Si hay HTML embebido, extraer imagen de ahí
        if (oembedData && (oembedData as any).html) {
          const embedHtml = (oembedData as any).html;
          
          const $ = cheerio.load(embedHtml);
          const images = $('img').toArray();
          
          for (const img of images) {
            const src = $(img).attr('src');
            if (src && (src.includes('pbs.twimg.com') || src.includes('twimg.com'))) {
              return src;
            }
          }
        }
      } catch (error) {
        console.warn('⚠️ Error obteniendo oEmbed de Twitter:', error);
      }

      // MÉTODO 4: Intentar extraer imagen del HTML directo
      try {
        const html = await this.fetchTwitterPage(postUrl);
        const scrapedData = this.extractTwitterDataFromHTML(html);
        
        if (scrapedData.media && scrapedData.media.photos && scrapedData.media.photos.length > 0) {
          return scrapedData.media.photos[0];
        }
      } catch (error) {
        console.warn('⚠️ Error extrayendo imagen del HTML de Twitter:', error);
      }

      // MÉTODO 5: Generar placeholder mejorado con información del tweet
      const placeholderText = encodeURIComponent(`Tweet${username ? ` by @${username}` : ''}`);
      
      // Opción 1: Usar dummyimage.com (más confiable)
      try {
        const placeholderUrl = `https://dummyimage.com/600x400/1da1f2/ffffff&text=${placeholderText}`;
        const testResponse = await axios.head(placeholderUrl, { timeout: 5000 });
        if (testResponse.status === 200) {
          return placeholderUrl;
        }
      } catch (error) {
      }
      
      // Opción 2: Usar placehold.co
      try {
        const placeholderUrl = `https://placehold.co/600x400/1da1f2/ffffff/png?text=${placeholderText}`;
        const testResponse = await axios.head(placeholderUrl, { timeout: 5000 });
        if (testResponse.status === 200) {
          return placeholderUrl;
        }
      } catch (error) {
      }
      
      // Fallback final - imagen SVG por defecto
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDYwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjMURBMUYyIi8+CjxwYXRoIGQ9Ik0yNzAgMTcwSDI0MEwyMjAgMjAwTDE5NSAxNzBIMTYwTDIwNSAyMTVMMTYwIDI2MEgxOTVMMjIwIDIzMEwyNDAgMjYwSDI3MEwyMzAgMjE1TDI3MCAxNzBaIiBmaWxsPSJ3aGl0ZSIvPgo8dGV4dCB4PSIzMDAiIHk9IjIyMCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmaWxsPSJ3aGl0ZSI+VHdpdHRlciBQb3N0PC90ZXh0Pgo8L3N2Zz4=';

    } catch (error) {
      console.error('❌ Error obteniendo thumbnail de Twitter:', error);
      
      // Fallback final - imagen SVG por defecto
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDYwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjMURBMUYyIi8+CjxwYXRoIGQ9Ik0yNzAgMTcwSDI0MEwyMjAgMjAwTDE5NSAxNzBIMTYwTDIwNSAyMTVMMTYwIDI2MEgxOTVMMjIwIDIzMEwyNDAgMjYwSDI3MEwyMzAgMjE1TDI3MCAxNzBaIiBmaWxsPSJ3aGl0ZSIvPgo8dGV4dCB4PSIzMDAiIHk9IjIyMCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmaWxsPSJ3aGl0ZSI+VHdpdHRlciBQb3N0PC90ZXh0Pgo8L3N2Zz4=';
    }
  }



  /**
   * Verifica si una URL es de Twitter/X
   */
  public static isTwitterUrl(url: string): boolean {
    if (!url) return false;
    
    const twitterPatterns = [
      /^https?:\/\/(www\.)?(twitter|x)\.com\/[^\/]+\/status\/\d+/i,
      /^https?:\/\/(mobile\.)?(twitter|x)\.com\/[^\/]+\/status\/\d+/i
    ];
    
    return twitterPatterns.some(pattern => pattern.test(url));
  }

  /**
   * Obtiene el HTML embebido de un tweet (para mostrar el tweet completo)
   */
  public static async getEmbedHtml(postUrl: string): Promise<string | null> {
    try {
      const oembedData = await this.getTwitterOEmbed(postUrl);
      return oembedData?.html || null;
    } catch (error) {
      console.error('❌ Error obteniendo HTML embebido:', error);
      return null;
    }
  }

  /**
   * Prueba la conexión con ScreenshotOne API
   */
  public static async testScreenshotOneConnection(): Promise<boolean> {
    try {
      console.log('🧪 Probando conexión con ScreenshotOne API...');
      
      // Usar una URL de prueba simple
      const testUrl = 'https://example.com';
      const screenshotUrl = await this.generateScreenshotOneScreenshot(testUrl);
      
      if (screenshotUrl) {
        console.log('✅ Conexión con ScreenshotOne API exitosa');
        console.log('📸 URL de prueba generada:', screenshotUrl);
        return true;
      } else {
        console.log('❌ No se pudo generar URL con ScreenshotOne API');
        return false;
      }
    } catch (error: any) {
      console.error('❌ Error probando conexión con ScreenshotOne API:', error.message);
      return false;
    }
  }

  /**
   * Obtiene información de uso de la API de ScreenshotOne
   */
  public static async getScreenshotOneUsage(): Promise<any> {
    try {
      const usageUrl = `https://api.screenshotone.com/usage?access_key=${this.SCREENSHOT_ONE_API_KEY}`;
      
      const response = await axios.get(usageUrl, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.status === 200) {
        console.log('📊 Información de uso de ScreenshotOne:', response.data);
        return response.data;
      } else {
        console.warn('⚠️ No se pudo obtener información de uso:', response.status);
        return null;
      }
    } catch (error: any) {
      console.warn('⚠️ Error obteniendo información de uso de ScreenshotOne:', error.message);
      return null;
    }
  }
} 