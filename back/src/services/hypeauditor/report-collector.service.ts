import { createClient } from '@supabase/supabase-js';
import { config } from '../../config/environment';
import { HypeAuditorService } from './hypeauditor.service';
import {
  HypeAuditorAudienceReport,
  HypeAuditorReportCreateDTO,
  CollectionStats,
  BatchCollectionResult,
  InfluencerCollectionTarget,
} from '../../models/influencer/hypeauditor-audience-report.model';

const supabase = createClient(
  config.supabase.url || '',
  config.supabase.anonKey || '',
);

/**
 * ReportCollectorService
 *
 * Service for collecting and storing real HypeAuditor reports.
 * These reports are used for accurate audience demographic inference.
 */
export class ReportCollectorService {
  private hypeAuditorService: HypeAuditorService;

  constructor() {
    this.hypeAuditorService = HypeAuditorService.getInstance();
  }

  /**
   * Fetch and store a single HypeAuditor report
   *
   * @param username - Username or handle on the platform
   * @param platform - Social media platform (instagram, tiktok, youtube)
   * @param influencer_id - Optional internal influencer ID
   * @returns Stored report or null if failed
   */
  async collectAndStoreReport(
    username: string,
    platform: 'instagram' | 'tiktok' | 'youtube',
    influencer_id?: string,
  ): Promise<HypeAuditorAudienceReport | null> {
    try {
      console.log(
        `[ReportCollector] Fetching report for ${username} on ${platform}`,
      );

      // Fetch report from HypeAuditor API
      let report: any;
      if (platform === 'instagram') {
        report = await this.hypeAuditorService.getInstagramReport(username);
      } else if (platform === 'tiktok') {
        report = await this.hypeAuditorService.getTiktokReport(username);
      } else if (platform === 'youtube') {
        report = await this.hypeAuditorService.getYoutubeReport(username);
      }

      if (!report || !report.report_state || !report.report_state.startsWith('READY')) {
        console.error(
          `[ReportCollector] Report not ready for ${username} on ${platform} (state: ${report?.report_state || 'unknown'})`,
        );
        return null;
      }

      // Extract demographics from report
      const audienceDemographics = this.extractDemographics(report);
      const audienceGeography = this.extractGeography(report);

      // Extract matching characteristics
      const followerCount =
        report.followers_count || report.followers || report.stats?.followers || 0;
      const engagementRate =
        report.er_data?.er || report.er?.value || report.stats?.er || 0;
      const niche = report.blogger_categories?.[0] || null;
      const gender = report.blogger_gender || null;
      const location = report.location || null;
      const aqs = report.aqs || report.authenticity_score || 0;

      // Create report object
      const reportData: any = {
        influencer_username: username,
        platform,
        full_report: report,
        audience_demographics: audienceDemographics,
        audience_geography: audienceGeography,
        audience_interests: report.audience_interests || null,
        audience_languages: report.audience_languages || null,
        follower_count: followerCount,
        engagement_rate: engagementRate,
        influencer_niche: niche,
        influencer_gender: gender,
        influencer_location: location,
        report_quality: report._report_quality || 'FULL',
        authenticity_score: aqs,
        collected_at: new Date(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        api_cost: 1,
      };

      // Add influencer_id if provided
      if (influencer_id) {
        reportData.influencer_id = influencer_id;
      }

      // Store in database (upsert to handle duplicates)
      // First, check if a report already exists for this username + platform
      const { data: existing } = await supabase
        .from('hypeauditor_audience_reports')
        .select('id')
        .eq('influencer_username', username)
        .eq('platform', platform)
        .single();

      let data, error;

      if (existing) {
        // Update existing report
        const result = await supabase
          .from('hypeauditor_audience_reports')
          .update(reportData)
          .eq('id', existing.id)
          .select()
          .single();
        data = result.data;
        error = result.error;
        console.log(`♻️ [ReportCollector] Updated existing report for ${username} (${platform})`);
      } else {
        // Insert new report
        const result = await supabase
          .from('hypeauditor_audience_reports')
          .insert(reportData)
          .select()
          .single();
        data = result.data;
        error = result.error;
        console.log(`✅ [ReportCollector] Created new report for ${username} (${platform})`);
      }

      if (error) {
        console.error('[ReportCollector] Error storing report:', error);
        return null;
      }

      // Track API cost
      await this.trackApiCost(1);

      return data;
    } catch (error) {
      console.error(`[ReportCollector] Error collecting report for ${username}:`, error);
      return null;
    }
  }

  /**
   * Collect multiple reports in batch
   *
   * @param influencers - Array of influencers to collect reports for
   * @returns Batch collection results
   */
  async collectBatchReports(
    influencers: InfluencerCollectionTarget[],
  ): Promise<BatchCollectionResult> {
    const results: BatchCollectionResult = {
      success: 0,
      failed: 0,
      reports: [],
    };

    console.log(`[ReportCollector] Starting batch collection of ${influencers.length} reports`);

    for (const influencer of influencers) {
      const report = await this.collectAndStoreReport(
        influencer.username,
        influencer.platform,
        influencer.id,
      );

      if (report) {
        results.success++;
        results.reports.push(report);
      } else {
        results.failed++;
      }

      // Add delay to avoid rate limiting (2 seconds between reports)
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    console.log(
      `✅ [ReportCollector] Batch complete: ${results.success} success, ${results.failed} failed`,
    );

    return results;
  }

  /**
   * Get existing stored report
   *
   * @param influencer_id - Internal influencer ID
   * @param platform - Social media platform
   * @returns Stored report or null if not found/expired
   */
  async getStoredReport(
    influencer_id: string,
    platform: string,
  ): Promise<HypeAuditorAudienceReport | null> {
    const { data, error } = await supabase
      .from('hypeauditor_audience_reports')
      .select('*')
      .eq('influencer_id', influencer_id)
      .eq('platform', platform)
      .single();

    if (error || !data) {
      return null;
    }

    // Check if expired
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      console.log('[ReportCollector] Report expired, needs refresh');
      return null;
    }

    return data;
  }

  /**
   * Find similar reports for matching
   *
   * Searches for reports with similar characteristics:
   * - Follower count within ±50% range
   * - Same niche (if provided)
   * - Same platform (if provided)
   *
   * @param followerCount - Target follower count
   * @param niche - Target niche/category (optional)
   * @param platform - Target platform (optional)
   * @returns Array of similar reports (max 10)
   */
  async findSimilarReports(
    followerCount: number,
    niche?: string,
    platform?: string,
  ): Promise<HypeAuditorAudienceReport[]> {
    // First try with platform filter
    let query = supabase
      .from('hypeauditor_audience_reports')
      .select('*')
      .gte('follower_count', followerCount * 0.5) // ±50% range
      .lte('follower_count', followerCount * 2)
      .limit(10);

    if (niche) {
      query = query.eq('influencer_niche', niche);
    }

    if (platform) {
      query = query.eq('platform', platform);
    }

    let { data, error } = await query;

    // If no results and platform was specified, try without platform filter
    if ((!data || data.length === 0) && platform) {
      console.log(`[ReportCollector] No reports found for platform ${platform}, searching all platforms...`);
      query = supabase
        .from('hypeauditor_audience_reports')
        .select('*')
        .gte('follower_count', followerCount * 0.5)
        .lte('follower_count', followerCount * 2)
        .limit(10);

      if (niche) {
        query = query.eq('influencer_niche', niche);
      }

      const result = await query;
      data = result.data;
      error = result.error;
    }

    if (error || !data) {
      return [];
    }

    return data;
  }

  /**
   * Get collection statistics
   *
   * @returns Statistics about collected reports
   */
  async getCollectionStats(): Promise<CollectionStats> {
    const { data, error } = await supabase
      .from('hypeauditor_audience_reports')
      .select('platform, api_cost');

    if (error || !data) {
      return { total_reports: 0, by_platform: {}, total_cost: 0 };
    }

    const stats: CollectionStats = {
      total_reports: data.length,
      by_platform: {},
      total_cost: data.reduce((sum: number, r: any) => sum + (r.api_cost || 0), 0),
    };

    data.forEach((report: any) => {
      stats.by_platform[report.platform] =
        (stats.by_platform[report.platform] || 0) + 1;
    });

    return stats;
  }

  /**
   * Extract demographics from HypeAuditor report
   *
   * @param report - Raw HypeAuditor report
   * @returns Normalized demographics object
   */
  private extractDemographics(report: any): {
    age: { [ageRange: string]: number };
    gender: { male: number; female: number };
  } {
    const demographics = report.audience_demographics || {};

    // Extract age distribution
    const age: { [key: string]: number } = {};
    if (demographics.age) {
      for (const [range, value] of Object.entries(demographics.age)) {
        age[range] = (value as number) * 100; // Convert to percentage
      }
    }

    // Extract gender distribution
    const gender = {
      male: (demographics.gender?.male || 0) * 100,
      female: (demographics.gender?.female || 0) * 100,
    };

    return { age, gender };
  }

  /**
   * Extract geography from HypeAuditor report
   *
   * @param report - Raw HypeAuditor report
   * @returns Country distribution object
   */
  private extractGeography(report: any): { [country: string]: number } {
    const geography: { [country: string]: number } = {};
    const audienceLocation = report.audience_location || {};

    for (const [country, value] of Object.entries(audienceLocation)) {
      geography[country] = (value as number) * 100; // Convert to percentage
    }

    return geography;
  }

  /**
   * Track API cost in organization
   *
   * @param cost - Number of queries used
   */
  private async trackApiCost(cost: number): Promise<void> {
    // TODO: Implement organization-level tracking
    // For now, just log the cost
    console.log(`[ReportCollector] API cost tracked: ${cost} query used`);
  }
}
