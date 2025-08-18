import { Campaign } from "@/types/campaign";

export interface PostMetric {
  id: string;
  post_id: string;
  platform: 'youtube' | 'instagram' | 'tiktok' | 'twitter';
  content_id: string;
  post_url: string;
  title: string | null;
  likes_count: number | null;
  comments_count: number | null;
  views_count: number | null;
  engagement_rate: number | null;
  platform_data: any;
  quota_used: number | null;
  api_timestamp: number | null;
  api_success: boolean | null;
  api_error: string | null;
  raw_response: any;
  created_at: string | null;
  updated_at: string | null;
  comments_analysis: any | null;
  deleted?: string | null; // Para evoluciones históricas
}

export interface MetricEvolution {
  date: string;
  engagement: number; // Porcentaje (0-100)
  reach: number; // En millones
}

export interface CampaignMetricsData {
  currentMetrics: PostMetric[];
  historicalMetrics: PostMetric[];
  evolutionData: MetricEvolution[];
}

// Función para generar una curva realista con variaciones naturales
function generateRealisticCurve(
  weeks: number, 
  startValue: number, 
  endValue: number, 
  volatility: number = 0.3
): number[] {
  const values: number[] = [];
  let currentValue = startValue;
  
  for (let i = 0; i < weeks; i++) {
    // Tendencia general hacia el valor final
    const progress = i / (weeks - 1);
    const targetValue = startValue + (endValue - startValue) * progress;
    
    // Agregar variación aleatoria para simular comportamiento real
    const randomVariation = (Math.random() - 0.5) * volatility * targetValue;
    
    // Agregar "ruido" semanal (pequeñas fluctuaciones)
    const weeklyNoise = (Math.random() - 0.5) * 0.1 * targetValue;
    
    // Combinar tendencia + variación + ruido
    currentValue = targetValue + randomVariation + weeklyNoise;
    
    // Asegurar valores positivos
    currentValue = Math.max(currentValue, startValue * 0.5);
    
    values.push(currentValue);
  }
  
  return values;
}

