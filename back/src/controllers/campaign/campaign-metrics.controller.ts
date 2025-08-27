import { Request, Response } from 'express';
import supabase from '../../config/supabase';

export class CampaignMetricsController {
  /**
   * Get campaign metrics by calculating from post_metrics data
   */
  async getCampaignMetrics(req: Request, res: Response) {
    try {
      const { campaignId } = req.params;

      if (!campaignId) {
        return res.status(400).json({
          success: false,
          message: 'Campaign ID is required'
        });
      }

      // Get all posts for this campaign
      const { data: influencerPosts, error: postsError } = await supabase
        .from('influencer_posts')
        .select('id, platform')
        .eq('campaign_id', campaignId)
        .is('deleted_at', null);

      if (postsError) {
        console.error('Error fetching influencer posts:', postsError);
        return res.status(500).json({
          success: false,
          message: 'Error fetching campaign posts'
        });
      }

      if (!influencerPosts || influencerPosts.length === 0) {
        return res.json({
          success: true,
          data: {
            reach: { total: 0, youtube: 0, tiktok: 0, instagram: 0 },
            engagement: { average: 0, youtube: 0, tiktok: 0, instagram: 0 },
            likes: { total: 0, youtube: 0, tiktok: 0, instagram: 0 },
            comments: { total: 0, youtube: 0, tiktok: 0, instagram: 0 },
            posts: { total: 0, youtube: 0, tiktok: 0, instagram: 0 }
          }
        });
      }

      // Get post IDs
      const postIds = influencerPosts.map(post => post.id);

      // Get metrics for these posts
      const { data: postMetrics, error: metricsError } = await supabase
        .from('post_metrics')
        .select('post_id, platform, platform_data, raw_response')
        .in('post_id', postIds);

      if (metricsError) {
        console.error('Error fetching post metrics:', metricsError);
        return res.status(500).json({
          success: false,
          message: 'Error fetching post metrics'
        });
      }

      // Calculate metrics
      const metrics = this.calculateMetricsFromData(influencerPosts, postMetrics || []);

      res.json({
        success: true,
        data: metrics
      });

    } catch (error) {
      console.error('Error calculating campaign metrics:', error);
      res.status(500).json({
        success: false,
        message: 'Error calculating campaign metrics'
      });
    }
  }

  /**
   * Calculate metrics from influencer posts and post metrics data
   */
  private calculateMetricsFromData(influencerPosts: any[], postMetrics: any[]) {
    const metrics = {
      reach: { total: 0, youtube: 0, tiktok: 0, instagram: 0 },
      engagement: { average: 0, youtube: 0, tiktok: 0, instagram: 0 },
      likes: { total: 0, youtube: 0, tiktok: 0, instagram: 0 },
      comments: { total: 0, youtube: 0, tiktok: 0, instagram: 0 },
      posts: { total: 0, youtube: 0, tiktok: 0, instagram: 0 }
    };

    const platformData: Record<string, { views: number; engagement: number; likes: number; comments: number; posts: number }> = {
      youtube: { views: 0, engagement: 0, likes: 0, comments: 0, posts: 0 },
      tiktok: { views: 0, engagement: 0, likes: 0, comments: 0, posts: 0 },
      instagram: { views: 0, engagement: 0, likes: 0, comments: 0, posts: 0 }
    };

    // Create a map of post_id to metrics for quick lookup
    const metricsMap = new Map();
    postMetrics.forEach(metric => {
      metricsMap.set(metric.post_id, metric);
    });

    // Process each influencer post
    influencerPosts.forEach((post: any) => {
      const platform = post.platform?.toLowerCase();
      if (!platform || !platformData[platform]) return;

      // Count posts
      platformData[platform].posts++;
      metrics.posts.total++;

      // Get metrics for this post
      const postMetric = metricsMap.get(post.id);
      if (!postMetric) return;

      // Extract views/plays, likes, comments and engagement from platform_data or raw_response
      let views = 0;
      let engagement = 0;
      let likes = 0;
      let comments = 0;

      // ✅ NUEVO: Verificar si son métricas manuales (para historias de Instagram)
      if (postMetric.raw_response?.manual_metrics) {
        const manualData = postMetric.raw_response.manual_metrics;
        likes = parseInt(manualData.likes) || 0;
        comments = parseInt(manualData.comments) || 0;
        views = parseInt(manualData.alcance) || 0; // alcance = reach para historias
        
        // Calcular engagement rate para historias
        const totalEngagement = likes + comments;
        engagement = views > 0 ? (totalEngagement / views) : 0; // Ya en decimal
        
       
      } else {
        // Try to get data from platform_data first, then raw_response
        const dataSource = postMetric.platform_data || postMetric.raw_response?.data;
        
        if (dataSource) {
          if (platform === 'youtube' && dataSource.basicYoutubePost) {
            views = dataSource.basicYoutubePost.views || 0;
            engagement = dataSource.basicYoutubePost.engageRate || 0;
            likes = dataSource.basicYoutubePost.likes || 0;
            comments = dataSource.basicYoutubePost.comments || 0;
          } else if (platform === 'tiktok' && dataSource.basicTikTokVideo) {
            views = dataSource.basicTikTokVideo.plays || 0;
            engagement = dataSource.basicTikTokVideo.engageRate || 0;
            likes = dataSource.basicTikTokVideo.hearts || 0;
            comments = dataSource.basicTikTokVideo.comments || 0;
          } else if (platform === 'instagram' && dataSource.basicInstagramPost) {
            const instagramData = dataSource.basicInstagramPost;
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
          }
        }
      }

      // Add to platform totals
      platformData[platform].views += views;
      platformData[platform].engagement += engagement;
      platformData[platform].likes += likes;
      platformData[platform].comments += comments;
    });

    // Calculate totals and averages
    Object.entries(platformData).forEach(([platform, data]) => {
      if (platform === 'youtube') {
        metrics.reach.youtube = data.views;
        metrics.engagement.youtube = data.posts > 0 ? (data.engagement / data.posts) * 100 : 0;
        metrics.likes.youtube = data.likes;
        metrics.comments.youtube = data.comments;
        metrics.posts.youtube = data.posts;
      } else if (platform === 'tiktok') {
        metrics.reach.tiktok = data.views;
        metrics.engagement.tiktok = data.posts > 0 ? (data.engagement / data.posts) * 100 : 0;
        metrics.likes.tiktok = data.likes;
        metrics.comments.tiktok = data.comments;
        metrics.posts.tiktok = data.posts;
      } else if (platform === 'instagram') {
        metrics.reach.instagram = data.views;
        metrics.engagement.instagram = data.posts > 0 ? (data.engagement / data.posts) * 100 : 0;
        metrics.likes.instagram = data.likes;
        metrics.comments.instagram = data.comments;
        metrics.posts.instagram = data.posts;
      }
    });

    // Calculate total reach
    metrics.reach.total = metrics.reach.youtube + metrics.reach.tiktok + metrics.reach.instagram;

    // Calculate total likes and comments
    metrics.likes.total = metrics.likes.youtube + metrics.likes.tiktok + metrics.likes.instagram;
    metrics.comments.total = metrics.comments.youtube + metrics.comments.tiktok + metrics.comments.instagram;

    // Calculate average engagement
    const totalEngagement = metrics.engagement.youtube + metrics.engagement.tiktok + metrics.engagement.instagram;
    const totalPosts = metrics.posts.total;
    metrics.engagement.average = totalPosts > 0 ? totalEngagement / totalPosts : 0;

    return metrics;
  }

  /**
   * Calculate approximate reach for Instagram posts based on likes and comments
   * Same logic as frontend CampaignMetricsService
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