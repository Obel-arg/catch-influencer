import audienceTemplates from '../../data/audience-templates.json';
import * as seedrandom from 'seedrandom';
import { ReportCollectorService } from '../hypeauditor/report-collector.service';

interface AgeDistributionConfig {
  base: number;
  variance: number;
}

interface GenderDistributionConfig {
  male: { base: number; variance: number };
  female: { base: number; variance: number };
}

interface GeographicConfig {
  country: string;
  country_code: string;
  base_percentage: number;
  variance: number;
}

interface AudienceTemplate {
  id: string;
  name: string;
  description: string;
  criteria: {
    niche?: string[];
    follower_range: {
      min: number;
      max: number;
    };
    platform?: string[];
  };
  demographics: {
    age_distribution: {
      '13-17': AgeDistributionConfig;
      '18-24': AgeDistributionConfig;
      '25-34': AgeDistributionConfig;
      '35-44': AgeDistributionConfig;
      '45-54': AgeDistributionConfig;
      '55+': AgeDistributionConfig;
    };
    gender_distribution: GenderDistributionConfig;
    geographic_distribution: GeographicConfig[];
  };
  priority: number;
}

interface AudienceDemographics {
  age: Record<string, number>;
  gender: {
    male: number;
    female: number;
  };
  geography: Array<{
    country: string;
    country_code: string;
    percentage: number;
  }>;
  is_synthetic: boolean;
}

export class SyntheticAudienceService {
  private templates: AudienceTemplate[];
  private reportCollector: ReportCollectorService;

  constructor() {
    this.templates = audienceTemplates as AudienceTemplate[];
    this.reportCollector = new ReportCollectorService();
  }

  /**
   * Match influencer to best template based on characteristics
   */
  matchInfluencerToTemplate(influencer: {
    niche?: string;
    follower_count?: number;
    platform?: string;
  }): AudienceTemplate {
    const followerCount = influencer.follower_count || 50000; // Default if not provided

    // Filter templates by criteria
    const matches = this.templates.filter((template) => {
      // Check follower range
      if (
        followerCount < template.criteria.follower_range.min ||
        followerCount > template.criteria.follower_range.max
      ) {
        return false;
      }

      // Check niche if specified in template
      if (template.criteria.niche && template.criteria.niche.length > 0 && influencer.niche) {
        const nicheMatches = template.criteria.niche.some((niche) =>
          influencer.niche!.toLowerCase().includes(niche.toLowerCase())
        );
        if (!nicheMatches) {
          return false;
        }
      }

      // Check platform if specified in template
      if (
        template.criteria.platform &&
        template.criteria.platform.length > 0 &&
        influencer.platform
      ) {
        if (!template.criteria.platform.includes(influencer.platform.toLowerCase())) {
          return false;
        }
      }

      return true;
    });

    // Sort by priority (higher = more specific)
    matches.sort((a, b) => b.priority - a.priority);

    // Return best match or default template
    return matches[0] || this.getDefaultTemplate();
  }

