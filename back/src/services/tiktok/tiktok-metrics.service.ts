import axios from 'axios';
import { postgresCacheService } from '../cache/postgres-cache.service';

// TikTok API configuration
const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN || '';
const APIFY_ACTOR_ID = 'clockworks~tiktok-scraper';
const APIFY_API_BASE_URL = 'https://api.apify.com/v2';

export interface TikTokVideoMetrics {
  id: string;
  text: string;
  textLanguage: string;
  createTime: number;
  createTimeISO: string;
  locationCreated: string;
  isAd: boolean;
  authorMeta: {
    id: string;
    name: string;
    profileUrl: string;
    nickName: string;
    verified: boolean;
    signature: string;
    bioLink: string | null;
    originalAvatarUrl: string;
    avatar: string;
    privateAccount: boolean;
    roomId: string;
    ttSeller: boolean;
    following: number;
    friends: number;
    fans: number;
    heart: number;
    video: number;
    digg: number;
  };
  musicMeta: {
    musicName: string;
    musicAuthor: string;
    musicOriginal: boolean;
    playUrl: string;
    coverMediumUrl: string;
    originalCoverMediumUrl: string;
    musicId: string;
  };
  webVideoUrl: string;
  mediaUrls: string[];
  videoMeta: {
    height: number;
    width: number;
    duration: number;
    coverUrl: string;
    originalCoverUrl: string;
    definition: string;
    format: string;
    subtitleLinks: Array<{
      language: string;
      downloadLink: string;
      tiktokLink: string;
      source: string;
      sourceUnabbreviated: string;
      version: string;
    }>;
  };
  diggCount: number;
  shareCount: number;
  playCount: number;
  collectCount: number;
  commentCount: number;
  mentions: string[];
  detailedMentions: any[];
  hashtags: string[];
  effectStickers: any[];
  isSlideshow: boolean;
  isPinned: boolean;
  isSponsored: boolean;
  submittedVideoUrl: string;
}

export class TikTokMetricsService {
  private static instance: TikTokMetricsService;

  private constructor() {}

  public static getInstance(): TikTokMetricsService {
    if (!TikTokMetricsService.instance) {
      TikTokMetricsService.instance = new TikTokMetricsService();
    }
    return TikTokMetricsService.instance;
  }

