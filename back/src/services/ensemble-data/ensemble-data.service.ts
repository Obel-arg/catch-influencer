import { PostMetricsCreateDTO, YouTubeMetrics, InstagramMetrics, TikTokMetrics } from '../../models/post-metrics/post-metrics.model';

export class EnsembleDataService {
  private readonly API_ROOT = 'https://ensembledata.com/apis';
  private readonly API_TOKEN = process.env.ENSEMBLE_DATA_API_TOKEN || '';

  private async makeRequest(endpoint: string, params: Record<string, any>): Promise<any> {
    const queryParams = new URLSearchParams({
      ...params,
      token: this.API_TOKEN
    }).toString();
    
    const url = `${this.API_ROOT}${endpoint}?${queryParams}`;
    
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Error llamando a EnsembleData API:', error);
      throw error;
    }
  }

  async getYouTubeChannelStats(videoId: string): Promise<any> {
    const endpoint = '/youtube/channel/get-short-stats';
    const params = {
      id: videoId,
      alternative_method: 'false',
      get_subscribers_count: 'true',
      token: this.API_TOKEN
    };
    
    const queryString = new URLSearchParams(params).toString();
    const url = `${this.API_ROOT}${endpoint}?${queryString}`;
    
    const response = await fetch(url);
    return response.json();
  }

  async getInstagramPostDetails(postCode: string): Promise<any> {
    const endpoint = '/instagram/post/details';
    const params = {
      code: postCode,
      n_comments_to_fetch: '0',
      token: this.API_TOKEN
    };
    
    const queryString = new URLSearchParams(params).toString();
    const url = `${this.API_ROOT}${endpoint}?${queryString}`;
    
    const response = await fetch(url);
    return response.json();
  }

  async getTikTokPostInfo(postUrl: string): Promise<any> {
    const endpoint = '/tt/post/info';
    const params = {
      url: postUrl,
      token: this.API_TOKEN
    };
    
    const queryString = new URLSearchParams(params).toString();
    const url = `${this.API_ROOT}${endpoint}?${queryString}`;
    
    const response = await fetch(url);
    return response.json();
  }

  // Función principal para extraer métricas según la plataforma
  async extractPostMetrics(postUrl: string, platform: string): Promise<PostMetricsCreateDTO | null> {
    try {
      let apiResponse: any;
      let metricsData: Partial<PostMetricsCreateDTO> = {
        post_url: postUrl,
        platform: platform as any,
        likes_count: 0,
        comments_count: 0,
        shares_count: 0,
        views_count: 0,
        api_status: 'pending'
      };

      switch (platform.toLowerCase()) {
        case 'youtube':
          const videoId = this.extractYouTubeVideoId(postUrl);
          if (videoId) {
            apiResponse = await this.getYouTubeChannelStats(videoId);
            metricsData = this.parseYouTubeResponse(apiResponse, postUrl);
          }
          break;

        case 'instagram':
          const postCode = this.extractInstagramPostCode(postUrl);
          if (postCode) {
            apiResponse = await this.getInstagramPostDetails(postCode);
            metricsData = this.parseInstagramResponse(apiResponse, postUrl);
          }
          break;

        case 'tiktok':
          apiResponse = await this.getTikTokPostInfo(postUrl);
          metricsData = this.parseTikTokResponse(apiResponse, postUrl);
          break;

        default:
          return null;
      }

      return {
        ...metricsData,
        raw_api_response: apiResponse,
        api_status: 'success'
      } as PostMetricsCreateDTO;

    } catch (error) {
      console.error('❌ Error extrayendo métricas:', error);
      return {
        post_url: postUrl,
        platform: platform as any,
        likes_count: 0,
        comments_count: 0,
        shares_count: 0,
        views_count: 0,
        api_status: 'error',
        api_error_message: error instanceof Error ? error.message : 'Error desconocido',
        raw_api_response: null
      } as PostMetricsCreateDTO;
    }
  }

  private extractYouTubeVideoId(url: string): string | null {
    // Patrones para diferentes formatos de URLs de YouTube incluyendo Shorts
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([^&\n?#]+)/,
      /(?:youtu\.be\/)([^&\n?#]+)/,
      /(?:youtube\.com\/embed\/)([^&\n?#]+)/,
      /(?:youtube\.com\/v\/)([^&\n?#]+)/,
      /(?:youtube\.com\/shorts\/)([^&\n?#]+)/,
      /(?:youtube\.com\/watch\?.*&v=)([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return null;
  }

  private extractInstagramPostCode(url: string): string | null {
    const regex = /instagram\.com\/p\/([^\/\?]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  private parseYouTubeResponse(response: any, postUrl: string): Partial<PostMetricsCreateDTO> {
    const data = response?.data || response;
    
    return {
      post_url: postUrl,
      platform: 'youtube',
      title: data?.channel_name || data?.title,
      description: data?.description,
      author_username: data?.channel_handle || data?.username,
      author_display_name: data?.channel_name || data?.display_name,
      likes_count: data?.likes_count || 0,
      comments_count: data?.comments_count || 0,
      shares_count: data?.shares_count || 0,
      views_count: data?.views_count || data?.view_count || 0,
      youtube_metrics: {
        channel_id: data?.channel_id,
        channel_name: data?.channel_name,
        video_id: data?.video_id,
        duration: data?.duration_seconds,
        category: data?.category,
        tags: data?.tags,
        subscriber_count: data?.subscriber_count || data?.subscribers_count,
        channel_views: data?.total_views || data?.channel_view_count,
        upload_date: data?.upload_date || data?.published_date
      } as YouTubeMetrics
    };
  }

  private parseInstagramResponse(response: any, postUrl: string): Partial<PostMetricsCreateDTO> {
    const data = response?.data || response;
    
    return {
      post_url: postUrl,
      platform: 'instagram',
      title: data?.caption?.substring(0, 100) + (data?.caption?.length > 100 ? '...' : ''),
      description: data?.caption,
      author_username: data?.owner?.username,
      author_display_name: data?.owner?.full_name,
      post_date: data?.taken_at ? new Date(data.taken_at * 1000) : undefined,
      likes_count: data?.like_count || 0,
      comments_count: data?.comment_count || 0,
      shares_count: 0, // Instagram no proporciona shares públicamente
      views_count: data?.view_count || data?.video_view_count || 0,
      instagram_metrics: {
        post_code: data?.code,
        post_type: data?.media_type === 1 ? 'photo' : data?.media_type === 2 ? 'video' : 'carousel',
        is_video: data?.is_video || false,
        location: data?.location ? {
          name: data.location.name,
          id: data.location.pk
        } : undefined,
        hashtags: this.extractHashtags(data?.caption || ''),
        mentions: this.extractMentions(data?.caption || ''),
        media_urls: data?.image_versions2?.candidates?.map((img: any) => img.url) || []
      } as InstagramMetrics
    };
  }

  private parseTikTokResponse(response: any, postUrl: string): Partial<PostMetricsCreateDTO> {
    const data = response?.data || response;
    
    return {
      post_url: postUrl,
      platform: 'tiktok',
      title: data?.desc?.substring(0, 100) + (data?.desc?.length > 100 ? '...' : ''),
      description: data?.desc,
      author_username: data?.author?.unique_id,
      author_display_name: data?.author?.nickname,
      post_date: data?.create_time ? new Date(data.create_time * 1000) : undefined,
      likes_count: data?.stats?.digg_count || 0,
      comments_count: data?.stats?.comment_count || 0,
      shares_count: data?.stats?.share_count || 0,
      views_count: data?.stats?.play_count || 0,
      tiktok_metrics: {
        video_id: data?.id,
        music_info: data?.music ? {
          title: data.music.title,
          author: data.music.author,
          duration: data.music.duration
        } : undefined,
        effects: data?.effects?.map((effect: any) => effect.name) || [],
        hashtags: this.extractHashtags(data?.desc || ''),
        mentions: this.extractMentions(data?.desc || ''),
        video_duration: data?.video?.duration,
        play_count: data?.stats?.play_count || 0
      } as TikTokMetrics
    };
  }

  private extractHashtags(text: string): string[] {
    const hashtags = text.match(/#[a-zA-Z0-9_]+/g);
    return hashtags ? hashtags.map(tag => tag.slice(1)) : [];
  }

  private extractMentions(text: string): string[] {
    const mentions = text.match(/@[a-zA-Z0-9_]+/g);
    return mentions ? mentions.map(mention => mention.slice(1)) : [];
  }
} 