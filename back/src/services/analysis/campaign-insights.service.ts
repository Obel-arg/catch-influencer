import { Campaign } from '../../models/campaign/campaign.model';
import { openAIAnalysisService } from './openai-analysis.service';

export interface CampaignInsight {
  title: string;
  description: string;
  type: 'performance' | 'audience' | 'content' | 'strategy' | 'opportunity';
  confidence: number;
  actionable: boolean;
  recommendation?: string;
}

export interface CampaignInsightsResult {
  insights: CampaignInsight[];
  summary: string;
  processingTime: number;
  modelUsed: string;
}

export class CampaignInsightsService {
  private static instance: CampaignInsightsService;

  private constructor() {}

  public static getInstance(): CampaignInsightsService {
    if (!CampaignInsightsService.instance) {
      CampaignInsightsService.instance = new CampaignInsightsService();
    }
    return CampaignInsightsService.instance;
  }

  /**
   * Genera insights estratégicos para una campaña usando OpenAI
   */
  public async generateCampaignInsights(campaign: any): Promise<CampaignInsightsResult> {
    const startTime = Date.now();

    try {
      // Preparar datos de la campaña y métricas de posts para el análisis
      const campaignData = this.prepareCampaignData(campaign);
      const postsMetrics = this.analyzePostsMetrics(campaign.posts || []);
      
             // DEBUG: Comparación específica de engagement
       const parsedMetrics = JSON.parse(postsMetrics);
       
       // VALIDACIÓN CRÍTICA DE ENGAGEMENT ANTES DE ENVIAR A OPENAI
    
       
       let highestEngagementPlatform = '';
       let highestEngagementValue = 0;
       
       Object.keys(parsedMetrics.platformPerformance).forEach(platform => {
         const data = parsedMetrics.platformPerformance[platform];
         
         if (data.averageEngagement > highestEngagementValue) {
           highestEngagementValue = data.averageEngagement;
           highestEngagementPlatform = platform;
         }
       });
       
      
                           const prompt = `Analiza esta campaña de marketing de influencers y sus métricas de posts para generar UN SOLO insight estratégico valioso.

DATOS DE LA CAMPAÑA:
${campaignData}

MÉTRICAS DE POSTS:
${postsMetrics}

INSTRUCCIONES ESPECÍFICAS:
- Genera UN SOLO insight basado en las métricas reales de los posts
- El insight debe tener entre 30-40 palabras y 200-250 caracteres máximo
- Debe estar directamente relacionado con el rendimiento de los posts de esta campaña
- Enfócate en patrones, tendencias o anomalías en las métricas
- Proporciona una recomendación específica y accionable
- NO menciones números específicos, porcentajes o cantidades exactas
- Usa términos cualitativos como "alto", "bajo", "mejor", "peor", "superior", "inferior"
- NO menciones otras plataformas que no estén en los datos (solo Instagram, YouTube, TikTok, Twitter/X)
- Enfócate en las plataformas que tienen datos reales en las métricas

DATOS CRÍTICOS PARA EL ANÁLISIS:
- TikTok: ${parsedMetrics.platformPerformance.tiktok?.averageEngagement?.toFixed(2) || '0.00'}% engagement (${parsedMetrics.platformPerformance.tiktok?.posts || 0} posts)
- YouTube: ${parsedMetrics.platformPerformance.youtube?.averageEngagement?.toFixed(2) || '0.00'}% engagement (${parsedMetrics.platformPerformance.youtube?.posts || 0} posts)
- Instagram: ${parsedMetrics.platformPerformance.instagram?.averageEngagement?.toFixed(2) || '0.00'}% engagement (${parsedMetrics.platformPerformance.instagram?.posts || 0} posts)
- Twitter: ${parsedMetrics.platformPerformance.twitter?.averageEngagement?.toFixed(2) || '0.00'}% engagement (${parsedMetrics.platformPerformance.twitter?.posts || 0} posts)

ANÁLISIS DE DATOS CRÍTICO:
- Revisa cuidadosamente el número de posts por plataforma en platformPerformance
- Revisa el alcance total (totalReach) por plataforma
- Revisa el engagement promedio (averageEngagement) por plataforma
- NO asumas que una plataforma tiene "pocos posts" sin verificar los datos reales
- Si una plataforma tiene el mayor número de posts, NO digas que tiene "pocos posts"
- Si una plataforma tiene el mayor alcance, NO digas que tiene "bajo alcance"

INTERPRETACIÓN DE ENGAGEMENT - MUY IMPORTANTE:
- Los valores de averageEngagement están en porcentaje (ej: 4.03 = 4.03%, 0.64 = 0.64%)
- Un engagement de 4.03% es MÁS ALTO que un engagement de 0.64%
- Compara los números correctamente: 4.03 > 0.64 significa que 4.03% es mejor que 0.64%
- NO confundas decimales: 4.03 es mayor que 0.64, no al revés
- Si YouTube tiene averageEngagement: 4.03 e Instagram tiene averageEngagement: 0.64, entonces YouTube tiene engagement SUPERIOR
- Si Instagram tiene averageEngagement: 0.64 e YouTube tiene averageEngagement: 4.03, entonces Instagram tiene engagement INFERIOR

REGLAS ESTRICTAS PARA COMPARACIONES:
1. SIEMPRE compara los números de averageEngagement correctamente
2. Si 4.03 > 0.64, entonces 4.03% es mejor que 0.64%
3. NO digas que una plataforma tiene "engagement superior" si su número es menor
4. NO digas que una plataforma tiene "engagement inferior" si su número es mayor
5. Verifica los datos antes de hacer cualquier afirmación sobre engagement
6. COMPARA EXACTAMENTE los números: si TikTok tiene 5.76% y YouTube tiene 3.70%, entonces TikTok tiene engagement SUPERIOR
7. NO asumas que YouTube siempre tiene mejor engagement - verifica los números reales

REGLAS PARA INSIGHTS ESPECÍFICOS:
1. SIEMPRE menciona la plataforma específica que estás analizando
2. NO uses frases genéricas como "diversificar contenido" sin contexto específico
3. Si mencionas una plataforma, debe ser porque tiene datos reales en las métricas
4. Si comparas plataformas, verifica que la comparación sea matemáticamente correcta
5. Enfócate en el patrón más claro y significativo en los datos

TIPOS DE INSIGHTS A CONSIDERAR:
1. PERFORMANCE: Análisis de rendimiento basado en engagement y alcance
2. AUDIENCE: Insights sobre comportamiento de la audiencia
3. CONTENT: Análisis de qué tipos de contenido funcionan mejor
4. STRATEGY: Oportunidades de optimización basadas en datos
5. OPPORTUNITY: Nuevas oportunidades identificadas en las métricas

IMPORTANTE: 
- Basa tu análisis ÚNICAMENTE en los datos proporcionados en platformPerformance
- Si YouTube tiene el alcance más alto, NO digas que tiene "bajo alcance"
- Si YouTube tiene el mayor número de posts, NO digas que tiene "pocos posts"
- Si YouTube tiene engagement 4.03% e Instagram 0.64%, YouTube tiene engagement SUPERIOR
- Si una plataforma tiene muchos posts pero bajo engagement, analiza por qué
- Si una plataforma tiene pocos posts pero alto engagement, destácalo
- Verifica los datos antes de hacer afirmaciones sobre cantidad de posts o alcance
- COMPARA CORRECTAMENTE los números de engagement: 4.03 > 0.64
- SIEMPRE menciona la plataforma específica en tu insight

Responde SOLO en formato JSON:
{
  "insights": [
    {
      "title": "Título conciso del insight",
      "description": "Descripción de 30-40 palabras máximo (200-250 caracteres) basada en métricas reales de posts, sin números específicos",
      "type": "performance|audience|content|strategy|opportunity",
      "confidence": 0.9,
      "actionable": true,
      "recommendation": "Recomendación específica basada en los datos, sin números"
    }
  ],
  "summary": "Resumen ejecutivo de 20-30 palabras sin números específicos"
}`;

      const response = await this.makeOpenAIRequest(prompt, 800);
      
      if (!response || !response.choices || response.choices.length === 0) {
        throw new Error('No response from OpenAI');
      }

             const content = response.choices[0].message?.content;
       
       if (!content) {
         throw new Error('Empty content from OpenAI');
       }

      // Limpiar y parsear respuesta JSON
      let parsed;
      try {
        const cleanContent = content
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();
        
        parsed = JSON.parse(cleanContent);
      } catch (parseError) {
        console.error('❌ Error parsing OpenAI campaign insights response:', content);
        throw new Error(`Invalid JSON from OpenAI: ${parseError instanceof Error ? parseError.message : parseError}`);
      }

             const processingTime = Date.now() - startTime;

               // VALIDACIÓN POST-OPENAI: Verificar que el insight sea correcto

        
        const insight = parsed.insights?.[0];
        let insightIsCorrect = true;
        
        if (insight) {
          // VALIDACIÓN INTELIGENTE: Interpretar el significado del insight
          const description = insight.description.toLowerCase();
          const title = insight.title.toLowerCase();
          
          // Analizar qué plataforma está siendo destacada como "mejor" o "más alta"
          const platforms = ['youtube', 'instagram', 'tiktok', 'twitter'];
          let mentionedPlatform = '';
          let isClaimingSuperiority = false;
          
          // Detectar si el insight está afirmando que una plataforma es superior
          const superiorityIndicators = [
            'más alto', 'mejor', 'superior', 'destaca', 'lidera', 'sobresale',
            'mayor engagement', 'mejor rendimiento', 'más efectivo'
          ];
          
          for (const indicator of superiorityIndicators) {
            if (description.includes(indicator) || title.includes(indicator)) {
              isClaimingSuperiority = true;
              break;
            }
          }
          
          // Si está afirmando superioridad, verificar qué plataforma menciona
          if (isClaimingSuperiority) {
            for (const platform of platforms) {
              if (description.includes(platform) || title.includes(platform)) {
                mentionedPlatform = platform;
                break;
              }
            }
            
            // Validar si la afirmación es correcta comparando con los datos reales
            if (mentionedPlatform) {
              const mentionedEngagement = parsedMetrics.platformPerformance[mentionedPlatform]?.averageEngagement || 0;
              let isActuallyHighest = true;
              
              // Comparar con todas las demás plataformas
              for (const platform of platforms) {
                if (platform !== mentionedPlatform) {
                  const otherEngagement = parsedMetrics.platformPerformance[platform]?.averageEngagement || 0;
                  if (otherEngagement > mentionedEngagement) {
                    isActuallyHighest = false;
                    break;
                  }
                }
              }
              
              if (!isActuallyHighest) {
              insightIsCorrect = false;
              }
            }
          }
          
          // Validación adicional: verificar si menciona datos que no existen
          const hasData = {
            youtube: parsedMetrics.platformPerformance.youtube?.posts > 0,
            instagram: parsedMetrics.platformPerformance.instagram?.posts > 0,
            tiktok: parsedMetrics.platformPerformance.tiktok?.posts > 0,
            twitter: parsedMetrics.platformPerformance.twitter?.posts > 0
          };
          
          // Verificar si menciona plataformas sin datos
          for (const platform of platforms) {
            if ((description.includes(platform) || title.includes(platform)) && !hasData[platform as keyof typeof hasData]) {
              insightIsCorrect = false;
            }
          }
          
          // Validación de consistencia: si menciona múltiples plataformas, verificar que la comparación sea correcta
          const mentionedPlatforms = platforms.filter(p => description.includes(p) || title.includes(p));
          if (mentionedPlatforms.length > 1) {
            // Si compara dos plataformas, verificar que la comparación sea correcta
            const platform1 = mentionedPlatforms[0];
            const platform2 = mentionedPlatforms[1];
            const engagement1 = parsedMetrics.platformPerformance[platform1]?.averageEngagement || 0;
            const engagement2 = parsedMetrics.platformPerformance[platform2]?.averageEngagement || 0;
            
            // Buscar palabras que indiquen comparación
            const comparisonWords = {
              'más alto que': engagement1 > engagement2,
              'mejor que': engagement1 > engagement2,
              'superior a': engagement1 > engagement2,
              'menor que': engagement1 < engagement2,
              'inferior a': engagement1 < engagement2
            };
            
            for (const [word, expectedResult] of Object.entries(comparisonWords)) {
              if (description.includes(word)) {
                if (!expectedResult) {
                  insightIsCorrect = false;
                }
                break;
              }
            }
          }
          
          // Validación de especificidad: verificar que el insight no sea demasiado genérico
          const genericPhrases = [
            'diversificar contenido',
            'mejorar engagement',
            'optimizar estrategia',
            'aumentar presencia',
            'crear contenido más interactivo',
            'mejorar rendimiento'
          ];
          
          let isTooGeneric = false;
          for (const phrase of genericPhrases) {
            if (description.includes(phrase) && !isClaimingSuperiority && mentionedPlatforms.length === 0) {
              isTooGeneric = true;
              break;
            }
          }
          
          if (isTooGeneric) {
            insightIsCorrect = false;
          }
          
          // Validación de coherencia: verificar que el insight tenga sentido con los datos
          if (isClaimingSuperiority && mentionedPlatforms.length === 0) {
            insightIsCorrect = false;
          }
        }
        
        
        
        // GENERAR INSIGHT CORRECTO SI OPENAI FALLÓ
        if (!insightIsCorrect || !insight) {
          const fallbackInsight = this.generateFallbackInsight(parsedMetrics, highestEngagementPlatform, highestEngagementValue);
          
          return {
            insights: [fallbackInsight],
            summary: fallbackInsight.recommendation || 'Análisis basado en métricas reales',
            processingTime,
            modelUsed: 'fallback-corrected'
          };
        }

       return {
         insights: parsed.insights || [],
         summary: parsed.summary || 'Análisis completado',
         processingTime,
         modelUsed: 'gpt-3.5-turbo'
       };

    } catch (error) {
      console.error('❌ Campaign insights generation error:', error);
      
      // Fallback con insights básicos
      return {
        insights: [
          {
            title: 'Análisis en progreso',
            description: 'Los insights detallados están siendo generados. Por favor, intenta de nuevo en unos momentos.',
            type: 'strategy',
            confidence: 0.5,
            actionable: false
          }
        ],
        summary: 'Análisis temporalmente no disponible',
        processingTime: Date.now() - startTime,
        modelUsed: 'fallback'
      };
    }
  }