// Función para generar datos mock de una campaña
export function generateMockPostMetrics(campaign: Campaign): CampaignMetricsData {
  const campaignId = campaign.id;
  const platforms: Array<'youtube' | 'instagram' | 'tiktok' | 'twitter'> = ['youtube', 'instagram', 'tiktok'];
  
  // Generar posts actuales (deleted = null)
  const currentMetrics: PostMetric[] = platforms.map((platform, index) => {
    const baseViews = [1500000, 2500000, 3500000, 4500000, 5500000][index] || 2000000; // En millones
    const baseLikes = Math.floor(baseViews * 0.03);
    const baseComments = Math.floor(baseLikes * 0.1);
    const engagementRate = (baseLikes + baseComments) / baseViews;
    
    return {
      id: `current-${platform}-${index}`,
      post_id: `${campaignId}-post-${index + 1}`,
      platform,
      content_id: `${platform}_content_${index + 1}`,
      post_url: `https://www.${platform}.com/user/post-${index + 1}`,
      title: `Post ${index + 1} de la campaña ${campaign.name}`,
      likes_count: baseLikes,
      comments_count: baseComments,
      views_count: baseViews,
      engagement_rate: engagementRate,
      platform_data: generatePlatformData(platform, baseViews, baseLikes, baseComments, engagementRate),
      quota_used: 2,
      api_timestamp: Date.now(),
      api_success: true,
      api_error: null,
      raw_response: generateRawResponse(platform, baseViews, baseLikes, baseComments, engagementRate),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      comments_analysis: generateCommentsAnalysis(baseComments),
      deleted: null
    };
  });

  // Generar evoluciones históricas con curvas realistas
  const historicalMetrics: PostMetric[] = [];
  const evolutionData: MetricEvolution[] = [];
  
  // Generar datos para las últimas 7 semanas
  const weeks = 7;
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - (weeks * 7));
  
  // Generar curvas realistas para engagement y reach
  // Engagement: 2.5% a 4.5% (como porcentaje)
  const engagementCurve = generateRealisticCurve(weeks, 2.5, 4.5, 0.4);
  // Reach: 1.2M a 3.8M (en millones)
  const reachCurve = generateRealisticCurve(weeks, 1.2, 3.8, 0.35);
  
  for (let week = 0; week < weeks; week++) {
    const weekDate = new Date(baseDate);
    weekDate.setDate(weekDate.getDate() + (week * 7));
    const dateStr = weekDate.toISOString().split('T')[0];
    
    // Usar valores de las curvas generadas
    const engagement = engagementCurve[week]; // Ya está en porcentaje
    const reach = reachCurve[week]; // Ya está en millones
    
    evolutionData.push({
      date: dateStr,
      engagement,
      reach
    });
    
    // Generar posts históricos para cada plataforma
    platforms.forEach((platform, platformIndex) => {
      // Variar el reach por plataforma (convertir millones a views)
      const platformMultiplier = [0.8, 1.0, 1.2][platformIndex] || 1.0;
      const views = Math.floor(reach * 1000000 * platformMultiplier); // Convertir millones a views
      const likes = Math.floor(views * (engagement / 100) * 0.7); // Engagement como porcentaje
      const comments = Math.floor(likes * 0.1);
      const engagementRate = (engagement / 100) + (Math.random() * 0.01 - 0.005); // Convertir a decimal
      
      historicalMetrics.push({
        id: `historical-${platform}-${week}-${platformIndex}`,
        post_id: `${campaignId}-post-${platformIndex + 1}`,
        platform,
        content_id: `${platform}_content_${platformIndex + 1}`,
        post_url: `https://www.${platform}.com/user/post-${platformIndex + 1}`,
        title: `Post ${platformIndex + 1} de la campaña ${campaign.name}`,
        likes_count: likes,
        comments_count: comments,
        views_count: views,
        engagement_rate: engagementRate,
        platform_data: generatePlatformData(platform, views, likes, comments, engagementRate),
        quota_used: 2,
        api_timestamp: weekDate.getTime(),
        api_success: true,
        api_error: null,
        raw_response: generateRawResponse(platform, views, likes, comments, engagementRate),
        created_at: weekDate.toISOString(),
        updated_at: weekDate.toISOString(),
        comments_analysis: generateCommentsAnalysis(comments),
        deleted: weekDate.toISOString() // Marcar como eliminado para evoluciones
      });
    });
  }

  return {
    currentMetrics,
    historicalMetrics,
    evolutionData
  };
}

// Función para generar platform_data según la plataforma
function generatePlatformData(
  platform: string, 
  views: number, 
  likes: number, 
  comments: number, 
  engagementRate: number
): any {
  const baseData = {
    views,
    likes,
    comments,
    engagementRate,
    timestamp: Date.now(),
    success: true
  };

  switch (platform) {
    case 'youtube':
      return {
        ...baseData,
        basicYoutubePost: {
          lang: "spa",
          likes,
          title: "ABRÍ 200 DROPS DE SUSHI EN UNA CUENTA NUEVA… SON BUENOS?",
          views,
          length: 974,
          videoId: "oHIo6XknfCg",
          category: "Gaming",
          comments,
          hashtags: ["#brawlstars", "#brawltalk"],
          isShorts: false,
          engageRate: engagementRate,
          uploadDate: Date.now(),
          isStreaming: false,
          isPaidPromote: false,
          commentLikeRatio: 0,
          selfCommentRatio: 0,
          commentReplyRatio: 0.2
        }
      };
    
    case 'instagram':
      return {
        ...baseData,
        basicInstagramPost: {
          likes,
          comments,
          views: views * 0.8, // Instagram muestra menos views
          engageRate: engagementRate,
          hashtags: ["#instagram", "#post"],
          uploadDate: Date.now(),
          isVideo: false,
          isReel: false,
          isStory: false
        }
      };
    
    case 'tiktok':
      return {
        ...baseData,
        basicTikTokVideo: {
          plays: views,
          hearts: likes,
          comments,
          engageRate: engagementRate,
          hashtags: ["#tiktok", "#viral"],
          uploadDate: Date.now(),
          length: 30,
          isDuetEnabled: false
        }
      };
    
    default:
      return baseData;
  }
}

