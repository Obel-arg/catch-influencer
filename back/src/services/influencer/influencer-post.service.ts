import supabase from '../../config/supabase';
import { InfluencerPost, InfluencerPostCreateDTO, InfluencerPostUpdateDTO } from '../../models/influencer/influencer-post.model';
import { SentimentAnalysisService } from '../database/sentiment-analysis.service';

export class InfluencerPostService {
  /**
   * Helper method to normalize post_metrics from array to object
   */
  private normalizePostMetrics(posts: any[]): any[] {
    return posts.map(post => {
      // Supabase returns post_metrics as an array, but we need it as a single object
      if (post.post_metrics && Array.isArray(post.post_metrics)) {
        post.post_metrics = post.post_metrics[0] || null;
      }
      return post;
    });
  }

  /**
   * Helper method to enrich posts with influencer data and normalize post_image_urls
   */
  private async enrichPostsWithInfluencers(posts: any[]): Promise<any[]> {
    if (!posts || posts.length === 0) {
      return [];
    }

    // Normalize post_metrics first
    posts = this.normalizePostMetrics(posts);

    // Normalize post_image_urls (Supabase returns as array, but we need single object)
    posts = posts.map(post => {
      if (post.post_image_urls && Array.isArray(post.post_image_urls)) {
        post.post_image_urls = post.post_image_urls[0] || null;
      }
      return post;
    });

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
    // Validate Instagram stories have required fields
    if (data.platform?.toLowerCase() === 'instagram' && data.content_type === 'story') {
      if (!data.image_url) {
        throw new Error('Instagram stories require a screenshot (image_url)');
      }

      // Remove likes and comments for stories (stories don't support these metrics)
      delete data.likes_count;
      delete data.comments_count;
      // Note: views_count and impressions_count will be added later via manual metrics
    }

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

    // For Instagram stories, create post_metrics record with manual metrics
    if (influencerPost.platform?.toLowerCase() === 'instagram' && influencerPost.content_type === 'story') {
      try {
        await supabase.from('post_metrics').insert({
          post_id: influencerPost.id,
          platform: influencerPost.platform,
          raw_response: {
            manual_metrics: {
              likes: 0,
              comments: 0,
              views: influencerPost.views_count || 0,
              impressions: influencerPost.impressions_count || 0,
              alcance: influencerPost.views_count || 0,
              saved_at: new Date().toISOString()
            }
          },
          extracted_at: new Date(),
          created_at: new Date(),
          updated_at: new Date()
        });
      } catch (metricsError) {
        console.error('Error creating post_metrics for story:', metricsError);
        // Don't fail the entire operation if metrics creation fails
      }
    }

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

  async getInfluencerPostsByCampaign(campaignId: string, limit?: number, offset?: number): Promise<InfluencerPost[]> {
    // 🚀 SIN LÍMITE: Traer todos los posts (Supabase tiene límite de 1000 por defecto)
    let query = supabase
      .from('influencer_posts')
      .select('*, post_metrics(*), post_image_urls(*)')
      .eq('campaign_id', campaignId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    
    // Solo aplicar range si se especifica explícitamente
    if (limit !== undefined && offset !== undefined) {
      query = query.range(offset, offset + limit - 1);
    }
    
    const { data: influencerPosts, error } = await query;

    if (error) throw error;

    // Enrich with influencer data
    return await this.enrichPostsWithInfluencers(influencerPosts || []);
  }

  async getInfluencerPostsByInfluencer(influencerId: string, limit: number = 50, offset: number = 0): Promise<InfluencerPost[]> {
    const { data: influencerPosts, error } = await supabase
      .from('influencer_posts')
      .select('*, post_metrics(*), post_image_urls(*)')
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
      .select('*, post_metrics(*), post_image_urls(*)')
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

  async getInfluencerPostsWithMetrics(campaignId: string, limit?: number, offset?: number): Promise<any[]> {
    // First, get the influencer posts
    // 🚀 SIN LÍMITE: Traer todos los posts (Supabase tiene límite de 1000 por defecto)
    let query = supabase
      .from('influencer_posts')
      .select('*')
      .eq('campaign_id', campaignId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    
    // Solo aplicar range si se especifica explícitamente
    if (limit !== undefined && offset !== undefined) {
      query = query.range(offset, offset + limit - 1);
    }
    
    const { data: influencerPosts, error: postsError } = await query;

    if (postsError) throw postsError;

    // If no posts, return empty array
    if (!influencerPosts || influencerPosts.length === 0) {
      return [];
    }

    // Get post IDs and influencer IDs
    const postIds = influencerPosts.map(post => post.id);
    const influencerIds = [...new Set(influencerPosts.map(post => post.influencer_id).filter(Boolean))];

    // Fetch metrics, image URLs, and influencers in parallel
    const [metricsResult, imageUrlsResult, influencersResult] = await Promise.all([
      supabase
        .from('post_metrics')
        .select('post_id, likes_count, comments_count, views_count, engagement_rate, raw_response, created_at')
        .in('post_id', postIds)
        .order('created_at', { ascending: false }),
      supabase
        .from('post_image_urls')
        .select('post_id, image_url, storage_provider, created_at, updated_at')
        .in('post_id', postIds),
      influencerIds.length > 0
        ? supabase
            .from('influencers')
            .select('id, name, avatar, platform_info')
            .in('id', influencerIds)
        : Promise.resolve({ data: [], error: null })
    ]);

    const { data: postMetrics, error: metricsError } = metricsResult;
    const { data: postImageUrls, error: imageUrlsError } = imageUrlsResult;
    const { data: influencers, error: influencersError } = influencersResult;

    if (metricsError) {
      console.warn('Error fetching post metrics:', metricsError);
    }

    if (imageUrlsError) {
      console.warn('Error fetching post image URLs:', imageUrlsError);
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

    // Create a map of post_id to image URL
    const imageUrlsMap = new Map();
    (postImageUrls || []).forEach(imageUrl => {
      imageUrlsMap.set(imageUrl.post_id, imageUrl);
    });

    // Create a map of influencer_id to influencer data
    const influencersMap = new Map();
    (influencers || []).forEach(influencer => {
      influencersMap.set(influencer.id, influencer);
    });

    // Combine posts with their metrics, image URLs, and influencer data
    const transformedPosts = influencerPosts.map(post => ({
      ...post,
      post_metrics: metricsMap.get(post.id) || null,
      post_image_urls: imageUrlsMap.get(post.id) || null,
      influencers: influencersMap.get(post.influencer_id) || null
    }));

    return transformedPosts;
  }
} 