  /**
   * Analiza las métricas de los posts de la campaña
   */
  private analyzePostsMetrics(posts: any[]): string {

    
    if (!posts || posts.length === 0) {

      return 'No hay posts disponibles para analizar';
    }

    const metrics = {
      totalPosts: posts.length,
      totalLikes: 0,
      totalComments: 0,
      totalShares: 0,
      totalViews: 0,
      totalReach: 0,
      averageEngagement: 0,
      postsByType: {} as Record<string, number>,
      postsByPlatform: {} as Record<string, number>,
      topPerformingPosts: [] as any[],
      platformPerformance: {} as Record<string, any>
    };

    // Calcular métricas agregadas
    posts.forEach((post, index) => {
      console.log(`🔍 [INSIGHTS] Processing post ${index + 1}/${posts.length}:`, {
        id: post.id,
        platform: post.platform,
        hasManualMetrics: !!post.post_metrics?.raw_response?.manual_metrics,
        hasRawData: !!post.post_metrics?.raw_response?.data
      });
      
      // Analizar raw_response para obtener datos más precisos
      let likes = 0, comments = 0, views = 0, shares = 0, reach = 0, engagement = 0;
      
      // ✅ PRIORITARIO: Verificar métricas manuales ANTES de procesar rawData
      const platform = post.platform?.toLowerCase();
      
      // PRIMERO: Verificar si es una historia de Instagram con métricas manuales
      if (platform === 'instagram' && post.post_metrics?.raw_response?.manual_metrics) {
        const manualData = post.post_metrics.raw_response.manual_metrics;
        likes = parseInt(manualData.likes) || 0;
        comments = parseInt(manualData.comments) || 0;
        reach = parseInt(manualData.alcance) || 0;
        
        // Calcular engagement para stories manualmente
        const totalEngagement = likes + comments;
        engagement = reach > 0 ? (totalEngagement / reach) : 0;
        
        console.log('📸 [INSIGHTS] Story metrics processed:', {
          postId: post.id,
          platform, 
          likes, 
          comments, 
          reach, 
          engagement: (engagement * 100).toFixed(2) + '%'
        });
      }
      // SEGUNDO: Procesar otros tipos de posts con rawData
      else {
        // Usar la misma estructura que el frontend: post.post_metrics.raw_response.data
        let rawData = null;
        
        if (post.post_metrics?.raw_response?.data) {
          rawData = post.post_metrics.raw_response.data;
        }
        // Fallback para compatibilidad
        else if (post.metrics?.[0]?.raw_response) {
          try {
            const postMetrics = post.metrics[0];
            rawData = typeof postMetrics.raw_response === 'string' 
              ? JSON.parse(postMetrics.raw_response) 
              : postMetrics.raw_response;
          } catch (e) {
            console.error('Error parsing postMetrics.raw_response:', e);
          }
        }
        
        if (rawData) {
          try {
            
            if (platform === 'youtube') {
              const videoData = rawData.basicYoutubePost || rawData;
              likes = videoData.likeCount || videoData.likes || 0;
              comments = videoData.commentCount || videoData.comments || 0;
              views = videoData.viewCount || videoData.views || 0;
              engagement = videoData.engageRate || 0;
              reach = views; // Para YouTube, reach = views
            
            } else if (platform === 'instagram') {
              // Lógica para posts normales de Instagram (no stories)
              const instagramData = rawData.basicInstagramPost || rawData;
              likes = instagramData.likeCount || instagramData.likes || 0;
              comments = instagramData.commentCount || instagramData.comments || 0;
              views = instagramData.videoViews || 0;
              engagement = instagramData.engageRate || 0;
              
              // Calcular reach para Instagram como lo hace CampaignMetricsCards
              if (views > 0) {
                reach = views;
              } else {
                reach = this.calculateApproximateReach(likes, comments);
              }
            } else if (platform === 'tiktok') {
              // CORREGIDO: Usar basicTikTokVideo (con T mayúscula) en lugar de basicTiktokVideo
              const tiktokData = rawData.basicTikTokVideo || rawData;
              
              likes = tiktokData.likeCount || tiktokData.likes || tiktokData.hearts || 0;
              comments = tiktokData.commentCount || tiktokData.comments || 0;
              views = tiktokData.playCount || tiktokData.views || tiktokData.plays || 0;
              shares = tiktokData.shareCount || tiktokData.shares || 0;
              engagement = tiktokData.engageRate || 0;
              reach = views; // Para TikTok, reach = views
              
            } else if (platform === 'twitter' || platform === 'x') {
              const twitterData = rawData.basicTwitterPost || rawData;
              likes = twitterData.likeCount || twitterData.likes || 0;
              comments = twitterData.commentCount || twitterData.comments || 0;
              views = twitterData.viewCount || twitterData.views || 0;
              engagement = twitterData.engageRate || 0;
              reach = views; // Para Twitter, reach = views
            }
            
          } catch (e) {
            console.error('Error parsing raw_response:', e);
          }
        }
      }
      
      // Fallback a campos directos si raw_response no está disponible
      const postMetrics = post.metrics?.[0] || {};
      if (likes === 0) likes = postMetrics.likes_count || 0;
      if (comments === 0) comments = postMetrics.comments_count || 0;
      if (views === 0) views = postMetrics.views_count || 0;
      if (reach === 0) reach = postMetrics.reach || views;
      if (engagement === 0) engagement = postMetrics.engagement_rate || 0;
      
      // Acumular métricas
      metrics.totalLikes += likes;
      metrics.totalComments += comments;
      metrics.totalViews += views;
      metrics.totalShares += shares;
      metrics.totalReach += reach;
      
      // Contar por tipo
      const postType = post.content_type || post.type || 'unknown';
      metrics.postsByType[postType] = (metrics.postsByType[postType] || 0) + 1;
      
             // Contar por plataforma
       const platformName = post.platform || 'unknown';
       metrics.postsByPlatform[platformName] = (metrics.postsByPlatform[platformName] || 0) + 1;

      
      // Inicializar métricas por plataforma si no existe
      if (!metrics.platformPerformance[platformName]) {
        metrics.platformPerformance[platformName] = {
          posts: 0,
          totalLikes: 0,
          totalComments: 0,
          totalViews: 0,
          totalReach: 0,
          totalEngagement: 0
        };
      }
      
      // Acumular métricas por plataforma
      metrics.platformPerformance[platformName].posts++;
      metrics.platformPerformance[platformName].totalLikes += likes;
      metrics.platformPerformance[platformName].totalComments += comments;
      metrics.platformPerformance[platformName].totalViews += views;
      metrics.platformPerformance[platformName].totalReach += reach;
      
      // Usar exactamente el mismo método que la card de Rendimiento por Plataforma
      // Sumar el engageRate en decimal (sin convertir a porcentaje)
      metrics.platformPerformance[platformName].totalEngagement += engagement;
      
      // Log final del post procesado
      console.log(`📊 [INSIGHTS] Post ${index + 1} final metrics:`, {
        id: post.id,
        platform: platformName,
        likes,
        comments,
        views,
        reach,
        engagement: (engagement * 100).toFixed(2) + '%'
      });
      
      if (engagement > 0) {
        // Convertir a porcentaje para el array de posts (como lo hace el frontend)
        const engagementPercentage = engagement < 1 ? engagement * 100 : engagement;
        metrics.topPerformingPosts.push({
          id: post.id,
          type: postType,
          platform: platformName,
          engagement: engagementPercentage,
          likes,
          comments,
          shares,
          views,
          reach
        });
      }
    });


     
     // Calcular promedio de engagement por plataforma (exactamente como el frontend)
     Object.keys(metrics.platformPerformance).forEach(platform => {
       const platformData = metrics.platformPerformance[platform];
       if (platformData.posts > 0) {
         // Mismo cálculo que en campaign-metrics.service.ts: (data.engagement * 100) / data.posts
         platformData.averageEngagement = (platformData.totalEngagement * 100) / platformData.posts;
         
         console.log(`🎯 [INSIGHTS] Platform ${platform} final stats:`, {
           posts: platformData.posts,
           totalEngagement: platformData.totalEngagement,
           averageEngagement: platformData.averageEngagement.toFixed(2) + '%',
           totalReach: platformData.totalReach,
           totalLikes: platformData.totalLikes,
           totalComments: platformData.totalComments
         });
         
        
       }
     });

    // Calcular promedio general de engagement
    if (metrics.totalPosts > 0) {
      // Usar la suma de todos los engagement rates de todas las plataformas
      const totalEngagement = Object.values(metrics.platformPerformance).reduce((sum, platform) => sum + platform.totalEngagement, 0);
      metrics.averageEngagement = totalEngagement / metrics.totalPosts;
    }

         // Ordenar posts por rendimiento
     metrics.topPerformingPosts.sort((a, b) => b.engagement - a.engagement);

     const finalMetrics = JSON.stringify(metrics, null, 2);
     

     Object.keys(metrics.platformPerformance).forEach(platform => {
       const data = metrics.platformPerformance[platform];
     });
     
     return finalMetrics;
     
      
      // LOGS FINALES DETALLADOS DE TODAS LAS PLATAFORMAS
      
      Object.keys(metrics.platformPerformance).forEach(platform => {
        const data = metrics.platformPerformance[platform];
       
      });
      
      
      return finalMetrics;
  }