// Función para generar raw_response según la plataforma
function generateRawResponse(
  platform: string, 
  views: number, 
  likes: number, 
  comments: number, 
  engagementRate: number
): any {
  const baseResponse = {
    error: "",
    success: true,
    quotaUsed: 2,
    timestamp: Date.now(),
    quotaUsedTotal: 668,
    remainingPlanCredit: 4332,
    remainingPrepurchasedCredit: 0
  };

  switch (platform) {
    case 'youtube':
      return {
        ...baseResponse,
        data: {
          basicYoutubePost: {
            lang: "spa",
            likes,
            title: "ABRÍ 200 DROPS DE SUSHI EN UNA CUENTA NUEVA… SON BUENOS?",
            views,
            length: 974,
            videoId: "oHIo6XknfCg",
            category: "Gaming",
            comments,
            hashtags: ["#brawlstars", "#brawltalk"],
            isShorts: false,
            engageRate: engagementRate,
            uploadDate: Date.now(),
            isStreaming: false,
            isPaidPromote: false,
            commentLikeRatio: 0,
            selfCommentRatio: 0,
            commentReplyRatio: 0.2
          }
        }
      };
    
    case 'instagram':
      return {
        ...baseResponse,
        data: {
          basicInstagramPost: {
            likes,
            comments,
            views: views * 0.8,
            engageRate: engagementRate,
            hashtags: ["#instagram", "#post"],
            uploadDate: Date.now(),
            isVideo: false,
            isReel: false,
            isStory: false
          }
        }
      };
    
    case 'tiktok':
      return {
        ...baseResponse,
        data: {
          basicTikTokVideo: {
            plays: views,
            hearts: likes,
            comments,
            engageRate: engagementRate,
            hashtags: ["#tiktok", "#viral"],
            uploadDate: Date.now(),
            length: 30,
            isDuetEnabled: false
          }
        }
      };
    
    default:
      return baseResponse;
  }
}

// Función para generar comments_analysis
function generateCommentsAnalysis(commentsCount: number): any {
  const sentimentDistribution = {
    positive: Math.floor(commentsCount * 0.6),
    neutral: Math.floor(commentsCount * 0.3),
    negative: Math.floor(commentsCount * 0.1)
  };

  return {
    totalComments: commentsCount,
    sentimentAnalysis: {
      distribution: sentimentDistribution,
      overallSentiment: "positive",
      confidence: 0.85
    },
    topTopics: [
      "producto",
      "calidad",
      "recomendación",
      "precio",
      "servicio"
    ],
    keyInsights: [
      "Los usuarios están satisfechos con la calidad del producto",
      "Hay interés en más variedades",
      "El precio es considerado justo por la mayoría"
    ]
  };
}

// Función para obtener datos de evolución para el gráfico
export function getEvolutionData(campaign: Campaign): MetricEvolution[] {
  const mockData = generateMockPostMetrics(campaign);
  return mockData.evolutionData;
}

// Función para obtener métricas actuales
export function getCurrentMetrics(campaign: Campaign): PostMetric[] {
  const mockData = generateMockPostMetrics(campaign);
  return mockData.currentMetrics;
}

// Función para obtener métricas históricas
export function getHistoricalMetrics(campaign: Campaign): PostMetric[] {
  const mockData = generateMockPostMetrics(campaign);
  return mockData.historicalMetrics;
} 