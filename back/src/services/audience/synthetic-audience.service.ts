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

/**
 * Seeded Random Number Generator
 * Uses Linear Congruential Generator (LCG) for deterministic randomness
 * This ensures the same seed always produces the same sequence of random numbers
 */
class SeededRandom {
  private seed: number;

  constructor(seed: string) {
    // Convert string to number seed using simple hash
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    this.seed = Math.abs(hash);
  }

  /**
   * Generate next random number between 0-1 (deterministic)
   * Uses Linear Congruential Generator formula
   */
  next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
    return this.seed / 4294967296;
  }

  /**
   * Generate random integer between min (inclusive) and max (exclusive)
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min)) + min;
  }

  /**
   * Generate random number with normal distribution (for variation)
   * Uses Box-Muller transform
   */
  nextGaussian(mean: number = 0, stdDev: number = 1): number {
    const u1 = this.next();
    const u2 = this.next();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return z0 * stdDev + mean;
  }
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
   * Create unique, consistent fingerprint for an influencer
   * This ensures the same influencer always maps to the same report
   */
  private createInfluencerFingerprint(influencer: any): string {
    const id = influencer.id || 'unknown';
    const username = (influencer.username || '').toLowerCase().replace(/\s+/g, '');
    const followerCount = Math.floor((influencer.follower_count || 0) / 1000); // Bucket by 1k
    const platform = influencer.platform || 'instagram';

    // Combine into stable fingerprint
    return `${id}-${username}-${followerCount}-${platform}`;
  }

  /**
   * Check if two categories/niches are similar
   */
  private areSimilarCategories(niche1: string, niche2: string): boolean {
    const categoryGroups = [
      ['fashion', 'beauty', 'lifestyle', 'style'],
      ['gaming', 'tech', 'technology', 'esports'],
      ['fitness', 'sports', 'health', 'wellness'],
      ['food', 'cooking', 'culinary', 'recipe'],
      ['travel', 'adventure', 'photography'],
      ['music', 'entertainment', 'comedy'],
      ['education', 'science', 'learning']
    ];

    for (const group of categoryGroups) {
      const in1 = group.some(cat => niche1.includes(cat));
      const in2 = group.some(cat => niche2.includes(cat));
      if (in1 && in2) return true;
    }

    return false;
  }

  /**
   * Extract country and region from location string
   * Examples:
   *   "Argentina" → {country: "argentina", region: "latin_america"}
   *   "United States (USA)" → {country: "united_states", region: "north_america"}
   *   "Argentina, Buenos Aires" → {country: "argentina", region: "latin_america"}
   */
  private extractRegion(location: string): { country: string; region: string } {
    const loc = location.toLowerCase();

    // Latin America
    if (loc.includes('argentina') || loc.includes('argentine')) {
      return { country: 'argentina', region: 'latin_america' };
    }
    if (loc.includes('mexico') || loc.includes('mexican')) {
      return { country: 'mexico', region: 'latin_america' };
    }
    if (loc.includes('colombia') || loc.includes('colombian')) {
      return { country: 'colombia', region: 'latin_america' };
    }
    if (loc.includes('chile') || loc.includes('chilean')) {
      return { country: 'chile', region: 'latin_america' };
    }
    if (loc.includes('peru') || loc.includes('peruvian')) {
      return { country: 'peru', region: 'latin_america' };
    }
    if (loc.includes('brazil') || loc.includes('brazilian')) {
      return { country: 'brazil', region: 'latin_america' };
    }
    if (loc.includes('uruguay') || loc.includes('uruguayan')) {
      return { country: 'uruguay', region: 'latin_america' };
    }
    if (loc.includes('paraguay') || loc.includes('paraguayan')) {
      return { country: 'paraguay', region: 'latin_america' };
    }
    if (loc.includes('venezuela') || loc.includes('venezuelan')) {
      return { country: 'venezuela', region: 'latin_america' };
    }
    if (loc.includes('ecuador') || loc.includes('ecuadorian')) {
      return { country: 'ecuador', region: 'latin_america' };
    }
    if (loc.includes('bolivia') || loc.includes('bolivian')) {
      return { country: 'bolivia', region: 'latin_america' };
    }

    // North America
    if (loc.includes('united states') || loc.includes('usa') || loc.includes('us,')) {
      return { country: 'united_states', region: 'north_america' };
    }
    if (loc.includes('canada') || loc.includes('canadian')) {
      return { country: 'canada', region: 'north_america' };
    }

    // Europe
    if (loc.includes('spain') || loc.includes('spanish') || loc.includes('españa')) {
      return { country: 'spain', region: 'europe' };
    }
    if (loc.includes('united kingdom') || loc.includes('uk') || loc.includes('england') || loc.includes('britain')) {
      return { country: 'united_kingdom', region: 'europe' };
    }
    if (loc.includes('france') || loc.includes('french')) {
      return { country: 'france', region: 'europe' };
    }
    if (loc.includes('germany') || loc.includes('german')) {
      return { country: 'germany', region: 'europe' };
    }
    if (loc.includes('italy') || loc.includes('italian')) {
      return { country: 'italy', region: 'europe' };
    }
    if (loc.includes('ireland') || loc.includes('irish')) {
      return { country: 'ireland', region: 'europe' };
    }
    if (loc.includes('portugal') || loc.includes('portuguese')) {
      return { country: 'portugal', region: 'europe' };
    }
    if (loc.includes('croatia') || loc.includes('croatian')) {
      return { country: 'croatia', region: 'europe' };
    }

    // Asia
    if (loc.includes('india') || loc.includes('indian')) {
      return { country: 'india', region: 'asia' };
    }
    if (loc.includes('philippines') || loc.includes('filipino')) {
      return { country: 'philippines', region: 'asia' };
    }
    if (loc.includes('japan') || loc.includes('japanese')) {
      return { country: 'japan', region: 'asia' };
    }
    if (loc.includes('china') || loc.includes('chinese')) {
      return { country: 'china', region: 'asia' };
    }
    if (loc.includes('korea') || loc.includes('korean')) {
      return { country: 'korea', region: 'asia' };
    }

    // Default unknown
    return { country: 'unknown', region: 'unknown' };
  }

  /**
   * Check if two regions are culturally/linguistically similar
   * Used for partial region matching
   */
  private areSimilarRegions(region1: string, region2: string): boolean {
    // Latin America and Spain share language/culture
    if ((region1 === 'latin_america' && region2 === 'europe') ||
        (region1 === 'europe' && region2 === 'latin_america')) {
      return true;
    }

    // North America regions are somewhat similar
    if ((region1 === 'north_america' && region2 === 'europe') ||
        (region1 === 'europe' && region2 === 'north_america')) {
      return true;
    }

    return false;
  }

  /**
   * Calculate similarity score between influencer and report
   * Returns score from 0 (no match) to 100 (perfect match)
   */
  private calculateSimilarityScore(
    influencer: any,
    report: any
  ): number {
    let score = 0;

    // 1. GEOGRAPHY/REGION MATCH (50 points max) - MOST IMPORTANT!
    // This ensures Argentine influencers get matched to Argentine/Latin reports
    const influencerLocation = (influencer.location || '').toLowerCase();
    const reportLocation = (report.influencer_location || '').toLowerCase();

    if (influencerLocation && reportLocation) {
      // Extract country/region from location strings
      const influencerRegion = this.extractRegion(influencerLocation);
      const reportRegion = this.extractRegion(reportLocation);

      // Exact country match
      if (influencerRegion.country === reportRegion.country) {
        score += 50;
      }
      // Same region (e.g., both Latin America)
      else if (influencerRegion.region === reportRegion.region) {
        score += 35;
      }
      // Different region but similar language/culture
      else if (this.areSimilarRegions(influencerRegion.region, reportRegion.region)) {
        score += 15;
      }
    } else {
      // If location unknown, give minimal points
      score += 5;
    }

    // 2. Follower Count Similarity (25 points max)
    const influencerFollowers = influencer.follower_count || 0;
    const reportFollowers = report.follower_count || 0;

    if (influencerFollowers > 0 && reportFollowers > 0) {
      const ratio = Math.min(influencerFollowers, reportFollowers) /
                    Math.max(influencerFollowers, reportFollowers);
      const followerScore = ratio * 25;
      score += followerScore;
    }

    // 3. Platform Match (15 points)
    if (influencer.platform === report.platform) {
      score += 15;
    } else if (
      (influencer.platform === 'instagram' && report.platform === 'tiktok') ||
      (influencer.platform === 'tiktok' && report.platform === 'instagram')
    ) {
      score += 8;
    }

    // 4. Niche/Category Match (10 points)
    const influencerNiche = (influencer.niche || '').toLowerCase();
    const reportNiche = (report.influencer_niche || '').toLowerCase();

    if (influencerNiche && reportNiche) {
      if (influencerNiche === reportNiche) {
        score += 10;
      } else if (influencerNiche.includes(reportNiche) || reportNiche.includes(influencerNiche)) {
        score += 7;
      } else if (this.areSimilarCategories(influencerNiche, reportNiche)) {
        score += 5;
      }
    } else {
      score += 3;
    }

    return Math.min(100, score);
  }

  /**
   * Main method: Get audience (real or synthetic)
   * UPDATED: Now uses deterministic matching algorithm
   *
   * Priority order:
   * 1. Matched real report using similarity scoring (deterministic)
   * 2. Synthetic template-based data (fallback if no reports in DB)
   */
  async getInfluencerAudience(influencer: any): Promise<AudienceDemographics> {
    try {
      // Try to get MATCHED report using deterministic algorithm
      const matchedReport = await this.getMatchedReport(influencer);

      if (matchedReport) {
        console.log(`✅ [SyntheticAudience] Using matched report with deterministic variation`);
        return matchedReport;
      }

      // Fallback to synthetic templates if no reports in database yet
      console.log(`⚠️ [SyntheticAudience] No real reports in DB yet, using SYNTHETIC data...`);
      const template = this.matchInfluencerToTemplate(influencer);
      return this.generateSyntheticAudience(influencer, template);
    } catch (error) {
      console.error('[SyntheticAudience] Error in getInfluencerAudience:', error);
      // Return basic synthetic data as final fallback
      const template = this.matchInfluencerToTemplate(influencer);
      return this.generateSyntheticAudience(influencer, template);
    }
  }

  /**
   * Get best matching report using deterministic similarity scoring
   * REPLACED: Old random selection with consistent matching
   */
  private async getMatchedReport(influencer: any): Promise<AudienceDemographics | null> {
    try {
      // 1. Create consistent fingerprint for this influencer
      const fingerprint = this.createInfluencerFingerprint(influencer);
      const seededRandom = new SeededRandom(fingerprint);

      console.log(`[SyntheticAudience] Fingerprint: ${fingerprint}`);

      // 2. Fetch all available reports (or filter by rough follower range)
      const followerCount = influencer.follower_count || 500000;
      const reports = await this.reportCollector.findSimilarReports(
        followerCount,
        influencer.niche,
        influencer.platform
      );

      if (reports.length === 0) {
        console.log('[SyntheticAudience] No reports in database yet');
        return null;
      }

      // 3. Calculate similarity scores for all reports
      const scoredReports = reports.map(report => ({
        report,
        score: this.calculateSimilarityScore(influencer, report)
      }));

      // 4. Sort by similarity score (best matches first)
      scoredReports.sort((a, b) => b.score - a.score);

      // 5. Select from top matches using weighted random (deterministic)
      // Take top 5 reports or all if less than 5
      const topMatches = scoredReports.slice(0, Math.min(5, scoredReports.length));

      // Calculate total weighted score
      const totalScore = topMatches.reduce((sum, item) => sum + item.score, 0);

      // Use seeded random to pick (weighted by score)
      let randomValue = seededRandom.next() * totalScore;
      let selectedReport = topMatches[0].report;
      let selectedScore = topMatches[0].score;

      for (const { report, score } of topMatches) {
        randomValue -= score;
        if (randomValue <= 0) {
          selectedReport = report;
          selectedScore = score;
          break;
        }
      }

      console.log(`✅ [SyntheticAudience] Matched to: ${selectedReport.influencer_username} (score: ${selectedScore.toFixed(1)})`);

      // 6. Fix gender data if it's stored incorrectly (> 100 means it's in wrong format)
      let male = selectedReport.audience_demographics.gender.male;
      let female = selectedReport.audience_demographics.gender.female;

      // If values are > 100, they're stored as 4667 instead of 46.67
      if (male > 100 || female > 100) {
        console.log(`[SyntheticAudience] Fixing corrupted gender data: Male ${male}, Female ${female}`);
        male = male / 100;
        female = female / 100;
      }

      // 7. Convert report to AudienceDemographics
      const audienceData: AudienceDemographics = {
        age: selectedReport.audience_demographics.age,
        gender: { male, female },
        geography: Object.entries(selectedReport.audience_geography)
          .sort(([, a], [, b]) => (b as number) - (a as number))
          .slice(0, 10)
          .map(([country, percentage]) => ({
            country,
            country_code: this.getCountryCode(country),
            percentage: percentage as number,
          })),
        is_synthetic: false,
      };

      // 8. Apply deterministic variation using the same seed
      return this.applyDeterministicVariation(audienceData, fingerprint, followerCount);
    } catch (error) {
      console.error('[SyntheticAudience] Error getting matched report:', error);
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
   * Apply consistent variation to audience data using seeded randomness
   * REPLACED: Old Math.random() with deterministic SeededRandom
   *
   * @param baseData - Base audience demographics from real report
   * @param seed - Seed for deterministic randomization
   * @param followerCount - Influencer follower count (affects variation)
   * @returns Varied demographics (consistent for same seed)
   */
  private applyDeterministicVariation(
    baseData: AudienceDemographics,
    seed: string,
    followerCount?: number
  ): AudienceDemographics {
    const rng = new SeededRandom(seed);

    // 1. Vary age distribution (±5% per bucket)
    const variedAge: Record<string, number> = {};
    const ageEntries = Object.entries(baseData.age);

    for (const [range, value] of ageEntries) {
      const variationPercent = rng.nextGaussian(0, 0.025); // Mean 0, StdDev 2.5%
      const variation = value * variationPercent;
      variedAge[range] = Math.max(0, value + variation);
    }

    // Normalize age to sum to 100%
    const ageSum = Object.values(variedAge).reduce((sum, v) => sum + v, 0);
    if (ageSum > 0) {
      for (const range in variedAge) {
        variedAge[range] = Math.round((variedAge[range] / ageSum) * 1000) / 10;
      }
    }

    // 2. Vary gender (±8% max absolute change)
    const genderVariation = rng.nextGaussian(0, 4); // Mean 0, StdDev 4%
    let male = baseData.gender.male + genderVariation;
    male = Math.max(20, Math.min(80, male)); // Keep within 20-80% bounds
    male = Math.round(male * 10) / 10;
    const female = 100 - male;

    console.log(`[SyntheticAudience] Gender variation: ${baseData.gender.male.toFixed(1)}% → ${male}% (${genderVariation > 0 ? '+' : ''}${genderVariation.toFixed(1)})`);

    // 3. Vary geography (±3% per country)
    const variedGeo = baseData.geography.map(item => ({
      country: item.country,
      country_code: item.country_code,
      percentage: Math.max(0.1, item.percentage + rng.nextGaussian(0, 1.5))
    }));

    // Normalize geography to sum to 100%
    const geoSum = variedGeo.reduce((sum, item) => sum + item.percentage, 0);
    if (geoSum > 0) {
      variedGeo.forEach(item => {
        item.percentage = Math.round((item.percentage / geoSum) * 1000) / 10;
      });
    }

    // Sort by percentage (deterministic order)
    variedGeo.sort((a, b) => b.percentage - a.percentage);

    return {
      age: variedAge,
      gender: { male, female },
      geography: variedGeo.slice(0, 10), // Top 10 countries
      is_synthetic: false
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
