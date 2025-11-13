import supabase from '../../config/supabase';
import { InfluencerPost, InfluencerPostCreateDTO, InfluencerPostUpdateDTO } from '../../models/influencer/influencer-post.model';
import { SentimentAnalysisService } from '../database/sentiment-analysis.service';

export class InfluencerPostService {
  /**
   * Helper method to enrich posts with influencer data
   */
  private async enrichPostsWithInfluencers(posts: any[]): Promise<any[]> {
    if (!posts || posts.length === 0) {
      return [];
    }

    // Get unique influencer IDs
    const influencerIds = [...new Set(posts.map(post => post.influencer_id).filter(Boolean))];

    if (influencerIds.length === 0) {
      return posts;
    }

    // Fetch influencers data
    const { data: influencers, error: influencersError } = await supabase
      .from('influencers')
      .select('id, name, avatar, platform_info')
      .in('id', influencerIds);

    if (influencersError) {
      console.warn('Error fetching influencers:', influencersError);
      return posts;
    }

    // Create a map of influencer_id to influencer data
    const influencersMap = new Map();
    (influencers || []).forEach(influencer => {
      influencersMap.set(influencer.id, influencer);
    });

    // Enrich posts with influencer data
    return posts.map(post => ({
      ...post,
      influencers: influencersMap.get(post.influencer_id) || null
    }));
  }

  async createInfluencerPost(data: InfluencerPostCreateDTO): Promise<InfluencerPost> {
    const { data: influencerPost, error } = await supabase
      .from('influencer_posts')
      .insert([{
        ...data,
        created_at: new Date(),
        updated_at: new Date()
      }])
      .select()
      .single();

    if (error) throw error;
    return influencerPost;
  }

  async getInfluencerPostById(id: string): Promise<InfluencerPost> {
    const { data: influencerPost, error } = await supabase
      .from('influencer_posts')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) throw error;
    return influencerPost;
  }

  async getInfluencerPostsByCampaign(campaignId: string, limit: number = 50, offset: number = 0): Promise<InfluencerPost[]> {
    const { data: influencerPosts, error } = await supabase
      .from('influencer_posts')
      .select('*')
      .eq('campaign_id', campaignId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Enrich with influencer data
    return await this.enrichPostsWithInfluencers(influencerPosts || []);
  }

  async getInfluencerPostsByInfluencer(influencerId: string, limit: number = 50, offset: number = 0): Promise<InfluencerPost[]> {
    const { data: influencerPosts, error } = await supabase
      .from('influencer_posts')
      .select('*')
      .eq('influencer_id', influencerId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Enrich with influencer data
    return await this.enrichPostsWithInfluencers(influencerPosts || []);
  }

  async getInfluencerPostsByCampaignAndInfluencer(campaignId: string, influencerId: string, limit: number = 50, offset: number = 0): Promise<InfluencerPost[]> {
    const { data: influencerPosts, error } = await supabase
      .from('influencer_posts')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('influencer_id', influencerId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Enrich with influencer data
    return await this.enrichPostsWithInfluencers(influencerPosts || []);
  }

  async updateInfluencerPost(id: string, data: InfluencerPostUpdateDTO): Promise<InfluencerPost> {
    const { data: influencerPost, error } = await supabase
      .from('influencer_posts')
      .update({
        ...data,
        updated_at: new Date()
      })
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single();

    if (error) throw error;
    return influencerPost;
  }

  async deleteInfluencerPost(id: string): Promise<void> {
    
    try {
      // 1. Marcar el post como eliminado (soft delete)
      const { error: postError } = await supabase
        .from('influencer_posts')
        .update({
          deleted_at: new Date(),
          updated_at: new Date()
        })
        .eq('id', id);

      if (postError) {
        console.error(`❌ Error marcando post ${id} como eliminado:`, postError);
        throw postError;
      }


      // 2. Eliminar el análisis de sentimientos correspondiente
      
      try {
        await SentimentAnalysisService.deleteSentimentAnalysis(id);
      } catch (sentimentError) {
        // No fallar la eliminación del post si hay error con el análisis
        console.warn(`⚠️ No se pudo eliminar el análisis de sentimientos para post ${id}:`, sentimentError);
        console.warn(`📝 El post fue eliminado correctamente, pero el análisis quedó huérfano`);
      }


    } catch (error) {
      console.error(`❌ Error en eliminación completa del post ${id}:`, error);
      throw error;
    }
  }

  async getInfluencerPostsByPlatform(platform: string): Promise<InfluencerPost[]> {
    const { data: influencerPosts, error } = await supabase
      .from('influencer_posts')
      .select('*')
      .eq('platform', platform)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return influencerPosts || [];
  }

  async getInfluencerPostsByDateRange(startDate: Date, endDate: Date): Promise<InfluencerPost[]> {
    const { data: influencerPosts, error } = await supabase
      .from('influencer_posts')
      .select('*')
      .gte('post_date', startDate.toISOString())
      .lte('post_date', endDate.toISOString())
      .is('deleted_at', null)
      .order('post_date', { ascending: false });

    if (error) throw error;
    return influencerPosts || [];
  }

  async getInfluencerPostsWithMetrics(campaignId: string, limit: number = 50, offset: number = 0): Promise<any[]> {
    // First, get the influencer posts
    const { data: influencerPosts, error: postsError } = await supabase
      .from('influencer_posts')
      .select('*')
      .eq('campaign_id', campaignId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (postsError) throw postsError;

    // If no posts, return empty array
    if (!influencerPosts || influencerPosts.length === 0) {
      return [];
    }

    // Get post IDs and influencer IDs
    const postIds = influencerPosts.map(post => post.id);
    const influencerIds = [...new Set(influencerPosts.map(post => post.influencer_id).filter(Boolean))];

    // Fetch metrics and influencers in parallel
    const [metricsResult, influencersResult] = await Promise.all([
      supabase
        .from('post_metrics')
        .select('post_id, likes_count, comments_count, views_count, engagement_rate, raw_response, created_at')
        .in('post_id', postIds)
        .order('created_at', { ascending: false }),
      influencerIds.length > 0
        ? supabase
            .from('influencers')
            .select('id, name, avatar, platform_info')
            .in('id', influencerIds)
        : Promise.resolve({ data: [], error: null })
    ]);

    const { data: postMetrics, error: metricsError } = metricsResult;
    const { data: influencers, error: influencersError } = influencersResult;

    if (metricsError) {
      console.warn('Error fetching post metrics:', metricsError);
    }

    if (influencersError) {
      console.warn('Error fetching influencers:', influencersError);
    }

    // Create a map of post_id to metrics (taking the latest metrics for each post)
    const metricsMap = new Map();
    (postMetrics || []).forEach(metric => {
      if (!metricsMap.has(metric.post_id)) {
        metricsMap.set(metric.post_id, metric);
      }
    });

    // Create a map of influencer_id to influencer data
    const influencersMap = new Map();
    (influencers || []).forEach(influencer => {
      influencersMap.set(influencer.id, influencer);
    });

    // Combine posts with their metrics and influencer data
    const transformedPosts = influencerPosts.map(post => ({
      ...post,
      post_metrics: metricsMap.get(post.id) || null,
      influencers: influencersMap.get(post.influencer_id) || null
    }));

    return transformedPosts;
  }
} 