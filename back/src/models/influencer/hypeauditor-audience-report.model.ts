/**
 * HypeAuditor Audience Report Model
 *
 * This model represents real HypeAuditor audience reports stored in the database.
 * These reports are used for accurate audience demographic inference instead of
 * pure synthetic templates.
 */

export interface HypeAuditorAudienceReport {
  id: string;

  // Influencer Reference
  influencer_id?: string;
  influencer_username: string;
  platform: 'instagram' | 'tiktok' | 'youtube';

  // Complete raw report from HypeAuditor API
  full_report: any;

  // Extracted & indexed demographics
  audience_demographics: {
    age: { [ageRange: string]: number };
    gender: { male: number; female: number };
  };

  audience_geography: { [country: string]: number };
  audience_interests?: Array<[string, number]>;
  audience_languages?: Array<{ code: string; value: number }>;

  // Influencer characteristics (for matching similar influencers)
  follower_count: number;
  engagement_rate: number;
  influencer_niche?: string;
  influencer_gender?: string;
  influencer_location?: string;

  // Metadata
  report_quality: string;
  authenticity_score: number;
  collected_at: Date;
  expires_at?: Date;
  api_cost: number;

  created_at?: Date;
  updated_at?: Date;
}

/**
 * DTO for creating a new HypeAuditor report
 */
export interface HypeAuditorReportCreateDTO {
  influencer_id?: string;
  influencer_username: string;
  platform: 'instagram' | 'tiktok' | 'youtube';
  full_report: any;
}

/**
 * Collection statistics response
 */
export interface CollectionStats {
  total_reports: number;
  by_platform: { [platform: string]: number };
  total_cost: number;
}

/**
 * Batch collection result
 */
export interface BatchCollectionResult {
  success: number;
  failed: number;
  reports: HypeAuditorAudienceReport[];
}

/**
 * Influencer for batch collection
 */
export interface InfluencerCollectionTarget {
  username: string;
  platform: 'instagram' | 'tiktok' | 'youtube';
  id?: string;
}
