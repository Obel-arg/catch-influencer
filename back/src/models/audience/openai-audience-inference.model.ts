/**
 * OpenAI Audience Inference Models
 *
 * Type definitions for OpenAI-based Instagram audience demographics inference.
 * This module provides interfaces for the inference process, caching, and data structures.
 */

/**
 * Instagram profile data extracted from scraping
 */
export interface InstagramProfileData {
  username: string;
  url: string;
  bio: string;
  followerCount: number;
  followingCount: number;
  postCount: number;
  isVerified: boolean;
  category?: string;
  primaryLanguage?: string;
  secondaryLanguages?: string[];
  avgEngagementRate?: number;
  postingTimePattern?: string;
  recentPosts: InstagramPost[];
  topHashtags?: string[];
}

/**
 * Instagram post data
 */
export interface InstagramPost {
  id: string;
  caption?: string;
  likesCount: number;
  commentsCount: number;
  hashtags: string[];
  timestamp: Date;
  isVideo: boolean;
  mentions?: string[];
}

/**
 * Audience demographics structure (matches existing format)
 */
export interface AudienceDemographics {
  age: {
    "13-17": number;
    "18-24": number;
    "25-34": number;
    "35-44": number;
    "45-54": number;
    "55+": number;
  };
  gender: {
    male: number;
    female: number;
  };
  geography: Array<{
    country: string;
    country_code: string;
    percentage: number;
  }>;
  is_synthetic: boolean; // Always false for OpenAI inferences
}

/**
 * Extended audience demographics with metadata
 */
export interface AudienceDemographicsExtended extends AudienceDemographics {
  inference_source: string;
  model_used: string;
  confidence_score?: number;
  inferred_at: Date;
}

/**
 * OpenAI API response structure
 */
export interface OpenAIInferenceResponse {
  age: {
    "13-17": number;
    "18-24": number;
    "25-34": number;
    "35-44": number;
    "45-54": number;
    "55+": number;
  };
  gender: {
    male: number;
    female: number;
  };
  geography: Array<{
    country: string;
    country_code: string;
    percentage: number;
  }>;
}

/**
 * Cache entry structure
 */
export interface CacheEntry {
  url: string;
  username: string;
  demographics: AudienceDemographics;
  model: string;
  cached_at: string; // ISO 8601 date string
  expires_at: string; // ISO 8601 date string
  api_cost: number;
  profile_snapshot?: Partial<InstagramProfileData>;
}

/**
 * Cache file structure
 */
export interface CacheFile {
  version: string;
  entries: {
    [cacheKey: string]: CacheEntry;
  };
}

/**
 * Inference result (success or error)
 */
export interface InferenceResult {
  success: boolean;
  demographics?: AudienceDemographicsExtended;
  description?: string; // AI-generated description for PDF export
  error?: string;
  cached?: boolean;
  cost?: number;
  details?: any;
}

/**
 * Cache statistics
 */
export interface CacheStats {
  totalEntries: number;
  totalCost: number;
  oldestEntry?: Date;
  newestEntry?: Date;
  averageCost: number;
  expirationBreakdown: {
    valid: number;
    expired: number;
  };
}

/**
 * Cost tracking entry
 */
export interface CostEntry {
  timestamp: Date;
  operation: string;
  cost: number;
  url?: string;
  model: string;
  success: boolean;
}

/**
 * Search context from Explorer UI
 * Used to provide additional context for OpenAI inference
 */
export interface SearchContext {
  creator_location?: string; // Country code (e.g., "AR", "MX")
  target_audience_geo?: {
    countries?: Array<{ id: string; prc: number }>;
    cities?: Array<{ id: number; prc: number }>;
  };
}

/**
 * Inference options
 */
export interface InferenceOptions {
  dryRun?: boolean; // Test scraping without calling OpenAI
  forceRefresh?: boolean; // Bypass cache and force new inference
  skipCache?: boolean; // Don't read from or write to cache
  mockMode?: boolean; // Use mock OpenAI responses
  maxRetries?: number; // Max retry attempts for failures
  timeout?: number; // Timeout in milliseconds
  influencerId?: string; // Influencer ID for database caching
  searchContext?: SearchContext; // Search context from Explorer UI
  skipGeneration?: boolean; // Only check cache, don't generate if not found
  platform?: SupportedPlatform; // Social media platform for multi-platform support
}

/**
 * Batch inference request
 */
export interface BatchInferenceRequest {
  urls: string[];
  delay?: number; // Delay between requests in milliseconds
  options?: InferenceOptions;
}

/**
 * Batch inference result
 */
export interface BatchInferenceResult {
  total: number;
  successful: number;
  failed: number;
  cached: number;
  totalCost: number;
  results: Array<{
    url: string;
    result: InferenceResult;
  }>;
}

/**
 * Validation error details
 */
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  normalized?: AudienceDemographics;
}

/**
 * Database record for OpenAI audience inference
 */
export interface OpenAIAudienceInferenceDB {
  id: string;
  influencer_id?: string;
  instagram_url: string;
  instagram_username: string;
  audience_demographics: AudienceDemographics;
  audience_geography: any; // Same as demographics.geography
  model_used: string;
  profile_data_snapshot?: Partial<InstagramProfileData>;
  // Search context fields (added in migration 20251208)
  search_context?: SearchContext;
  creator_location?: string;
  target_audience_geo?: any;
  // Timestamps
  inferred_at: Date;
  expires_at: Date;
  api_cost: number;
  created_at: Date;
  updated_at: Date;
}

/**
 * Supported social media platforms for audience inference
 */
export type SupportedPlatform =
  | "instagram"
  | "youtube"
  | "tiktok"
  | "twitter"
  | "twitch"
  | "threads"
  | "general"; // General unified inference combining all platforms

/**
 * Agentic Audience Inference Database Interface
 * Multi-platform support for agentic AI analysis
 */
export interface AgenticAudienceInferenceDB {
  id: string;
  influencer_id?: string;
  url: string; // Platform-agnostic URL (renamed from instagram_url)
  username: string; // Platform-agnostic username (renamed from instagram_username)
  platform: SupportedPlatform; // Social media platform
  audience_demographics: AudienceDemographics;
  audience_geography: any; // Same as demographics.geography
  model_used: string;
  profile_data_snapshot?: Partial<InstagramProfileData>;
  // Search context fields
  search_context?: SearchContext;
  creator_location?: string;
  target_audience_geo?: any;
  // Description for PDF export
  description?: string;
  // Timestamps
  inferred_at: Date;
  expires_at: Date;
  api_cost: number;
  created_at: Date;
  updated_at: Date;
}
