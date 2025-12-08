/**
 * OpenAI Audience Inference Service
 *
 * Service for inferring Instagram audience demographics using OpenAI API with web scraping.
 * Includes caching, cost tracking, and validation.
 */

import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { Browser, Page } from 'puppeteer-core';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import { config } from '../../config/environment';
import { getOpenAIAudienceConfig } from '../../config/openai-audience.config';
import {
  InstagramProfileData,
  InstagramPost,
  AudienceDemographics,
  AudienceDemographicsExtended,
  OpenAIInferenceResponse,
  CacheEntry,
  CacheFile,
  InferenceResult,
  InferenceOptions,
  CacheStats,
  CostEntry,
  ValidationResult,
  ValidationError,
  OpenAIAudienceInferenceDB,
  SearchContext,
} from '../../models/audience/openai-audience-inference.model';

/**
 * OpenAI Audience Service
 */
export class OpenAIAudienceService {
  private config = getOpenAIAudienceConfig();
  private openai: OpenAI;
  private browser: Browser | null = null;
  private supabase: ReturnType<typeof createClient>;

  constructor() {
    this.openai = new OpenAI({
      apiKey: this.config.openai.apiKey,
    });
    this.supabase = createClient(
      config.supabase.url || '',
      config.supabase.anonKey || ''
    );
  }

