import supabase from '../../config/supabase';
import { InfluencerYoutubeService, YoutubeBasic } from './influencer.youtube.service';
import { InfluencerInstagramService, InstagramBasic } from './influencer.instagram.service';
import { InfluencerTiktokService, TiktokBasic } from './influencer.tiktok.service';

export class InfluencerCacheService {
  async cacheInfluencerData(fullData: any) {
    try {
      const {
        creatorId,
        name,
        avatar,
        country,
        language,
        socialPlatforms,
        mainSocialPlatform,
        followersCount,
        contentTopics,
        contentNiches,
        averageEngagementRate,
        isVerified,
        platformInfo
      } = fullData;

      const { data: cachedInfluencer, error } = await supabase
        .from('influencers')
        .upsert({
          creator_id: creatorId,
          name,
          profile_image_url: avatar,
          location: country,
          languages: language ? [language] : [],
          main_social_platform: mainSocialPlatform,
          followers_count: followersCount,
          average_engagement_rate: averageEngagementRate,
          content_topics: contentTopics,
          content_niches: contentNiches,
          social_platforms: socialPlatforms,
          platform_info: platformInfo,
          metrics: {
            engagement_rates: {
              average: averageEngagementRate
            }
          },
          created_by: '00000000-0000-0000-0000-000000000000', // Usuario del sistema
          status: 'active',
          updated_at: new Date()
        }, {
          onConflict: 'creator_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Error caching influencer data:', error);
        return null;
      }
      return cachedInfluencer;
    } catch (error) {
      console.error('Error caching influencer data:', error);
      return null; // Retornamos null en lugar de lanzar error
    }
  }

  async getCachedInfluencer(creatorId: string) {
    try {
      const { data: cachedInfluencer, error } = await supabase
        .from('influencers')
        .select('*')
        .eq('creator_id', creatorId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No rows found
        console.error('Error getting cached influencer:', error);
        return null;
      }
      return cachedInfluencer;
    } catch (error) {
      console.error('Error getting cached influencer:', error);
      return null; // Retornamos null en lugar de lanzar error
    }
  }

  async isCacheValid(creatorId: string): Promise<boolean> {
    try {
      const cachedData = await this.getCachedInfluencer(creatorId);
      if (!cachedData) return false;

      const cacheAge = new Date().getTime() - new Date(cachedData.updated_at).getTime();
      const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 horas en milisegundos
      
      return cacheAge < CACHE_TTL;
    } catch {
      return false;
    }
  }

  transformCacheToFullData(cachedData: any) {
    if (!cachedData) return null;
    
    return {
      creatorId: cachedData.creator_id,
      name: cachedData.name,
      avatar: cachedData.profile_image_url,
      country: cachedData.location,
      language: cachedData.languages?.[0],
      socialPlatforms: cachedData.social_platforms,
      mainSocialPlatform: cachedData.main_social_platform,
      followersCount: cachedData.followers_count,
      contentTopics: cachedData.content_topics,
      contentNiches: cachedData.content_niches,
      averageEngagementRate: cachedData.average_engagement_rate,
      isVerified: cachedData.is_verified,
      platformInfo: cachedData.platform_info,
    };
  }
} 