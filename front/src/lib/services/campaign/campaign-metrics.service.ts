import { httpApiClient } from '../../http';
import { AxiosHeaders } from "axios";
import { withContext } from '@/lib/http/httpInterceptor';

export interface CampaignMetrics {
  reach: {
    total: number;
    youtube: number;
    tiktok: number;
    instagram: number;
    twitter: number;
  };
  engagement: {
    average: number;
    youtube: number;
    tiktok: number;
    instagram: number;
    twitter: number;
  };
  likes: {
    total: number;
    youtube: number;
    tiktok: number;
    instagram: number;
    twitter: number;
  };
  comments: {
    total: number;
    youtube: number;
    tiktok: number;
    instagram: number;
    twitter: number;
  };
  posts: {
    total: number;
    youtube: number;
    tiktok: number;
    instagram: number;
    twitter: number;
  };
}

export class CampaignMetricsService {
  private static instance: CampaignMetricsService;
  private baseUrl = '/campaigns';

  public static getInstance(): CampaignMetricsService {
    if (!CampaignMetricsService.instance) {
      CampaignMetricsService.instance = new CampaignMetricsService();
    }
    return CampaignMetricsService.instance;
  }

  /**
   * Get real campaign metrics by calculating from post_metrics data
   */
  public async getCampaignMetrics(campaignId: string): Promise<CampaignMetrics> {
    try {
      const response = await httpApiClient.get<CampaignMetrics>(
        `${this.baseUrl}/${campaignId}/metrics`,
        {
          headers: new AxiosHeaders({
            "Content-Type": "application/json",
            ...withContext('CampaignMetricsService', 'getCampaignMetrics').headers
          })
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching campaign metrics:', error);
      // Return default metrics if there's an error
      return {
        reach: { total: 0, youtube: 0, tiktok: 0, instagram: 0, twitter: 0 },
        engagement: { average: 0, youtube: 0, tiktok: 0, instagram: 0, twitter: 0 },
        likes: { total: 0, youtube: 0, tiktok: 0, instagram: 0, twitter: 0 },
        comments: { total: 0, youtube: 0, tiktok: 0, instagram: 0, twitter: 0 },
        posts: { total: 0, youtube: 0, tiktok: 0, instagram: 0, twitter: 0 }
      };
    }
  }

  /**
   * Calculate metrics from posts data (fallback method)
   */
  public calculateMetricsFromPosts(posts: any[]): CampaignMetrics {
    const metrics: CampaignMetrics = {
      reach: { total: 0, youtube: 0, tiktok: 0, instagram: 0, twitter: 0 },
      engagement: { average: 0, youtube: 0, tiktok: 0, instagram: 0, twitter: 0 },
      likes: { total: 0, youtube: 0, tiktok: 0, instagram: 0, twitter: 0 },
      comments: { total: 0, youtube: 0, tiktok: 0, instagram: 0, twitter: 0 },
      posts: { total: 0, youtube: 0, tiktok: 0, instagram: 0, twitter: 0 }
    };

    const platformData: Record<string, { views: number; engagement: number; likes: number; comments: number; posts: number }> = {
      youtube: { views: 0, engagement: 0, likes: 0, comments: 0, posts: 0 },
      tiktok: { views: 0, engagement: 0, likes: 0, comments: 0, posts: 0 },
      instagram: { views: 0, engagement: 0, likes: 0, comments: 0, posts: 0 },
      twitter: { views: 0, engagement: 0, likes: 0, comments: 0, posts: 0 }
    };

    // Variables for correct engagement calculation
    let totalEngagementRate = 0;
    let totalPosts = 0;

    posts.forEach(post => {
      const platform = post.platform?.toLowerCase();
      if (!platform || !platformData[platform]) return;

      // Count posts
      platformData[platform].posts++;
      metrics.posts.total++;

      // Extract views/plays, likes, and comments from platform_data
      let views = 0;
      let engagement = 0;
      let likes = 0;
      let comments = 0;

      // ✅ NUEVO: Verificar si son métricas manuales (para historias de Instagram)
      if (post.post_metrics?.raw_response?.manual_metrics) {
        const manualData = post.post_metrics.raw_response.manual_metrics;
        likes = manualData.likes || 0;
        comments = manualData.comments || 0;
        views = manualData.alcance || 0; // alcance = reach para historias
        
        // Calcular engagement rate para historias
        const totalEngagement = likes + comments;
        engagement = views > 0 ? (totalEngagement / views) : 0; // Ya en decimal, no multiplicar por 100
        
        console.log('📸 [METRICS-SERVICE] Story metrics processed:', {
          platform,
          likes,
          comments,
          reach: views,
          engagement
        });
      } else if (post.post_metrics?.raw_response?.data) {
        const rawData = post.post_metrics.raw_response.data;
        
        if (platform === 'youtube' && rawData.basicYoutubePost) {
          views = rawData.basicYoutubePost.views || 0;
          engagement = rawData.basicYoutubePost.engageRate || 0;
          likes = rawData.basicYoutubePost.likes || 0;
          comments = rawData.basicYoutubePost.comments || 0;
        } else if (platform === 'tiktok' && rawData.basicTikTokVideo) {
          views = rawData.basicTikTokVideo.plays || 0;
          engagement = rawData.basicTikTokVideo.engageRate || 0;
          likes = rawData.basicTikTokVideo.hearts || 0;
          comments = rawData.basicTikTokVideo.comments || 0;
        } else if (platform === 'instagram' && rawData.basicInstagramPost) {
          const instagramData = rawData.basicInstagramPost;
          likes = instagramData.likes || 0;
          comments = instagramData.comments || 0;
          engagement = instagramData.engageRate || 0;
          
          // Para Instagram, usar videoViews si existe, sino calcular reach aproximado
          const videoViews = instagramData.videoViews || 0;
          if (videoViews > 0) {
            views = videoViews;
          } else {
            // Calcular reach aproximado basado en likes y comentarios
            views = this.calculateApproximateReach(likes, comments);
          }
        } else if (platform === 'twitter' && rawData.basicTwitterPost) {
          const twitterData = rawData.basicTwitterPost;
          likes = twitterData.likes || 0;
          comments = twitterData.replies || 0; // Twitter usa "replies" para comentarios
          views = twitterData.views || 0;
          engagement = twitterData.engageRate || 0;
        }
      }

      // Add to platform totals
      platformData[platform].views += views;
      platformData[platform].engagement += engagement;
      platformData[platform].likes += likes;
      platformData[platform].comments += comments;

      // Add to total engagement calculation
      totalEngagementRate += engagement;
      totalPosts++;
    });

    // Calculate totals and averages
    Object.entries(platformData).forEach(([platform, data]) => {
      if (platform === 'youtube') {
        metrics.reach.youtube = data.views;
        metrics.engagement.youtube = data.posts > 0 ? (data.engagement * 100) / data.posts : 0;
        metrics.likes.youtube = data.likes;
        metrics.comments.youtube = data.comments;
        metrics.posts.youtube = data.posts;
      } else if (platform === 'tiktok') {
        metrics.reach.tiktok = data.views;
        metrics.engagement.tiktok = data.posts > 0 ? (data.engagement * 100) / data.posts : 0;
        metrics.likes.tiktok = data.likes;
        metrics.comments.tiktok = data.comments;
        metrics.posts.tiktok = data.posts;
      } else if (platform === 'instagram') {
        metrics.reach.instagram = data.views;
        metrics.engagement.instagram = data.posts > 0 ? (data.engagement * 100) / data.posts : 0;
        metrics.likes.instagram = data.likes;
        metrics.comments.instagram = data.comments;
        metrics.posts.instagram = data.posts;
      } else if (platform === 'twitter') {
        metrics.reach.twitter = data.views;
        metrics.engagement.twitter = data.posts > 0 ? (data.engagement * 100) / data.posts : 0;
        metrics.likes.twitter = data.likes;
        metrics.comments.twitter = data.comments;
        metrics.posts.twitter = data.posts;
      }
    });

    // Calculate total reach
    metrics.reach.total = metrics.reach.youtube + metrics.reach.tiktok + metrics.reach.instagram + metrics.reach.twitter;

    // Calculate total likes and comments
    metrics.likes.total = metrics.likes.youtube + metrics.likes.tiktok + metrics.likes.instagram + metrics.likes.twitter;
    metrics.comments.total = metrics.comments.youtube + metrics.comments.tiktok + metrics.comments.instagram + metrics.comments.twitter;

    // Calculate correct average engagement: sum all rates, multiply by 100, divide by total posts
    metrics.engagement.average = totalPosts > 0 ? (totalEngagementRate * 100) / totalPosts : 0;

    return metrics;
  }

  /**
   * Calculate approximate reach for Instagram posts based on likes and comments
   */
  private calculateApproximateReach(likes: number | string, comments: number | string): number {
    const likesNum = typeof likes === 'string' ? parseInt(likes) || 0 : likes || 0;
    const commentsNum = typeof comments === 'string' ? parseInt(comments) || 0 : comments || 0;
    
    // Si no hay likes ni comentarios, usar un valor base fijo
    if (likesNum === 0 && commentsNum === 0) {
      return 35; // Valor fijo para posts sin engagement
    }
    
    // Calcular engagement rate aproximado (likes + comentarios)
    const totalEngagement = likesNum + commentsNum;
    
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
}

export const campaignMetricsService = CampaignMetricsService.getInstance(); 