  /**
   * Main inference method
   */
  async inferAudience(
    instagramUrl: string,
    options: InferenceOptions = {}
  ): Promise<InferenceResult> {
    try {
      const startTime = Date.now();

      // Normalize URL
      const normalizedUrl = this.normalizeInstagramUrl(instagramUrl);
      const cacheKey = this.generateCacheKey(normalizedUrl);

      // Check database cache first (unless force refresh or skip cache)
      if (!options.forceRefresh && !options.skipCache) {
        const dbCached = await this.checkDatabaseCache(
          normalizedUrl,
          options.influencerId,
          options.searchContext
        );
        if (dbCached) {
          console.log(`✅ Database cache hit: ${normalizedUrl}`);
          return {
            success: true,
            demographics: {
              ...dbCached.audience_demographics,
              inference_source: 'openai',
              model_used: dbCached.model_used,
              inferred_at: dbCached.inferred_at,
            },
            cached: true,
            cost: 0,
          };
        }
      }

      // Check file cache second (unless force refresh or skip cache)
      if (!options.forceRefresh && !options.skipCache && this.config.cache.enabled) {
        const cached = await this.checkCache(cacheKey);
        if (cached) {
          console.log(`✅ File cache hit: ${normalizedUrl}`);

          // Save file cache to database for future use
          const demographics: AudienceDemographics = {
            ...cached.demographics,
          };
          await this.storeToDatabase(
            normalizedUrl,
            cached.username,
            demographics,
            options.influencerId,
            cached.api_cost,
            cached.profile_snapshot,
            options.searchContext
          );

          return {
            success: true,
            demographics: {
              ...cached.demographics,
              inference_source: 'openai',
              model_used: cached.model,
              inferred_at: new Date(cached.cached_at),
            },
            cached: true,
            cost: 0,
          };
        }
      }

      // Fetch Instagram profile
      console.log(`🔍 Fetching Instagram profile: ${normalizedUrl}`);
      const profileData = await this.fetchInstagramProfile(normalizedUrl, options);

      // Dry run mode - skip OpenAI call
      if (options.dryRun) {
        console.log('✅ Dry run completed - profile data extracted successfully');
        return {
          success: true,
          demographics: this.createMockDemographics(),
          cached: false,
          cost: 0,
          details: { profileData, dryRun: true },
        };
      }

      // Mock mode - use predefined response
      if (options.mockMode) {
        console.log('✅ Mock mode - using predefined response');
        return {
          success: true,
          demographics: this.createMockDemographics(),
          cached: false,
          cost: 0,
          details: { mockMode: true },
        };
      }

      // Check daily cost limit
      if (this.config.costControl.enabled) {
        await this.checkDailyBudget();
      }

      // Call OpenAI API with search context (with retries for hallucinated countries)
      console.log(`🤖 Calling OpenAI API (${this.config.openai.model})...`);
      if (options.searchContext) {
        console.log('📍 Using search context for enhanced inference');
      }

      let rawDemographics: OpenAIInferenceResponse;
      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts) {
        attempts++;
        rawDemographics = await this.callOpenAIAPI(profileData, options.searchContext);

        // HARD VALIDATION: Check for hallucinated countries
        const hallucinatedCountries = this.detectHallucinatedCountries(rawDemographics, profileData);
        if (hallucinatedCountries.length > 0) {
          console.warn(`❌ Attempt ${attempts}: OpenAI hallucinated impossible countries: ${hallucinatedCountries.join(', ')}`);
          if (attempts < maxAttempts) {
            console.log(`🔄 Retrying with stricter prompt...`);
            continue;
          } else {
            throw new Error(`OpenAI keeps hallucinating impossible countries after ${maxAttempts} attempts: ${hallucinatedCountries.join(', ')}`);
          }
        }
        break;
      }

      // Validate and normalize
      console.log('✅ Validating and normalizing output...');
      const validation = this.validateAndNormalize(rawDemographics!);
      if (!validation.valid) {
        throw new Error(
          `Validation failed: ${validation.errors.map((e) => e.message).join(', ')}`
        );
      }

      const demographics: AudienceDemographicsExtended = {
        ...validation.normalized!,
        inference_source: 'openai',
        model_used: this.config.openai.model,
        inferred_at: new Date(),
      };

      // Estimate cost
      const cost = 0.05; // Approximate cost per inference
      const duration = Date.now() - startTime;

      // Track cost
      if (this.config.costControl.enabled) {
        await this.recordCost({
          timestamp: new Date(),
          operation: 'inference',
          cost,
          url: normalizedUrl,
          model: this.config.openai.model,
          success: true,
        });
      }

      // Use the actual scraped Instagram URL (in case of redirects like TR1 -> trueno)
      const actualInstagramUrl = `https://instagram.com/${profileData.username}`;

      // Store to database first (with correct scraped username and URL)
      if (!options.skipCache) {
        await this.storeToDatabase(
          actualInstagramUrl,
          profileData.username,
          demographics,
          options.influencerId,
          cost,
          profileData,
          options.searchContext
        );
      }

      // Cache result to file (secondary cache) - also use actual URL
      if (!options.skipCache && this.config.cache.enabled) {
        const actualCacheKey = this.generateCacheKey(actualInstagramUrl);
        await this.cacheResult(actualCacheKey, actualInstagramUrl, profileData.username, demographics, cost);
      }

      console.log(`✅ Inference completed in ${(duration / 1000).toFixed(2)}s (cost: $${cost})`);

      return {
        success: true,
        demographics,
        cached: false,
        cost,
      };
    } catch (error: any) {
      console.error('❌ Inference failed:', error.message);

      // Record failed cost
      if (this.config.costControl.enabled) {
        await this.recordCost({
          timestamp: new Date(),
          operation: 'inference',
          cost: 0,
          url: instagramUrl,
          model: this.config.openai.model,
          success: false,
        });
      }

      return {
        success: false,
        error: error.message,
        details: error,
      };
    }
  }

  /**
   * Fetch Instagram profile data using Puppeteer
   */
  private async fetchInstagramProfile(
    url: string,
    options: InferenceOptions
  ): Promise<InstagramProfileData> {
    const maxRetries = options.maxRetries || this.config.scraping.retries;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`  Attempt ${attempt}/${maxRetries}...`);
        return await this._fetchWithPuppeteer(url, options.timeout);
      } catch (error: any) {
        lastError = error;
        console.warn(`  Attempt ${attempt} failed:`, error.message);

        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          console.log(`  Retrying in ${delay / 1000}s...`);
          await this.sleep(delay);
        }
      }
    }

    throw new Error(`Failed to fetch Instagram profile after ${maxRetries} attempts: ${lastError?.message}`);
  }

  /**
   * Fetch Instagram profile with Puppeteer
   */
  private async _fetchWithPuppeteer(
    url: string,
    timeout?: number
  ): Promise<InstagramProfileData> {
    let browser: Browser | null = null;
    let page: Page | null = null;

    try {
      // Determine if we're in production (Vercel/serverless)
      const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;

      // Launch browser with appropriate configuration
      if (isProduction) {
        // Production: Use @sparticuz/chromium for serverless
        browser = await puppeteer.launch({
          args: chromium.args,
          defaultViewport: { width: 1280, height: 800 },
          executablePath: await chromium.executablePath(),
          headless: true,
        });
      } else {
        // Development: Use local Puppeteer
        const puppeteerLocal = require('puppeteer');
        browser = await puppeteerLocal.launch({
          headless: this.config.scraping.headless,
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
          timeout: timeout || this.config.scraping.timeout,
        });
      }

      if (!browser) {
        throw new Error('Failed to launch browser');
      }

      page = await browser.newPage();

      // Set user agent
      await page.setUserAgent(this.config.scraping.userAgent);

      // Set viewport
      await page.setViewport({ width: 1280, height: 800 });

      // Optimize loading: block images, CSS, fonts to speed up
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        const resourceType = req.resourceType();
        if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
          req.abort();
        } else {
          req.continue();
        }
      });

      // Navigate to profile (use domcontentloaded for faster loading)
      console.log(`  Navigating to: ${url}`);
      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: timeout || this.config.scraping.timeout,
      });

      // Wait for content to load (try multiple selectors)
      try {
        await Promise.race([
          page.waitForSelector('header', { timeout: 10000 }),
          page.waitForSelector('main', { timeout: 10000 }),
          page.waitForSelector('article', { timeout: 10000 }),
        ]);
      } catch (error) {
        console.log('  Warning: Standard selectors not found, trying to extract data anyway...');
      }

      // Additional wait for dynamic content
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Extract profile data
      // Note: This function runs in the browser context, so DOM APIs are available
      const profileData: any = await page.evaluate(() => {
        const _document: any = (globalThis as any).document;
        const _window: any = (globalThis as any).window;

        // Helper to extract text safely
        const getText = (selector: string): string => {
          const el = _document.querySelector(selector);
          return el?.textContent?.trim() || '';
        };

        // Helper to extract number from text
        const extractNumber = (text: string): number => {
          const match = text.match(/[\d,]+/);
          if (!match) return 0;
          return parseInt(match[0].replace(/,/g, ''), 10);
        };

        // Extract username from URL (primary method)
        let username = _window.location.pathname.split('/').filter((x: any) => x)[0] || '';

        // Fallback: Try to extract from meta tags or JSON-LD data
        if (!username) {
          // Try meta property og:url
          const ogUrl = _document.querySelector('meta[property="og:url"]')?.getAttribute('content');
          if (ogUrl) {
            const match = ogUrl.match(/instagram\.com\/([^\/\?]+)/);
            if (match) username = match[1];
          }
        }

        // Additional fallback: Try canonical link
        if (!username) {
          const canonical = _document.querySelector('link[rel="canonical"]')?.getAttribute('href');
          if (canonical) {
            const match = canonical.match(/instagram\.com\/([^\/\?]+)/);
            if (match) username = match[1];
          }
        }

        // Extract bio
        const bio = getText('header section div:last-child span') || '';

        // Extract counts (followers, following, posts)
        const metaElements = Array.from(_document.querySelectorAll('header section ul li'));
        let followerCount = 0;
        let followingCount = 0;
        let postCount = 0;

        metaElements.forEach((el: any) => {
          const text = el.textContent || '';
          if (text.includes('posts') || text.includes('publications')) {
            postCount = extractNumber(text);
          } else if (text.includes('followers') || text.includes('seguidores')) {
            followerCount = extractNumber(text);
          } else if (text.includes('following') || text.includes('seguidos')) {
            followingCount = extractNumber(text);
          }
        });

        // Check if verified
        const isVerified = !!_document.querySelector('svg[aria-label*="Verified"]');

        // Try to extract category
        const category = getText('header section div[class*="category"]') || undefined;

        // Extract recent posts (reduced to 6 for speed)
        const posts: any[] = [];
        const postElements = Array.from(_document.querySelectorAll('article a[href*="/p/"]')).slice(0, 6);

        postElements.forEach((postLink: any) => {
          const href = postLink.href;
          const postId = href.split('/p/')[1]?.split('/')[0] || '';

          // Try to extract engagement from image alt text or nearby elements
          const img = postLink.querySelector('img');
          const altText = img?.alt || '';

          posts.push({
            id: postId,
            caption: altText.substring(0, 500),
            likesCount: 0, // Can't reliably extract without API
            commentsCount: 0,
            hashtags: [],
            timestamp: new Date(),
            isVideo: !!postLink.querySelector('video'),
            mentions: [],
          });
        });

        return {
          username,
          bio,
          followerCount,
          followingCount,
          postCount,
          isVerified,
          category,
          recentPosts: posts,
        };
      });

      // Close browser
      if (browser) {
        await browser.close();
      }

      // Construct full profile data
      const fullProfile: InstagramProfileData = {
        username: profileData.username,
        url,
        bio: profileData.bio,
        followerCount: profileData.followerCount,
        followingCount: profileData.followingCount,
        postCount: profileData.postCount,
        isVerified: profileData.isVerified,
        category: profileData.category,
        primaryLanguage: this.detectLanguage(profileData.bio),
        recentPosts: profileData.recentPosts,
        topHashtags: this.extractTopHashtags(profileData.recentPosts),
      };

      console.log(`  ✅ Profile extracted: @${fullProfile.username} (${fullProfile.followerCount} followers)`);

      return fullProfile;
    } catch (error: any) {
      if (browser) {
        await browser.close().catch(() => {});
      }
      throw new Error(`Puppeteer scraping failed: ${error.message}`);
    }
  }

  /**
   * Call OpenAI API for audience inference
   */
  private async callOpenAIAPI(profileData: InstagramProfileData, searchContext?: SearchContext): Promise<OpenAIInferenceResponse> {
    const systemPrompt = this.buildSystemPrompt();
    const userPrompt = this.buildUserPrompt(profileData, searchContext);

    try {
      // Build request parameters based on model capabilities
      const requestParams: any = {
        model: this.config.openai.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: this.config.openai.responseFormat,
      };

      // GPT-5 and o1 models have different parameter requirements
      const isGpt5OrO1 = this.config.openai.model.startsWith('gpt-5') || this.config.openai.model.startsWith('o1');

      if (isGpt5OrO1) {
        // GPT-5/o1: use max_completion_tokens, no temperature/top_p (must use default)
        requestParams.max_completion_tokens = this.config.openai.maxTokens;
        // temperature and top_p are not configurable for these models
      } else {
        // GPT-4 and earlier: use max_tokens with temperature and top_p
        requestParams.max_tokens = this.config.openai.maxTokens;
        requestParams.temperature = this.config.openai.temperature;
        requestParams.top_p = this.config.openai.topP;
      }

      const response = await this.openai.chat.completions.create(requestParams);

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('OpenAI returned empty response');
      }

      // Parse JSON response
      const parsed = JSON.parse(content) as OpenAIInferenceResponse;
      return parsed;
    } catch (error: any) {
      throw new Error(`OpenAI API call failed: ${error.message}`);
    }
  }

  /**
   * Build system prompt for OpenAI
   */
  private buildSystemPrompt(): string {
    return `You are an expert social media analyst specializing in audience demographics inference.

Given Instagram profile data, infer the likely AUDIENCE demographics (who follows this account).

You MUST respond with ONLY valid JSON in this exact format:
{
  "age": {
    "13-17": <percentage>,
    "18-24": <percentage>,
    "25-34": <percentage>,
    "35-44": <percentage>,
    "45-54": <percentage>,
    "55+": <percentage>
  },
  "gender": {
    "male": <percentage>,
    "female": <percentage>
  },
  "geography": [
    {"country": "<full name>", "country_code": "<ISO 2-letter>", "percentage": <percentage>},
    ...top 10 countries only
  ]
}

GEOGRAPHIC INFERENCE RULES (CRITICAL - FOLLOW EXACTLY):

⚠️ **STRICT LANGUAGE-BASED RULES - NO EXCEPTIONS**:

1. **Spanish content (MANDATORY)**:
   - If bio/posts contain Spanish → 70-90% MUST be Spanish-speaking countries (AR, MX, CO, CL, ES, PE, VE, UY)
   - Argentine markers (🇦🇷, Buenos Aires, Argentine slang) → Argentina 40-55%, Mexico 10-18%, Chile 6-10%
   - Mexican markers → Mexico 45-60%, US 8-12% (Mexican diaspora), other LATAM
   - **ABSOLUTELY NO India, Pakistan, Nigeria, Bangladesh, Kenya, or Asian countries for Spanish content**

2. **Portuguese content**:
   - Brazil (BR) 70-90%
   - Portugal (PT) 5-10%
   - **NO African or Asian countries**

3. **English content**:
   - Check bio/posts for location clues FIRST
   - If no clear location → US 30%, UK 20%, Canada 10%, Australia 10%, then diverse
   - **DO NOT assume global English = India/Pakistan/Africa**

4. **Content type**:
   - Music/Entertainment: 60-70% creator's country
   - Gaming: Creator's region primary, then language-based expansion
   - Fashion/Beauty: Still language-based, just more distributed

⚠️ **ABSOLUTE PROHIBITIONS - WILL BE REJECTED IF VIOLATED**:
- Spanish content → **ZERO TOLERANCE**: NO Sweden, New Zealand, France, Germany, Canada, Ireland, Netherlands, Australia, UK
- Spanish content → **ZERO TOLERANCE**: NO India, Pakistan, Bangladesh, Nigeria, Kenya, Philippines, Indonesia, Thailand, Japan, China
- Portuguese content → NO Asian/African countries except Portuguese-speaking (Angola, Mozambique rarely)
- If you detect Spanish language → geography MUST be >70% LATAM+Spain
- **YOUR RESPONSE WILL BE REJECTED AND YOU'LL BE ASKED AGAIN IF YOU INCLUDE FORBIDDEN COUNTRIES**

CRITICAL RULES:
1. All percentages MUST sum to exactly 100.0
2. Country codes: ISO 3166-1 alpha-2 (AR, MX, BR, CO, CL, ES, US, GB)
3. **LANGUAGE DETERMINES GEOGRAPHY** - this is the PRIMARY rule
4. ONLY the JSON object in response - no explanations

EXAMPLES:
- Spanish gaming creator from Argentina → {"AR": 45%, "MX": 15%, "CL": 10%, "CO": 8%, "ES": 7%, "US": 5%, "BR": 5%, "UY": 3%, "PE": 2%}
- Spanish music from Mexico → {"MX": 55%, "US": 12%, "CO": 8%, "AR": 7%, "ES": 5%, "CL": 4%, "PE": 3%, "GT": 3%, "EC": 2%, "DO": 1%}`;
  }

  /**
   * Detect hallucinated/impossible countries based on profile language and content
   */
  private detectHallucinatedCountries(
    response: OpenAIInferenceResponse,
    profileData: InstagramProfileData
  ): string[] {
    const hallucinated: string[] = [];

    // Detect language
    const isSpanish = profileData.primaryLanguage === 'Spanish' ||
                     profileData.bio?.match(/[áéíóúñ¿¡]/i);
    const isPortuguese = profileData.primaryLanguage === 'Portuguese' ||
                        profileData.bio?.match(/ã|õ|ç/i);

    // FORBIDDEN countries for Spanish content (LATAM creators)
    const forbiddenForSpanish = [
      'SE', 'NZ', 'FR', 'DE', 'CA', 'IE', 'NL', 'NO', 'DK', 'FI', 'IS', 'AU',
      'IN', 'PK', 'BD', 'LK', 'NP', 'NG', 'KE', 'GH', 'TZ', 'UG', 'ZA', 'EG',
      'PH', 'ID', 'TH', 'VN', 'MY', 'SG', 'JP', 'KR', 'CN', 'TW', 'HK', 'GB'
    ];

    // FORBIDDEN countries for Portuguese content (Brazil)
    const forbiddenForPortuguese = [
      'SE', 'NZ', 'FR', 'DE', 'CA', 'IE', 'NL', 'NO', 'DK', 'FI', 'IS',
      'IN', 'PK', 'BD', 'LK', 'NP', 'NG', 'KE', 'GH', 'TZ', 'UG', 'EG',
      'PH', 'ID', 'TH', 'VN', 'MY', 'SG', 'JP', 'KR', 'CN', 'TW', 'HK',
      'AR', 'MX', 'CO', 'CL', 'ES' // No Spanish countries for Portuguese
    ];

    // Check geography array for forbidden countries
    for (const geo of response.geography) {
      const code = geo.country_code.toUpperCase();

      if (isSpanish && forbiddenForSpanish.includes(code)) {
        hallucinated.push(`${geo.country} (${code}) - impossible for Spanish content`);
      } else if (isPortuguese && forbiddenForPortuguese.includes(code)) {
        hallucinated.push(`${geo.country} (${code}) - impossible for Portuguese content`);
      }
    }

    return hallucinated;
  }

  /**
   * Get country name from country code
   */
  private getCountryName(code: string): string {
    const countries: { [key: string]: string } = {
      'AR': 'Argentina',
      'MX': 'Mexico',
      'US': 'United States',
      'BR': 'Brazil',
      'CO': 'Colombia',
      'CL': 'Chile',
      'ES': 'Spain',
      'GB': 'United Kingdom',
      'PE': 'Peru',
      'UY': 'Uruguay',
      'EC': 'Ecuador',
      'VE': 'Venezuela',
      'BO': 'Bolivia',
      'PY': 'Paraguay',
      'FR': 'France',
      'DE': 'Germany',
      'IT': 'Italy',
      'CA': 'Canada',
      'AU': 'Australia',
      'JP': 'Japan',
      'KR': 'South Korea',
      'IN': 'India',
      'CN': 'China',
    };
    return countries[code.toUpperCase()] || code;
  }

  /**
   * Build user prompt for OpenAI
   */
  private buildUserPrompt(profileData: InstagramProfileData, searchContext?: SearchContext): string {
    const posts = profileData.recentPosts
      .map(
        (post, i) =>
          `Post ${i + 1}: ${post.caption?.substring(0, 150) || 'No caption'}...`
      )
      .join('\n');

    // Detect if Spanish language
    const isSpanish = profileData.primaryLanguage === 'Spanish' ||
                     profileData.bio?.match(/[áéíóúñ¿¡]/i);

    // Detect Argentine origin (common indicators)
    const isArgentine = profileData.bio?.match(/🇦🇷|argentin|buenos aires|rosario|córdoba|mendoza/i) ||
                       profileData.url?.includes('.ar') ||
                       posts.match(/che|boludo|pilcha|laburo|viste/i);  // Argentine slang

    // Detect gaming/tech content
    const isGaming = profileData.bio?.toLowerCase().match(/gam(ing|er)|stream|twitch|youtube|esports/i) ||
                    profileData.topHashtags?.some(tag => tag.match(/gam(ing|er)|stream|esports/i));

    // Build search context hint
    let searchContextHint = '';
    if (searchContext) {
      if (searchContext.creator_location) {
        const locationName = this.getCountryName(searchContext.creator_location);
        searchContextHint += `\n🎯 SEARCH CONTEXT - Creator Location: ${locationName} (${searchContext.creator_location})`;
        searchContextHint += `\n   → User is specifically searching for creators from ${locationName}`;
        searchContextHint += `\n   → Audience should reflect ${locationName}-based creator patterns`;
      }

      if (searchContext.target_audience_geo?.countries && searchContext.target_audience_geo.countries.length > 0) {
        const targetCountries = searchContext.target_audience_geo.countries
          .map(c => `${this.getCountryName(c.id)} (${c.prc}%)`)
          .join(', ');
        searchContextHint += `\n🎯 SEARCH CONTEXT - Target Audience Geography: ${targetCountries}`;
        searchContextHint += `\n   → User wants creators whose audience is in these countries`;
        searchContextHint += `\n   → STRONGLY PRIORITIZE these countries in your geography inference`;
      }
    }

    let geographicHint = '';
    if (isSpanish) {
      if (isArgentine) {
        geographicHint = '🇦🇷 ARGENTINE CREATOR detected → PRIMARY audience: Argentina 40-55%, Mexico 12-18%, Chile 6-10%, Colombia 5-8%, Spain 3-5%';
      } else {
        geographicHint = '🌎 Spanish LATAM content → PRIMARY audience: Spanish-speaking countries 70-80% (AR, MX, CO, CL, ES)';
      }
    }

    return `Analyze this Instagram profile and infer AUDIENCE demographics (who follows this account):

CREATOR PROFILE:
Instagram: ${profileData.url}
@${profileData.username} | ${profileData.followerCount.toLocaleString()} followers
Bio: "${profileData.bio || 'No bio'}"
Language: ${profileData.primaryLanguage || 'Unknown'}
Category: ${profileData.category || 'Unknown'}
Verified: ${profileData.isVerified ? 'Yes' : 'No'}

CONTENT SAMPLE (Recent ${profileData.recentPosts.length} posts):
${posts}

TOP HASHTAGS: ${profileData.topHashtags?.join(', ') || 'None'}
${searchContextHint}

🎯 CRITICAL GEOGRAPHIC INFERENCE:
${geographicHint}
${isGaming ? '🎮 Gaming content: Audience skews male (65-75%), ages 18-34, primarily from creator\'s region' : ''}

${searchContext?.target_audience_geo ? '⚠️ IMPORTANT: The user is searching for creators with specific target audience geography. Weight this heavily in your inference.' : ''}
⚠️ DO NOT default to US/UK unless creator is clearly English-speaking from those regions.
✅ Match audience geography to creator's language and location.
${searchContext?.creator_location ? `✅ Consider that this creator is from ${this.getCountryName(searchContext.creator_location)}` : ''}

Now infer the audience demographics as JSON:`;
  }

  /**
   * Validate and normalize OpenAI response
   */
  private validateAndNormalize(response: OpenAIInferenceResponse): ValidationResult {
    const errors: ValidationError[] = [];

    // Validate age distribution
    if (!response.age || typeof response.age !== 'object') {
      errors.push({ field: 'age', message: 'Age distribution is missing or invalid' });
    } else {
      const ageRanges: Array<keyof typeof response.age> = ['13-17', '18-24', '25-34', '35-44', '45-54', '55+'];
      for (const range of ageRanges) {
        if (typeof response.age[range] !== 'number') {
          errors.push({ field: `age.${range}`, message: `Missing or invalid age range: ${range}` });
        }
      }

      // Check sum
      const ageSum = Object.values(response.age).reduce((sum, val) => sum + (val as number), 0);
      if (Math.abs(ageSum - 100) > 0.1) {
        console.warn(`Age sum is ${ageSum}, will normalize to 100`);
      }
    }

    // Validate gender distribution
    if (!response.gender || typeof response.gender !== 'object') {
      errors.push({ field: 'gender', message: 'Gender distribution is missing or invalid' });
    } else {
      if (typeof response.gender.male !== 'number' || typeof response.gender.female !== 'number') {
        errors.push({ field: 'gender', message: 'Male or female percentage is missing or invalid' });
      }

      const genderSum = response.gender.male + response.gender.female;
      if (Math.abs(genderSum - 100) > 0.1) {
        console.warn(`Gender sum is ${genderSum}, will normalize to 100`);
      }
    }

    // Validate geography
    if (!Array.isArray(response.geography) || response.geography.length === 0) {
      errors.push({ field: 'geography', message: 'Geography array is missing or empty' });
    } else {
      response.geography.forEach((geo, i) => {
        if (!geo.country || typeof geo.country !== 'string') {
          errors.push({ field: `geography[${i}].country`, message: 'Country name is missing' });
        }
        if (!geo.country_code || typeof geo.country_code !== 'string' || geo.country_code.length !== 2) {
          errors.push({ field: `geography[${i}].country_code`, message: 'Invalid country code' });
        }
        if (typeof geo.percentage !== 'number') {
          errors.push({ field: `geography[${i}].percentage`, message: 'Invalid percentage' });
        }
      });

      const geoSum = response.geography.reduce((sum, geo) => sum + geo.percentage, 0);
      if (Math.abs(geoSum - 100) > 0.1) {
        console.warn(`Geography sum is ${geoSum}, will normalize to 100`);
      }
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    // Normalize
    const normalizedAge = this.normalizePercentages(response.age);
    const normalizedGender = this.normalizePercentages(response.gender);

    const normalized: AudienceDemographics = {
      age: {
        '13-17': normalizedAge['13-17'],
        '18-24': normalizedAge['18-24'],
        '25-34': normalizedAge['25-34'],
        '35-44': normalizedAge['35-44'],
        '45-54': normalizedAge['45-54'],
        '55+': normalizedAge['55+'],
      },
      gender: {
        male: normalizedGender.male,
        female: normalizedGender.female,
      },
      geography: this.normalizeGeography(response.geography),
      is_synthetic: false,
    };

    return { valid: true, errors: [], normalized };
  }

  /**
   * Normalize percentages to sum to 100
   */
  private normalizePercentages<T extends Record<string, number>>(obj: T): T {
    const total = Object.values(obj).reduce((sum, val) => sum + val, 0);
    if (total === 0) return obj;

    const normalized = {} as T;
    for (const [key, value] of Object.entries(obj)) {
      (normalized as any)[key] = Math.round((value / total) * 1000) / 10; // 1 decimal
    }

    // Fix rounding errors
    const sum = Object.values(normalized).reduce((s, v) => s + v, 0);
    if (Math.abs(sum - 100) > 0.01) {
      const largest = Object.keys(normalized).reduce((a, b) =>
        (normalized as any)[a] > (normalized as any)[b] ? a : b
      );
      (normalized as any)[largest] += 100 - sum;
      (normalized as any)[largest] = Math.round((normalized as any)[largest] * 10) / 10;
    }

    return normalized;
  }

  /**
   * Normalize geography array
   */
  private normalizeGeography(geography: Array<any>): Array<{
    country: string;
    country_code: string;
    percentage: number;
  }> {
    // Take top 10
    const top10 = geography.slice(0, 10);

    // Normalize percentages
    const total = top10.reduce((sum, geo) => sum + geo.percentage, 0);
    if (total === 0) return top10;

    const normalized = top10.map((geo) => ({
      country: geo.country,
      country_code: geo.country_code.toUpperCase(),
      percentage: Math.round((geo.percentage / total) * 1000) / 10,
    }));

    // Fix rounding errors
    const sum = normalized.reduce((s, geo) => s + geo.percentage, 0);
    if (Math.abs(sum - 100) > 0.01) {
      normalized[0].percentage += 100 - sum;
      normalized[0].percentage = Math.round(normalized[0].percentage * 10) / 10;
    }

    return normalized;
  }

  /**
   * Database cache methods
   */

  /**
   * Check database for cached inference
   */
  private async checkDatabaseCache(
    instagramUrl: string,
    influencerId?: string,
    searchContext?: SearchContext
  ): Promise<OpenAIAudienceInferenceDB | null> {
    try {
      console.log(`[Cache Check] Starting database cache check`);
      console.log(`[Cache Check] URL: ${instagramUrl}`);
      console.log(`[Cache Check] Influencer ID: ${influencerId || 'none'}`);
      console.log(`[Cache Check] Search Context:`, searchContext);

      let query = this.supabase
        .from('openai_audience_inferences')
        .select('*')
        .eq('instagram_url', instagramUrl);

      // Add influencer_id filter if provided
      if (influencerId && this.isValidUUID(influencerId)) {
        query = query.eq('influencer_id', influencerId);
      }

      // Add search context filters if provided
      if (searchContext?.creator_location) {
        query = query.eq('creator_location', searchContext.creator_location);
      } else {
        // Match entries with no creator_location
        query = query.is('creator_location', null);
      }

      const { data, error } = await query
        .order('inferred_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.log(`[Cache Check] Query error:`, error.message);
        return null;
      }

      if (!data) {
        console.log(`[Cache Check] No data found in database`);
        return null;
      }

      console.log(`[Cache Check] Found entry:`, {
        instagram_url: data.instagram_url,
        inferred_at: data.inferred_at,
        expires_at: data.expires_at,
        model_used: data.model_used
      });

      // Check if expired - ensure proper date comparison
      const expiresAt = new Date(data.expires_at as string);
      const now = new Date();

      console.log(`[Cache Check] Expiration check:`);
      console.log(`[Cache Check]   Expires: ${expiresAt.toISOString()}`);
      console.log(`[Cache Check]   Now:     ${now.toISOString()}`);
      console.log(`[Cache Check]   Expired: ${expiresAt < now}`);

      if (expiresAt < now) {
        console.log(`[Cache Check] ❌ Cache EXPIRED - will re-scrape`);
        return null;
      }

      const daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      console.log(`[Cache Check] ✅ Cache HIT - valid for ${daysUntilExpiry} more days`);

      return {
        ...data,
        inferred_at: new Date(data.inferred_at as string),
        expires_at: expiresAt,
        created_at: new Date(data.created_at as string),
        updated_at: new Date(data.updated_at as string),
      } as OpenAIAudienceInferenceDB;
    } catch (error) {
      console.error('[Cache Check] Error:', error);
      return null;
    }
  }

  /**
   * Validate if string is a valid UUID
   */
  private isValidUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }

  /**
   * Store inference result to database
   */
  private async storeToDatabase(
    instagramUrl: string,
    username: string,
    demographics: AudienceDemographics,
    influencerId?: string,
    cost: number = 0.05,
    profileSnapshot?: Partial<InstagramProfileData>,
    searchContext?: SearchContext
  ): Promise<void> {
    try {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days

      // Validate influencer_id is a valid UUID before including it
      const validInfluencerId = influencerId && this.isValidUUID(influencerId) ? influencerId : null;

      const record: any = {
        instagram_url: instagramUrl,
        instagram_username: username,
        audience_demographics: demographics,
        audience_geography: demographics.geography,
        model_used: this.config.openai.model,
        profile_data_snapshot: profileSnapshot || null,
        inferred_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        api_cost: cost,
        // Store search context
        search_context: searchContext || null,
        creator_location: searchContext?.creator_location || null,
        target_audience_geo: searchContext?.target_audience_geo || null,
      };

      // Only add influencer_id if it's a valid UUID
      if (validInfluencerId) {
        record.influencer_id = validInfluencerId;
      }

      // Check if entry exists with same URL + context
      const existing = await this.checkDatabaseCache(instagramUrl, validInfluencerId || undefined, searchContext);

      if (existing) {
        // Update existing record
        const { error } = await this.supabase
          .from('openai_audience_inferences')
          .update(record)
          .eq('id', existing.id);

        if (error) {
          console.error('  Error updating database:', error);
        } else {
          console.log(`  ✅ Updated database: ${instagramUrl}${validInfluencerId ? ` (influencer: ${validInfluencerId})` : ''}`);
        }
      } else {
        // Insert new record
        const { error } = await this.supabase
          .from('openai_audience_inferences')
          .insert(record);

        if (error) {
          console.error('  Error inserting to database:', error);
        } else {
          console.log(`  ✅ Inserted to database: ${instagramUrl}${validInfluencerId ? ` (influencer: ${validInfluencerId})` : ''}`);
        }
      }
    } catch (error) {
      console.error('  Error storing to database:', error);
    }
  }

  /**
   * File cache management methods
   */
  private async checkCache(cacheKey: string): Promise<CacheEntry | null> {
    if (!this.config.cache.enabled) return null;

    try {
      const cache = await this.readCacheFile();
      const entry = cache.entries[cacheKey];

      if (!entry) return null;

      // Check expiration
      const expiresAt = new Date(entry.expires_at);
      if (expiresAt < new Date()) {
        console.log(`  Cache entry expired, removing...`);
        delete cache.entries[cacheKey];
        await this.writeCacheFile(cache);
        return null;
      }

      return entry;
    } catch (error) {
      console.warn('Cache read error:', error);
      return null;
    }
  }

  private async cacheResult(
    cacheKey: string,
    url: string,
    username: string,
    demographics: AudienceDemographics,
    cost: number
  ): Promise<void> {
    try {
      const cache = await this.readCacheFile();

      const entry: CacheEntry = {
        url,
        username,
        demographics,
        model: this.config.openai.model,
        cached_at: new Date().toISOString(),
        expires_at: new Date(
          Date.now() + this.config.cache.ttlDays * 24 * 60 * 60 * 1000
        ).toISOString(),
        api_cost: cost,
      };

      cache.entries[cacheKey] = entry;
      await this.writeCacheFile(cache);
      console.log(`  ✅ Cached result (expires: ${entry.expires_at.split('T')[0]})`);
    } catch (error) {
      console.warn('Cache write error:', error);
    }
  }

  private async readCacheFile(): Promise<CacheFile> {
    try {
      const content = await fs.readFile(this.config.cache.file, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      // File doesn't exist or is invalid, return empty cache
      return { version: '1.0.0', entries: {} };
    }
  }

  private async writeCacheFile(cache: CacheFile): Promise<void> {
    // Ensure directory exists
    const dir = path.dirname(this.config.cache.file);
    await fs.mkdir(dir, { recursive: true });

    await fs.writeFile(this.config.cache.file, JSON.stringify(cache, null, 2), 'utf-8');
  }

  async clearCache(): Promise<void> {
    const cache: CacheFile = { version: '1.0.0', entries: {} };
    await this.writeCacheFile(cache);
    console.log('✅ Cache cleared');
  }

  async getCacheStats(): Promise<CacheStats> {
    const cache = await this.readCacheFile();
    const entries = Object.values(cache.entries);

    if (entries.length === 0) {
      return {
        totalEntries: 0,
        totalCost: 0,
        averageCost: 0,
        expirationBreakdown: { valid: 0, expired: 0 },
      };
    }

    const now = new Date();
    const valid = entries.filter((e) => new Date(e.expires_at) >= now);
    const expired = entries.filter((e) => new Date(e.expires_at) < now);

    const totalCost = entries.reduce((sum, e) => sum + e.api_cost, 0);
    const dates = entries.map((e) => new Date(e.cached_at));

    return {
      totalEntries: entries.length,
      totalCost,
      oldestEntry: new Date(Math.min(...dates.map((d) => d.getTime()))),
      newestEntry: new Date(Math.max(...dates.map((d) => d.getTime()))),
      averageCost: totalCost / entries.length,
      expirationBreakdown: {
        valid: valid.length,
        expired: expired.length,
      },
    };
  }

  /**
   * Cost tracking methods
   */
  private async checkDailyBudget(): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const spent = await this.getTodaySpending(today);

    if (spent + 0.05 > this.config.costControl.maxCostPerDay) {
      throw new Error(
        `Daily budget exceeded: $${spent.toFixed(2)}/$${this.config.costControl.maxCostPerDay}`
      );
    }
  }

  /**
   * Get log file path (use /tmp in production for writable filesystem)
   */
  private getLogFilePath(): string {
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;

    if (isProduction) {
      // Use /tmp directory in serverless environments (writable)
      return '/tmp/openai-costs.log';
    } else {
      // Use configured path in development
      return this.config.costControl.logFile;
    }
  }

  private async getTodaySpending(date: string): Promise<number> {
    try {
      const logFile = this.getLogFilePath();
      const content = await fs.readFile(logFile, 'utf-8');
      const lines = content.split('\n').filter(Boolean);

      let total = 0;
      for (const line of lines) {
        const [timestamp, , cost] = line.split(',');
        if (timestamp.startsWith(date)) {
          total += parseFloat(cost);
        }
      }

      return total;
    } catch (error) {
      // File doesn't exist yet
      return 0;
    }
  }

  private async recordCost(entry: CostEntry): Promise<void> {
    try {
      const logFile = this.getLogFilePath();
      const logDir = path.dirname(logFile);

      // Ensure log directory exists (ignore errors in production)
      await fs.mkdir(logDir, { recursive: true }).catch(() => {});

      const line = `${entry.timestamp.toISOString()},${entry.operation},${entry.cost},${entry.model},${entry.success ? 'success' : 'failed'},${entry.url || ''}\n`;
      await fs.appendFile(logFile, line);
    } catch (error) {
      // Don't fail the request if cost tracking fails
      console.warn('Cost tracking warning:', error);
    }
  }

  /**
   * Utility methods
   */
  private normalizeInstagramUrl(url: string): string {
    // Remove trailing slash, query params, etc.
    let normalized = url.trim().toLowerCase();
    normalized = normalized.replace(/\/$/, '');
    normalized = normalized.split('?')[0];
    normalized = normalized.split('#')[0];

    // Ensure https
    if (!normalized.startsWith('http')) {
      normalized = 'https://' + normalized;
    }

    return normalized;
  }

  private generateCacheKey(url: string): string {
    return crypto.createHash('sha256').update(url).digest('hex');
  }

  private detectLanguage(text: string): string {
    // Simple language detection based on common words
    const spanish = ['de', 'el', 'la', 'los', 'las', 'y', 'en'];
    const english = ['the', 'and', 'to', 'of', 'a', 'in'];
    const portuguese = ['de', 'o', 'a', 'os', 'as', 'e', 'em'];

    const words = text.toLowerCase().split(/\s+/);

    let esCount = 0;
    let enCount = 0;
    let ptCount = 0;

    words.forEach((word) => {
      if (spanish.includes(word)) esCount++;
      if (english.includes(word)) enCount++;
      if (portuguese.includes(word)) ptCount++;
    });

    if (esCount > enCount && esCount > ptCount) return 'Spanish';
    if (ptCount > enCount && ptCount > esCount) return 'Portuguese';
    return 'English';
  }

  private extractTopHashtags(posts: InstagramPost[]): string[] {
    const hashtagCounts: Record<string, number> = {};

    posts.forEach((post) => {
      const caption = post.caption || '';
      const hashtags = caption.match(/#[\w]+/g) || [];

      hashtags.forEach((tag) => {
        const normalized = tag.toLowerCase();
        hashtagCounts[normalized] = (hashtagCounts[normalized] || 0) + 1;
      });
    });

    return Object.entries(hashtagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag]) => tag);
  }

  private createMockDemographics(): AudienceDemographicsExtended {
    return {
      age: {
        '13-17': 5.0,
        '18-24': 35.0,
        '25-34': 40.0,
        '35-44': 15.0,
        '45-54': 4.0,
        '55+': 1.0,
      },
      gender: {
        male: 55.0,
        female: 45.0,
      },
      geography: [
        { country: 'Argentina', country_code: 'AR', percentage: 60.0 },
        { country: 'United States', country_code: 'US', percentage: 15.0 },
        { country: 'Mexico', country_code: 'MX', percentage: 10.0 },
        { country: 'Spain', country_code: 'ES', percentage: 8.0 },
        { country: 'Chile', country_code: 'CL', percentage: 7.0 },
      ],
      is_synthetic: false,
      inference_source: 'openai',
      model_used: 'mock',
      inferred_at: new Date(),
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Cleanup method
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