  /**
   * Calcula reach aproximado para Instagram basado en likes y comentarios
   */
  private calculateApproximateReach(likes: number, comments: number): number {
    // Si no hay likes ni comentarios, usar un valor base fijo
    if (likes === 0 && comments === 0) {
      return 35; // Valor fijo para posts sin engagement
    }
    
    // Calcular engagement rate aproximado (likes + comentarios)
    const totalEngagement = likes + comments;
    
    // Para Instagram, el alcance típicamente es 10-50x el engagement
    // Usar una fórmula determinística basada en el engagement
    // Factor base: 20x el engagement
    let reachMultiplier = 20;
    
    // Ajustar el multiplicador basado en el nivel de engagement para simular realismo
    if (totalEngagement > 1000) {
      reachMultiplier = 25; // Posts con mucho engagement tienen mayor alcance
    } else if (totalEngagement > 500) {
      reachMultiplier = 22; // Posts con engagement medio-alto
    } else if (totalEngagement > 100) {
      reachMultiplier = 21; // Posts con engagement medio
    } else if (totalEngagement > 50) {
      reachMultiplier = 19; // Posts con engagement bajo-medio
    } else if (totalEngagement > 10) {
      reachMultiplier = 18; // Posts con engagement bajo
    } else {
      reachMultiplier = 17; // Posts con muy poco engagement
    }
    
    const approximateReach = totalEngagement * reachMultiplier;
    
    // Asegurar un mínimo razonable (5x el engagement)
    return Math.max(approximateReach, totalEngagement * 5);
  }