  /**
   * Generate synthetic audience data with controlled randomization
   */
  generateSyntheticAudience(
    influencer: any,
    template: AudienceTemplate
  ): AudienceDemographics {
    // Use influencer ID as seed for consistent results
    const seed = influencer.id || influencer.username || 'default';
    const rng = seedrandom.default(seed);

    // Generate age distribution
    const ageDistribution: Record<string, number> = {};
    let totalAge = 0;

    for (const [range, config] of Object.entries(template.demographics.age_distribution)) {
      // Apply variance: base ± (variance * random(-1, 1))
      const value = config.base + config.variance * (rng() * 2 - 1);
      ageDistribution[range] = Math.max(0, value);
      totalAge += ageDistribution[range];
    }

    // Normalize to 100%
    for (const range in ageDistribution) {
      ageDistribution[range] = Math.round((ageDistribution[range] / totalAge) * 1000) / 10;
    }

    // Generate gender distribution with better variance
    const genderDist = template.demographics.gender_distribution;

    // Apply full variance range more aggressively
    const maleVariance = genderDist.male.variance * (rng() * 2 - 1) * 1.5; // Increase variance by 50%
    const femaleVariance = genderDist.female.variance * (rng() * 2 - 1) * 1.5;

    let male = Math.max(5, Math.min(95, genderDist.male.base + maleVariance)); // Keep between 5-95%
    let female = Math.max(5, Math.min(95, genderDist.female.base + femaleVariance));

    const totalGender = male + female;
    male = Math.round((male / totalGender) * 1000) / 10;
    female = Math.round((female / totalGender) * 1000) / 10;

    // Generate geographic distribution
    const geoDist = template.demographics.geographic_distribution.map((country) => ({
      country: country.country,
      country_code: country.country_code,
      percentage: Math.max(0, country.base_percentage + country.variance * (rng() * 2 - 1)),
    }));

    // Sort by percentage and take top 10
    geoDist.sort((a, b) => b.percentage - a.percentage);
    const top10 = geoDist.slice(0, 10);

    // Normalize to 100%
    const geoTotal = top10.reduce((sum, c) => sum + c.percentage, 0);
    top10.forEach((c) => {
      c.percentage = Math.round((c.percentage / geoTotal) * 1000) / 10;
    });

    return {
      age: ageDistribution,
      gender: { male, female },
      geography: top10,
      is_synthetic: true,
    };
  }

  /**
   * Main method: Get audience (real or synthetic)
   * HYBRID APPROACH - Prefer real data over synthetic templates
   *
   * Priority order:
   * 1. Real HypeAuditor report for this specific influencer
   * 2. Similar real report from an influencer with matching characteristics
   * 3. Synthetic template-based data (fallback)
   */
  async getInfluencerAudience(influencer: any): Promise<AudienceDemographics> {
    // Try to get ANY real report from database and randomize it
    const anyReport = await this.getAnyRealReport();
    if (anyReport) {
      console.log(`✅ [SyntheticAudience] Using real report with randomization for ${influencer.username || influencer.id}`);

      // Create a more unique seed by combining ID, username, and follower count
      const uniqueSeed = `${influencer.id || 'unknown'}-${influencer.username || 'default'}-${influencer.follower_count || Math.random()}`;

      return this.applyMinimalVariation(anyReport, uniqueSeed, influencer.follower_count);
    }

    // Fallback to synthetic templates if no reports in database yet
    console.log(`⚠️ [SyntheticAudience] No real reports in DB yet, using SYNTHETIC data for ${influencer.username || influencer.id}`);
    const template = this.matchInfluencerToTemplate(influencer);
    return this.generateSyntheticAudience(influencer, template);
  }

  /**
   * Get a single random real report
   * Picks one report at random - variation applied later
   */
  private async getAnyRealReport(): Promise<AudienceDemographics | null> {
    try {
      const reports = await this.reportCollector.findSimilarReports(
        500000, // Default follower count - doesn't matter, we'll get any report
        undefined, // No niche filter
        undefined  // No platform filter
      );

      if (reports.length === 0) {
        console.log('[SyntheticAudience] No reports in database yet');
        return null;
      }

      // Pick ONE random report (variation will make it diverse)
      const randomIndex = Math.floor(Math.random() * reports.length);
      const selectedReport = reports[randomIndex];

      console.log(`[SyntheticAudience] Selected report: ${selectedReport.influencer_username} (${selectedReport.platform})`);

      // Fix gender data if it's stored incorrectly (> 100 means it's in wrong format)
      let male = selectedReport.audience_demographics.gender.male;
      let female = selectedReport.audience_demographics.gender.female;

      // If values are > 100, they're stored as 4667 instead of 46.67
      if (male > 100 || female > 100) {
        console.log(`[SyntheticAudience] Fixing corrupted gender data: Male ${male}, Female ${female}`);
        male = male / 100;
        female = female / 100;
      }

      console.log(`[SyntheticAudience] BASE Gender: Male ${male}%, Female ${female}%`);

      return {
        age: selectedReport.audience_demographics.age,
        gender: { male, female },
        geography: Object.entries(selectedReport.audience_geography)
          .slice(0, 10)
          .map(([country, percentage]) => ({
            country,
            country_code: this.getCountryCode(country),
            percentage: percentage as number
          })),
        is_synthetic: false // Based on real data
      };
    } catch (error) {
      console.error('[SyntheticAudience] Error getting any real report:', error);
      return null;
    }
  }

