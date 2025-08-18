import { google } from 'googleapis';
import { youtubeConfig } from '../../config/youtube.config';
import { postgresCacheService } from '../cache/postgres-cache.service';

// Initialize YouTube API client
const youtube = google.youtube({ version: 'v3', auth: youtubeConfig.apiKey });

export interface YouTubeVideoMetrics {
  videoId: string;
  title: string;
  description: string;
  channelTitle: string;
  channelId: string;
  publishedAt: string;
  thumbnails: {
    default?: { url: string; width: number; height: number };
    medium?: { url: string; width: number; height: number };
    high?: { url: string; width: number; height: number };
    standard?: { url: string; width: number; height: number };
    maxres?: { url: string; width: number; height: number };
  };
  duration: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  favoriteCount: number;
  tags: string[];
  categoryId: string;
  defaultLanguage?: string;
  defaultAudioLanguage?: string;
  liveBroadcastContent: 'none' | 'upcoming' | 'live';
  projection: 'rectangular' | '360';
  hasCustomThumbnail: boolean;
  engagementRate: number;
  rawResponse: any;
}

export interface YouTubeChannelMetrics {
  channelId: string;
  channelTitle: string;
  description: string;
  customUrl?: string;
  publishedAt: string;
  thumbnails: {
    default?: { url: string; width: number; height: number };
    medium?: { url: string; width: number; height: number };
    high?: { url: string; width: number; height: number };
  };
  country?: string;
  viewCount: number;
  subscriberCount: number;
  hiddenSubscriberCount: boolean;
  videoCount: number;
  rawResponse: any;
}

export class YouTubeMetricsService {
  private static instance: YouTubeMetricsService;

  private constructor() {}

  public static getInstance(): YouTubeMetricsService {
    if (!YouTubeMetricsService.instance) {
      YouTubeMetricsService.instance = new YouTubeMetricsService();
    }
    return YouTubeMetricsService.instance;
  }