  /**
   * Prepara los datos de la campaña para el análisis
   */
  private prepareCampaignData(campaign: any): string {
    const data = {
      nombre: campaign.name,
      descripcion: campaign.description || 'Sin descripción',
      tipo: campaign.type,
      estado: campaign.status,
      presupuesto: `${campaign.budget} ${campaign.currency}`,
      fechas: `${campaign.start_date} - ${campaign.end_date}`,
      plataformas: Array.isArray(campaign.platforms) ? campaign.platforms.join(', ') : campaign.platforms,
      objetivos: Array.isArray(campaign.objectives) ? campaign.objectives.join(', ') : campaign.objectives,
      audiencia_objetivo: campaign.target_audience ? {
        rango_edad: campaign.target_audience.age_range?.join(', '),
        genero: campaign.target_audience.gender?.join(', '),
        ubicacion: campaign.target_audience.location?.join(', '),
        intereses: campaign.target_audience.interests?.join(', ')
      } : 'No especificada',
      metricas_actuales: campaign.metrics ? {
        alcance: campaign.metrics.reach,
        engagement: campaign.metrics.engagement,
        conversiones: campaign.metrics.conversions,
        roi: campaign.metrics.roi
      } : 'No disponibles',
      entregables: campaign.deliverables?.map((d: any) => `${d.type}: ${d.quantity}`).join(', ') || 'No especificados',
      hashtags: Array.isArray(campaign.hashtags) ? campaign.hashtags.join(', ') : campaign.hashtags,
      directrices: Array.isArray(campaign.content_guidelines) ? campaign.content_guidelines.join(', ') : campaign.content_guidelines
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * Realiza petición a OpenAI API
   */
  private async makeOpenAIRequest(prompt: string, maxTokens: number = 800): Promise<any> {
    const fetch = await this.getFetch();
    
    const body = {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Eres un experto analista de marketing digital especializado en campañas de influencers. Analiza métricas de posts y proporciona insights concisos, específicos y accionables. Responde siempre en formato JSON válido."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: maxTokens,
      temperature: 0.3
    };

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === 'API-KEY-OPENAI') {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  private async getFetch(): Promise<any> {
    const { default: fetch } = await import('node-fetch');
    return fetch;
  }

  /**
   * Genera un insight de fallback inteligente basado en las métricas reales
   */
  private generateFallbackInsight(parsedMetrics: any, highestPlatform: string, highestValue: number): CampaignInsight {
    const platformName = highestPlatform.charAt(0).toUpperCase() + highestPlatform.slice(1);
    
    // Analizar el contexto completo de las métricas
    const platformData = parsedMetrics.platformPerformance;
    const platforms = Object.keys(platformData).filter(p => platformData[p].posts > 0);
    
    // Encontrar la segunda mejor plataforma para comparación
    let secondBestPlatform = '';
    let secondBestValue = 0;
    
    for (const platform of platforms) {
      if (platform !== highestPlatform) {
        const engagement = platformData[platform].averageEngagement;
        if (engagement > secondBestValue) {
          secondBestValue = engagement;
          secondBestPlatform = platform;
        }
      }
    }
    
    // Calcular la diferencia para determinar si es significativa
    const difference = highestValue - secondBestValue;
    const isSignificantDifference = difference > 1.0; // Más de 1% de diferencia
    
    // Determinar el tipo de insight basado en el análisis
    let insightType: 'performance' | 'audience' | 'content' | 'strategy' | 'opportunity' = 'performance';
    let title = '';
    let description = '';
    let recommendation = '';

    if (highestPlatform === 'tiktok') {
      if (isSignificantDifference) {
        title = `TikTok Domina el Engagement`;
        description = `${platformName} supera significativamente a otras plataformas con ${highestValue.toFixed(2)}% de engagement. Recomendación: Capitalizar esta ventaja competitiva.`;
        recommendation = `Aumentar la inversión en TikTok y replicar las estrategias exitosas en otras plataformas.`;
      insightType = 'opportunity';
      } else {
        title = `TikTok Lidera Ligeramente`;
        description = `${platformName} muestra el mejor engagement (${highestValue.toFixed(2)}%) aunque la diferencia es mínima. Recomendación: Optimizar para ampliar la brecha.`;
        recommendation = `Analizar qué elementos específicos de TikTok generan mejor engagement y aplicarlos consistentemente.`;
        insightType = 'strategy';
      }
    } else if (highestPlatform === 'youtube') {
      if (isSignificantDifference) {
        title = `YouTube Destaca en Rendimiento`;
        description = `${platformName} presenta el engagement más alto (${highestValue.toFixed(2)}%) con una ventaja clara. Recomendación: Mantener y optimizar la estrategia actual.`;
        recommendation = `Continuar con el enfoque exitoso en YouTube y considerar aplicar elementos similares a otras plataformas.`;
      insightType = 'strategy';
      } else {
        title = `YouTube Lidera por Mínimo Margen`;
        description = `${platformName} tiene el mejor engagement (${highestValue.toFixed(2)}%) pero la competencia es cerrada. Recomendación: Fortalecer la diferenciación.`;
        recommendation = `Identificar y potenciar los elementos únicos de YouTube que generan engagement superior.`;
        insightType = 'performance';
      }
    } else if (highestPlatform === 'instagram') {
      if (isSignificantDifference) {
      title = `Instagram Sobresale en Interacción`;
        description = `${platformName} demuestra engagement superior (${highestValue.toFixed(2)}%) con diferencia significativa. Recomendación: Expandir la presencia en esta plataforma.`;
        recommendation = `Incrementar la frecuencia y variedad de contenido en Instagram para maximizar el alto engagement.`;
      insightType = 'strategy';
      } else {
        title = `Instagram Lidera el Engagement`;
        description = `${platformName} presenta el mejor engagement (${highestValue.toFixed(2)}%) aunque la competencia es reñida. Recomendación: Optimizar para consolidar el liderazgo.`;
        recommendation = `Analizar patrones de contenido exitoso en Instagram y replicarlos sistemáticamente.`;
        insightType = 'performance';
      }
    } else {
      // Para otras plataformas o casos especiales
      title = `Análisis de Rendimiento Optimizado`;
      description = `${platformName} muestra el engagement más alto (${highestValue.toFixed(2)}%) entre las plataformas analizadas. Recomendación: Enfocar esfuerzos en esta plataforma.`;
      recommendation = `Priorizar la creación de contenido en ${platformName} y analizar factores de éxito para replicar en otras plataformas.`;
      insightType = 'performance';
    }

    // Ajustar la confianza basada en la cantidad de datos
    const totalPosts = platforms.reduce((sum, p) => sum + platformData[p].posts, 0);
    const confidence = totalPosts >= 10 ? 0.95 : totalPosts >= 5 ? 0.85 : 0.75;

    return {
      title,
      description,
      type: insightType,
      confidence,
      actionable: true,
      recommendation
    };
  }
}

export const campaignInsightsService = CampaignInsightsService.getInstance();