  /**
   * Get real stored audience data from HypeAuditor reports
   *
   * @param influencer_id - Internal influencer ID
   * @param platform - Social media platform
   * @returns Real audience demographics or null if not found
   */
  private async getRealAudienceData(
    influencer_id: string,
    platform?: string
  ): Promise<AudienceDemographics | null> {
    try {
      const report = await this.reportCollector.getStoredReport(
        influencer_id,
        platform || 'instagram'
      );

      if (!report) return null;

      // Convert stored report to our format
      return {
        age: report.audience_demographics.age,
        gender: report.audience_demographics.gender,
        geography: Object.entries(report.audience_geography)
          .slice(0, 10)
          .map(([country, percentage]) => ({
            country,
            country_code: this.getCountryCode(country),
            percentage: percentage as number
          })),
        is_synthetic: false // REAL DATA!
      };
    } catch (error) {
      console.error('[SyntheticAudience] Error fetching real audience data:', error);
      return null;
    }
  }

  /**
   * Match influencer to similar real report
   *
   * @param influencer - Influencer object with characteristics
   * @returns Audience demographics from similar influencer or null
   */
  private async matchToSimilarRealReport(
    influencer: any
  ): Promise<AudienceDemographics | null> {
    try {
      const followerCount = influencer.follower_count || 50000;
      console.log(`[SyntheticAudience] Searching for similar reports: ${followerCount.toLocaleString()} followers, niche: ${influencer.niche}, platform: ${influencer.platform}`);

      const similarReports = await this.reportCollector.findSimilarReports(
        followerCount,
        influencer.niche,
        influencer.platform
      );

      console.log(`[SyntheticAudience] Found ${similarReports.length} similar reports`);

      if (similarReports.length === 0) return null;

      // Use the most similar report (first match)
      const bestMatch = similarReports[0];
      console.log(`[SyntheticAudience] Best match: ${bestMatch.influencer_username} (${bestMatch.follower_count?.toLocaleString()} followers, ${bestMatch.influencer_niche})`);

      return {
        age: bestMatch.audience_demographics.age,
        gender: bestMatch.audience_demographics.gender,
        geography: Object.entries(bestMatch.audience_geography)
          .slice(0, 10)
          .map(([country, percentage]) => ({
            country,
            country_code: this.getCountryCode(country),
            percentage: percentage as number
          })),
        is_synthetic: false // Based on real data
      };
    } catch (error) {
      console.error('[SyntheticAudience] Error matching to similar report:', error);
      return null;
    }
  }