  /**
   * Extract video ID from YouTube URL
   */
  private extractVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/watch\?.*&v=|youtube\.com\/watch\?.*v=)([^&\n?#]+)/,
      /youtube\.com\/shorts\/([^&\n?#]+)/
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
   * Extract channel ID from YouTube URL
   */
  private extractChannelId(url: string): string | null {
    const patterns = [
      /youtube\.com\/channel\/([^&\n?#\/]+)/,
      /youtube\.com\/c\/([^&\n?#\/]+)/,
      /youtube\.com\/@([^&\n?#\/]+)/
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
   * Convert YouTube API thumbnails to our format
   */
  private convertThumbnails(apiThumbnails: any): any {
    const thumbnails: any = {};
    
    if (apiThumbnails?.default) {
      thumbnails.default = {
        url: apiThumbnails.default.url || '',
        width: apiThumbnails.default.width || 0,
        height: apiThumbnails.default.height || 0
      };
    }
    
    if (apiThumbnails?.medium) {
      thumbnails.medium = {
        url: apiThumbnails.medium.url || '',
        width: apiThumbnails.medium.width || 0,
        height: apiThumbnails.medium.height || 0
      };
    }
    
    if (apiThumbnails?.high) {
      thumbnails.high = {
        url: apiThumbnails.high.url || '',
        width: apiThumbnails.high.width || 0,
        height: apiThumbnails.high.height || 0
      };
    }
    
    if (apiThumbnails?.standard) {
      thumbnails.standard = {
        url: apiThumbnails.standard.url || '',
        width: apiThumbnails.standard.width || 0,
        height: apiThumbnails.standard.height || 0
      };
    }
    
    if (apiThumbnails?.maxres) {
      thumbnails.maxres = {
        url: apiThumbnails.maxres.url || '',
        width: apiThumbnails.maxres.width || 0,
        height: apiThumbnails.maxres.height || 0
      };
    }
    
    return thumbnails;
  }

  /**
   * Get video metrics using YouTube API
   */
  async getVideoMetrics(videoUrl: string): Promise<{
    success: boolean;
    data?: YouTubeVideoMetrics;
    error?: string;
  }> {
    const startTime = Date.now();

    try {
      const videoId = this.extractVideoId(videoUrl);
      if (!videoId) {
        return {
          success: false,
          error: 'No se pudo extraer el ID del video de la URL'
        };
      }

      // Check cache first
      const cacheKey = `youtube:video:${videoId}`;
      const cached = await postgresCacheService.get<YouTubeVideoMetrics>(cacheKey);
      if (cached) {
        
        return {
          success: true,
          data: cached
        };
      }

      // Fetch video details
      const videoResponse = await youtube.videos.list({
        part: ['snippet', 'statistics', 'contentDetails'],
        id: [videoId]
      });

      if (!videoResponse.data.items || videoResponse.data.items.length === 0) {
        return {
          success: false,
          error: 'Video no encontrado o no disponible'
        };
      }

      const video = videoResponse.data.items[0];
      const snippet = video.snippet!;
      const statistics = video.statistics!;
      const contentDetails = video.contentDetails!;

      // Calculate engagement rate
      const viewCount = parseInt(statistics.viewCount || '0', 10);
      const likeCount = parseInt(statistics.likeCount || '0', 10);
      const commentCount = parseInt(statistics.commentCount || '0', 10);
      const engagementRate = viewCount > 0 ? ((likeCount + commentCount) / viewCount) : 0;

      const metrics: YouTubeVideoMetrics = {
        videoId,
        title: snippet.title || '',
        description: snippet.description || '',
        channelTitle: snippet.channelTitle || '',
        channelId: snippet.channelId || '',
        publishedAt: snippet.publishedAt || '',
        thumbnails: this.convertThumbnails(snippet.thumbnails),
        duration: contentDetails.duration || '',
        viewCount,
        likeCount,
        commentCount,
        favoriteCount: parseInt(statistics.favoriteCount || '0', 10),
        tags: snippet.tags || [],
        categoryId: snippet.categoryId || '',
        defaultLanguage: snippet.defaultLanguage || undefined,
        defaultAudioLanguage: snippet.defaultAudioLanguage || undefined,
        liveBroadcastContent: snippet.liveBroadcastContent as any || 'none',
        projection: contentDetails.projection as any || 'rectangular',
        hasCustomThumbnail: !!snippet.thumbnails?.maxres,
        engagementRate,
        rawResponse: videoResponse.data
      };

      // Cache the result for 1 hour
      await postgresCacheService.set(cacheKey, metrics, 3600).catch(() => {
        console.warn(`⚠️ [YOUTUBE-METRICS] Failed to cache video metrics for ${videoId}`);
      });

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: metrics
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.error(`❌ [YOUTUBE-METRICS] Error fetching video metrics after ${processingTime}ms:`, error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al obtener métricas del video'
      };
    }
  }

  /**
   * Get channel metrics using YouTube API
   */
  async getChannelMetrics(channelUrl: string): Promise<{
    success: boolean;
    data?: YouTubeChannelMetrics;
    error?: string;
  }> {
    const startTime = Date.now();

    try {
      const channelId = this.extractChannelId(channelUrl);
      if (!channelId) {
        return {
          success: false,
          error: 'No se pudo extraer el ID del canal de la URL'
        };
      }

      // Check cache first
      const cacheKey = `youtube:channel:${channelId}`;
      const cached = await postgresCacheService.get<YouTubeChannelMetrics>(cacheKey);
      if (cached) {
        return {
          success: true,
          data: cached
        };
      }

      // Fetch channel details
      const channelResponse = await youtube.channels.list({
        part: ['snippet', 'statistics', 'brandingSettings'],
        id: [channelId]
      });

      if (!channelResponse.data.items || channelResponse.data.items.length === 0) {
        return {
          success: false,
          error: 'Canal no encontrado o no disponible'
        };
      }

      const channel = channelResponse.data.items[0];
      const snippet = channel.snippet!;
      const statistics = channel.statistics!;

      const metrics: YouTubeChannelMetrics = {
        channelId,
        channelTitle: snippet.title || '',
        description: snippet.description || '',
        customUrl: snippet.customUrl || undefined,
        publishedAt: snippet.publishedAt || '',
        thumbnails: this.convertThumbnails(snippet.thumbnails),
        country: snippet.country || undefined,
        viewCount: parseInt(statistics.viewCount || '0', 10),
        subscriberCount: parseInt(statistics.subscriberCount || '0', 10),
        hiddenSubscriberCount: statistics.hiddenSubscriberCount || false,
        videoCount: parseInt(statistics.videoCount || '0', 10),
        rawResponse: channelResponse.data
      };

      // Cache the result for 6 hours (channels change less frequently)
      await postgresCacheService.set(cacheKey, metrics, 21600).catch(() => {
        console.warn(`⚠️ [YOUTUBE-METRICS] Failed to cache channel metrics for ${channelId}`);
      });

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: metrics
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.error(`❌ [YOUTUBE-METRICS] Error fetching channel metrics after ${processingTime}ms:`, error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al obtener métricas del canal'
      };
    }
  }

  /**
   * Convert YouTube metrics to CreatorDB format for consistency
   */
  convertToSystemFormat(
    postId: string,
    videoUrl: string,
    youtubeMetrics: YouTubeVideoMetrics
  ): any {
    // Extract hashtags from title and description
    const hashtags = this.extractHashtags(youtubeMetrics.title + ' ' + youtubeMetrics.description);
    
    // Determine if it's a Shorts video (duration < 60 seconds)
    const durationInSeconds = this.parseDuration(youtubeMetrics.duration);
    const isShorts = durationInSeconds <= 60;
    
    // Get video category name
    const category = this.getCategoryName(youtubeMetrics.categoryId);
    
    // Calculate engagement rate as (likes + comments) / views
    const engagementRate = youtubeMetrics.viewCount > 0 
      ? ((youtubeMetrics.likeCount + youtubeMetrics.commentCount) / youtubeMetrics.viewCount) 
      : 0;

    // Create CreatorDB format response
    const creatorDbFormat = {
      data: {
        basicYoutubePost: {
          lang: youtubeMetrics.defaultLanguage || "spa",
          likes: youtubeMetrics.likeCount,
          title: youtubeMetrics.title,
          views: youtubeMetrics.viewCount,
          length: durationInSeconds,
          videoId: youtubeMetrics.videoId,
          category: category,
          comments: youtubeMetrics.commentCount,
          hashtags: hashtags,
          isShorts: isShorts,
          engageRate: engagementRate,
          uploadDate: new Date(youtubeMetrics.publishedAt).getTime(),
          isStreaming: youtubeMetrics.liveBroadcastContent === 'live',
          isPaidPromote: false, // YouTube API doesn't provide this info
          commentLikeRatio: 0, // Would need additional API calls
          selfCommentRatio: 0, // Would need additional API calls
          commentReplyRatio: 0 // Would need additional API calls
        }
      },
      error: "",
      success: true,
      quotaUsed: 1,
      timestamp: Date.now(),
      quotaUsedTotal: 1, // We don't track total quota usage
      remainingPlanCredit: 9999, // Placeholder
      remainingPrepurchasedCredit: 0
    };

    return {
      post_id: postId,
      platform: 'youtube',
      content_id: youtubeMetrics.videoId,
      post_url: videoUrl,
      title: youtubeMetrics.title,
      likes_count: youtubeMetrics.likeCount,
      comments_count: youtubeMetrics.commentCount,
      views_count: youtubeMetrics.viewCount,
      engagement_rate: engagementRate,
      platform_data: creatorDbFormat,
      quota_used: 1,
      api_timestamp: Date.now(),
      api_success: true,
      api_error: undefined,
      raw_response: creatorDbFormat
    };
  }

  /**
   * Extract hashtags from text
   */
  private extractHashtags(text: string): string[] {
    const hashtagRegex = /#[\w\u0590-\u05ff]+/g;
    const hashtags = text.match(hashtagRegex) || [];
    return hashtags.map(tag => tag.toLowerCase());
  }

  /**
   * Parse YouTube duration format (PT4M13S) to seconds
   */
  private parseDuration(duration: string): number {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    
    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    const seconds = parseInt(match[3] || '0', 10);
    
    return hours * 3600 + minutes * 60 + seconds;
  }

  /**
   * Get category name from YouTube category ID
   */
  private getCategoryName(categoryId: string): string {
    const categories: { [key: string]: string } = {
      '1': 'Film & Animation',
      '2': 'Autos & Vehicles',
      '10': 'Music',
      '15': 'Pets & Animals',
      '17': 'Sports',
      '19': 'Travel & Events',
      '20': 'Gaming',
      '22': 'People & Blogs',
      '23': 'Comedy',
      '24': 'Entertainment',
      '25': 'News & Politics',
      '26': 'Howto & Style',
      '27': 'Education',
      '28': 'Science & Technology',
      '29': 'Nonprofits & Activism'
    };
    
    return categories[categoryId] || 'Other';
  }
} 