  /**
   * Extract video ID from TikTok URL
   */
  private extractVideoId(url: string): string | null {
    const patterns = [
      /tiktok\.com\/@[^\/]+\/video\/(\d+)/,
      /tiktok\.com\/video\/(\d+)/,
      /vm\.tiktok\.com\/[^\/]+\/\?video_id=(\d+)/,
      /tiktok\.com\/t\/([a-zA-Z0-9]+)/
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
   * Extract user ID from TikTok URL
   */
  private extractUserId(url: string): string | null {
    const patterns = [
      /tiktok\.com\/@([^\/]+)/,
      /tiktok\.com\/user\/([^\/]+)/
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
   * Extract hashtag names from hashtag objects and format them with #
   */
  private extractHashtagNames(hashtags: any[]): string[] {
    if (!hashtags || !Array.isArray(hashtags)) {
      return [];
    }

    return hashtags
      .map(hashtag => {
        // Handle different hashtag formats
        if (typeof hashtag === 'string') {
          // If it's already a string, ensure it has #
          return hashtag.startsWith('#') ? hashtag : `#${hashtag}`;
        } else if (hashtag && typeof hashtag === 'object') {
          // If it's an object with name property
          if (hashtag.name) {
            return hashtag.name.startsWith('#') ? hashtag.name : `#${hashtag.name}`;
          }
          // If it's an object with id as name
          if (hashtag.id) {
            return hashtag.id.startsWith('#') ? hashtag.id : `#${hashtag.id}`;
          }
        }
        return null;
      })
      .filter(hashtag => hashtag !== null) as string[];
  }

  /**
   * Get video metrics using Apify actor
   */
  async getVideoMetrics(videoUrl: string): Promise<{
    success: boolean;
    data?: TikTokVideoMetrics;
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
      const cacheKey = `tiktok:video:${videoId}`;
      const cached = await postgresCacheService.get<TikTokVideoMetrics>(cacheKey);
      if (cached) {
        return {
          success: true,
          data: cached
        };
      }

      // Call Apify actor synchronously and get results directly
      const resultsResponse = await axios.post(`${APIFY_API_BASE_URL}/acts/${APIFY_ACTOR_ID}/run-sync-get-dataset-items`, {
        postURLs: [videoUrl]
      }, {
        headers: {
          'Authorization': `Bearer ${APIFY_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      if (!resultsResponse.data || resultsResponse.data.length === 0) {
        return {
          success: false,
          error: 'No se encontraron datos del video'
        };
      }

      const videoData = resultsResponse.data[0] as TikTokVideoMetrics;

      // Cache the result for 1 hour
      await postgresCacheService.set(cacheKey, videoData, 3600).catch(() => {
        console.warn(`⚠️ [TIKTOK-METRICS] Failed to cache video metrics for ${videoId}`);
      });

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: videoData
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.error(`❌ [TIKTOK-METRICS] Error fetching video metrics after ${processingTime}ms:`, error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al obtener métricas del video'
      };
    }
  }

  /**
   * Convert TikTok metrics to CreatorDB format for consistency
   */
  convertToSystemFormat(
    postId: string,
    videoUrl: string,
    tiktokMetrics: TikTokVideoMetrics
  ): any {
    // Calculate engagement rate as (comments + likes) / followers * 100 for percentage
    let engagementRate = tiktokMetrics.authorMeta.fans > 0 
      ? ((tiktokMetrics.commentCount + tiktokMetrics.diggCount) / tiktokMetrics.authorMeta.fans)
      : 0;
    
    // Cap engagement rate at 100% to avoid unrealistic values
    if (engagementRate > 100) {
      console.warn(`⚠️ [TIKTOK-METRICS] Unrealistic engagement rate: ${engagementRate.toFixed(2)}%, capping at 100%`);
      engagementRate = 100;
    }

    // Create CreatorDB format response
    const creatorDbFormat = {
      data: {
        basicTikTokVideo: {
          isAd: tiktokMetrics.isAd,
          cover: tiktokMetrics.videoMeta.coverUrl,
          plays: tiktokMetrics.playCount,
          hearts: tiktokMetrics.diggCount,
          length: tiktokMetrics.videoMeta.duration,
          shares: tiktokMetrics.shareCount,
          audioId: tiktokMetrics.musicMeta.musicId,
          videoId: tiktokMetrics.id,
          comments: tiktokMetrics.commentCount,
          hashtags: this.extractHashtagNames(tiktokMetrics.hashtags),
          audioAlbum: "",
          audioTitle: tiktokMetrics.musicMeta.musicName,
          engageRate: engagementRate,
          uploadDate: tiktokMetrics.createTime * 1000, // Convert to milliseconds
          audioAuthor: tiktokMetrics.musicMeta.musicAuthor,
          isDuetEnabled: false, // TikTok API doesn't provide this info
          commerceHashtags: []
        }
      },
      error: "",
      success: true,
      quotaUsed: 2,
      timestamp: Date.now(),
      quotaUsedTotal: 2, // We don't track total quota usage
      remainingPlanCredit: 9999, // Placeholder
      remainingPrepurchasedCredit: 0
    };

    return {
      post_id: postId,
      platform: 'tiktok',
      content_id: tiktokMetrics.id,
      post_url: videoUrl,
      title: tiktokMetrics.text,
      likes_count: tiktokMetrics.diggCount,
      comments_count: tiktokMetrics.commentCount,
      views_count: tiktokMetrics.playCount,
      engagement_rate: engagementRate,
      platform_data: creatorDbFormat,
      quota_used: 2,
      api_timestamp: Date.now(),
      api_success: true,
      api_error: undefined,
      raw_response: creatorDbFormat,
      thumbnail_url: tiktokMetrics.videoMeta.coverUrl // 🖼️ Incluir thumbnail para actualizar el post
    };
  }
} 