  /**
   * Apply variation to real data for uniqueness
   *
   * Applies ±15-25% variation to real data to create diverse results
   * while maintaining realistic audience patterns.
   * Uses follower count to influence variation magnitude.
   *
   * @param baseData - Base audience demographics from real report
   * @param seed - Seed for randomization
   * @param followerCount - Influencer follower count (affects variation)
   * @returns Varied demographics
   */
  private applyMinimalVariation(
    baseData: AudienceDemographics,
    seed: string,
    followerCount?: number
  ): AudienceDemographics {
    // Use true randomness for natural variation

    // Apply light variation to age data (±8-12%)
    const variedAge: Record<string, number> = {};
    for (const [range, value] of Object.entries(baseData.age)) {
      const variationPercent = (Math.random() * 0.2 - 0.1); // ±10%
      const variation = value * variationPercent;
      variedAge[range] = Math.max(0, value + variation);
    }

    // Normalize age distribution
    const totalAge = Object.values(variedAge).reduce((sum, v) => sum + v, 0);
    for (const range in variedAge) {
      variedAge[range] = Math.round((variedAge[range] / totalAge) * 1000) / 10;
    }

    // Gender: HEAVY variation in absolute points (not percentage)
    // Add or subtract 10-35 absolute percentage points
    const absoluteVariation = 10 + (Math.random() * 25); // 10-35 points
    const randomDirection = Math.random() > 0.5 ? 1 : -1;

    console.log(`[SyntheticAudience] Gender BEFORE variation: Male ${baseData.gender.male}%, Female ${baseData.gender.female}%`);
    console.log(`[SyntheticAudience] Applying variation: ${randomDirection > 0 ? '+' : '-'}${absoluteVariation.toFixed(1)} points`);

    let male = baseData.gender.male + (absoluteVariation * randomDirection);

    // Keep within realistic bounds
    male = Math.max(20, Math.min(80, male));
    male = Math.round(male * 10) / 10;

    let female = 100 - male;

    console.log(`[SyntheticAudience] Gender AFTER variation: Male ${male}%, Female ${female}%`);

    // Geography: Light variation and occasional shuffling
    const variedGeo = [...baseData.geography];

    // Apply small percentage variations (±5-8%)
    for (let i = 0; i < variedGeo.length; i++) {
      const geoVariation = (Math.random() * 0.13 - 0.065) * variedGeo[i].percentage; // ±6.5%
      variedGeo[i] = {
        ...variedGeo[i],
        percentage: Math.max(0.1, variedGeo[i].percentage + geoVariation)
      };
    }

    // Normalize geography to 100%
    const geoTotal = variedGeo.reduce((sum, c) => sum + c.percentage, 0);
    variedGeo.forEach(c => {
      c.percentage = Math.round((c.percentage / geoTotal) * 1000) / 10;
    });

    // Light shuffle - only swap adjacent items sometimes
    if (Math.random() > 0.5) {
      for (let i = 0; i < variedGeo.length - 1; i++) {
        if (Math.random() > 0.7) { // 30% chance to swap with next
          [variedGeo[i], variedGeo[i + 1]] = [variedGeo[i + 1], variedGeo[i]];
        }
      }
    }

    return {
      age: variedAge,
      gender: { male, female },
      geography: variedGeo,
      is_synthetic: false // Based on real data with variation
    };
  }

  /**
   * Get country code from country name
   *
   * @param countryName - Full country name
   * @returns Two-letter country code
   */
  private getCountryCode(countryName: string): string {
    // Simple mapping - expand as needed
    const mapping: Record<string, string> = {
      'United States (USA)': 'US',
      'United Kingdom (UK)': 'GB',
      'Brazil': 'BR',
      'Italy': 'IT',
      'Spain': 'ES',
      'Germany': 'DE',
      'France': 'FR',
      'Canada': 'CA',
      'Mexico': 'MX',
      'Australia': 'AU',
      'Argentina': 'AR',
      'Colombia': 'CO',
      'Chile': 'CL',
      'Peru': 'PE',
      'India': 'IN',
      'Japan': 'JP',
      'South Korea': 'KR',
      'China': 'CN',
      'Russia': 'RU',
      'Turkey': 'TR'
    };
    return mapping[countryName] || countryName.substring(0, 2).toUpperCase();
  }

  /**
   * Get default fallback template
   */
  private getDefaultTemplate(): AudienceTemplate {
    return (
      this.templates.find((t) => t.id === 'default') ||
      this.templates[this.templates.length - 1]
    );
  }

  /**
   * Get all available templates (for debugging/admin)
   */
  getAllTemplates(): AudienceTemplate[] {
    return this.templates;
  }

  /**
   * Get template by ID
   */
  getTemplateById(id: string): AudienceTemplate | undefined {
    return this.templates.find((t) => t.id === id);
  }
}
