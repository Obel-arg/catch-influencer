import * as https from 'https';
import { promisify } from 'util';

// Interfaces específicas para Discovery
export interface DiscoverySearchRequest {
  social_network: 'instagram' | 'youtube' | 'tiktok' | 'twitter' | 'twitch';
  page?: number;
  search?: string[];
  search_content?: string[];
  niche_search?: string[];
  search_description?: string[];
  category?: { include?: number[]; exclude?: number[] };
  account_geo?: { country: string[] };
  account_gender?: 'male' | 'female';
  account_age?: { min: number; max: number };
  account_languages?: string[];
  account_type?: 'brand' | 'human';
  account_has_contacts?: boolean;
  account_has_launched_advertising?: boolean;
  account_mentions?: { include?: string[]; exclude?: string[] };
  subscribers_count?: { from: number; to: number };
  er?: { from: number; to: number };
  aqs?: { min: number; max: number };
  cqs?: { min: number; max: number };
  last_media_time?: { from: number };
  media_count?: { min: number; max: number };
  likes_count?: { min: number; max: number };
  alikes_avg?: { min: number; max: number };
  views_avg?: { min: number; max: number };
  comments_avg?: { min: number; max: number };
  shares_avg?: { min: number; max: number };
  growth?: { period: string; from: number; to: number };
  likes_growth_prc?: { period: string; from: number; to: number };
  verified?: number;
  blogger_prices?: { post_price: { min: number; max: number } };
  income?: { id: string; prc: number };
  ethnicity?: Array<{ race: string; prc: number }>;
  interests?: Array<{ id: number; prc: number }>;
  username_exclude?: string[];
  similar?: string;
  reels_video_views_avg?: { min: number; max: number };
  shorts_video_views_avg?: { min: number; max: number };
  twitch_active_days_per_week?: { min: number; max: number };
  twitch_hours_streamed?: { min: number; max: number };
  twitch_live_viewers_avg?: { min: number; max: number };
  twitch_games?: { period: string; games: number[] };
  twitter_likes?: { min: number; max: number };
  twitter_replies?: { min: number; max: number };
  twitter_retweet?: { min: number; max: number };
  twitter_tweet?: { min: number; max: number };
  sort?: { field: string; order: 'asc' | 'desc' };
  audience_age?: { groups: string[]; prc: number };
  audience_gender?: { gender: 'male' | 'female'; prc: number };
  audience_geo?: {
    countries?: Array<{ id: string; prc: number }>;
    cities?: Array<{ id: number; prc: number }>;
  };
}

export interface DiscoverySearchResult {
  basic: {
    username: string;
    title: string;
    avatar_url: string;
    id?: string;
  };
  metrics: {
    er?: { value: number };
    subscribers_count: { value: number };
    real_subscribers_count?: { value: number };
    likes_count?: { value: number };
    views_avg?: { value: number };
    comments_avg?: { value: number };
    shares_avg?: { value: number };
    reels_video_views_avg?: { value: number };
    shorts_video_views_avg?: { value: number };
  };
  features: {
    social_networks: Array<{
      type: string;
      title: string;
      social_id: string;
      username: string;
      avatar_url: string;
      subscribers_count: number;
      er: number;
      state: string;
    }>;
    aqs?: {
      data: {
        mark: string;
      };
    };
    cqs?: {
      data: {
        mark: string;
      };
    };
    search_content?: any[];
    // Campos adicionales que puede devolver HypeAuditor
    account_geo?: {
      country?: string;
      city?: string;
    };
    category?: Array<{
      id: number;
      title: string;
    }>;
    account_languages?: string[];
    verified?: boolean;
    account_type?: string;
    audience_geo?: {
      countries?: Array<{
        id: string;
        title: string;
        prc: number;
      }>;
    };
    audience_gender?: {
      male?: number;
      female?: number;
    };
    audience_age?: {
      groups?: Array<{
        code: string;
        title: string;
        prc: number;
      }>;
    };
  };
}

export interface DiscoveryResponse {
  result: {
    search_results: DiscoverySearchResult[];
    current_page: number;
    total_pages: number;
    queries_left: number;
  };
}

export interface ExplorerFilters {
  // Búsqueda básica
  searchQuery?: string;
  platform?: string;
  st?: string;
  search?: string;

  // Filtros de audiencia
  minFollowers?: number;
  maxFollowers?: number;
  minEngagement?: number;
  maxEngagement?: number;

  // Ubicación
  location?: string;

  // Categorías
  selectedCategories?: string[];

  // 🎯 NUEVO: Categorías del taxonomy de HypeAuditor
  taxonomyCategories?: {
    include: string[];
    exclude: string[];
  };

  // Crecimiento
  selectedGrowthRate?: { min: number; max: number; period?: string };

  // Métricas avanzadas
  aqs?: { min: number; max: number };
  cqs?: { min: number; max: number };

  // Ordenamiento
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';

  // Paginación
  page?: number;
  size?: number;

  // Filtros adicionales
  accountType?: 'brand' | 'human';
  verified?: boolean;
  hasContacts?: boolean;
  hasLaunchedAdvertising?: boolean;

  // Búsqueda por contenido
  searchContent?: string[];
  searchDescription?: string[];

  // Filtros de audiencia (formato del frontend)
  audienceAge?: { minAge: number; maxAge: number; percentage: number };
  audienceGender?: { gender: 'male' | 'female' | 'any'; percentage: number };
  audienceGeo?: {
    countries: { [key: string]: number };
    cities: { [key: string]: number };
  };

  // Precios
  bloggerPrices?: { min: number; max: number };

  // Última actividad
  lastMediaTime?: { from: number };

  // Conteos
  mediaCount?: { min: number; max: number };
  likesCount?: { min: number; max: number };

  // Promedios
  likesAvg?: { min: number; max: number };
  viewsAvg?: { min: number; max: number };
  commentsAvg?: { min: number; max: number };
  sharesAvg?: { min: number; max: number };

  // Crecimiento de likes
  likesGrowthPrc?: { min: number; max: number; period?: string };

  // Filtros específicos por plataforma
  reelsVideoViewsAvg?: { min: number; max: number };
  shortsVideoViewsAvg?: { min: number; max: number };

  // Filtros de Twitch
  twitchActiveDaysPerWeek?: { min: number; max: number };
  twitchHoursStreamed?: { min: number; max: number };
  twitchLiveViewersAvg?: { min: number; max: number };
  twitchGames?: { period: string; games: number[] };

  // Filtros de Twitter
  twitterLikes?: { min: number; max: number };
  twitterReplies?: { min: number; max: number };
  twitterRetweet?: { min: number; max: number };
  twitterTweet?: { min: number; max: number };

  // Filtros de Instagram
  accountAge?: { min: number; max: number };
  accountGender?: 'male' | 'female';
  accountLanguages?: string[];
  accountMentions?: {
    include?: string[];
    exclude?: string[];
  };

  // Filtros de ingresos y etnicidad (solo Instagram)
  income?: { id: string; prc: number };
  ethnicity?: Array<{ race: string; prc: number }>;
  interests?: Array<{ id: number; prc: number }>;

  // Exclusión de usuarios
  usernameExclude?: string[];

  // Búsqueda similar
  similar?: string;
}

export interface ExplorerResult {
  creatorId: string;
  name: string;
  avatar: string;
  isVerified: boolean;
  contentNiches?: string[];
  country?: string;
  socialPlatforms: Array<{
    platform: string;
    username: string;
  }>;
  platformInfo?: Record<string, any>;
  language?: string;
  metrics?: {
    engagementRate: number;
    realFollowers?: number;
    likesCount?: number;
    viewsAvg?: number;
    commentsAvg?: number;
    sharesAvg?: number;
    aqs?: string;
    cqs?: string;
  };
  audienceData?: {
    genderDistribution?: {
      male?: number;
      female?: number;
    };
    topCountries?: Array<{
      id: string;
      title: string;
      prc: number;
    }>;
    ageGroups?: Array<{
      code: string;
      title: string;
      prc: number;
    }>;
  };
}

export interface ExplorerSearchResponse {
  success: boolean;
  items: ExplorerResult[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  queriesLeft: number;
  provider: string;
  metadata?: {
    searchTime: number;
    filtersApplied: string[];
    cacheHit?: boolean;
    mode?: string;
    query?: string;
    platform?: string;
  };
}

export class HypeAuditorDiscoveryService {
  private static instance: HypeAuditorDiscoveryService;
  private readonly baseUrl = 'https://hypeauditor.com';

  // Credenciales de HypeAuditor (usar env vars o fallback)
  private readonly CLIENT_ID = process.env.HYPEAUDITOR_CLIENT_ID || '2694138';
  private readonly API_TOKEN = process.env.HYPEAUDITOR_API_TOKEN || '$2y$04$27ZuGEARpPSjtwdBhJnf6OYuZKqTxKFkGi723IpY4MxJefff3Lgsa';

  private constructor() {
    console.log('[HypeAuditor Discovery] Initialized with:', {
      clientId: this.CLIENT_ID,
      hasToken: !!this.API_TOKEN,
      tokenPreview: this.API_TOKEN?.substring(0, 20) + '...'
    });
  }

  // Función helper para hacer peticiones HTTPS
  private async makeHttpsRequest(endpoint: string, data?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const postData = data ? JSON.stringify(data) : '';

      const options = {
        hostname: 'hypeauditor.com',
        port: 443,
        path: endpoint,
        method: data ? 'POST' : 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Id': this.CLIENT_ID,
          'X-Auth-Token': this.API_TOKEN,
          ...(data && { 'Content-Length': Buffer.byteLength(postData) }),
        },
      };

      console.log(`[HypeAuditor] Making request to: ${options.method} https://${options.hostname}${options.path}`);
      console.log(`[HypeAuditor] Auth headers: X-Auth-Id=${this.CLIENT_ID}, X-Auth-Token=${this.API_TOKEN.substring(0, 20)}...`);
      if (data) {
        console.log(`[HypeAuditor] Request body:`, JSON.stringify(data, null, 2).substring(0, 500));
      }

      const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          try {
            // Log the response status and first 500 chars for debugging
            console.log(`[HypeAuditor] Response status: ${res.statusCode}`);
            console.log(`[HypeAuditor] Response headers:`, res.headers);
            console.log(`[HypeAuditor] Response preview:`, responseData.substring(0, 500));

            // Check if response is HTML (error page)
            if (responseData.trim().startsWith('<!DOCTYPE') || responseData.trim().startsWith('<html')) {
              reject(new Error(`HypeAuditor API returned HTML error page instead of JSON. Status: ${res.statusCode}. This usually means authentication failed or the API endpoint is incorrect.`));
              return;
            }

            const response = JSON.parse(responseData);
            resolve(response);
          } catch (error: any) {
            console.error(`[HypeAuditor] Failed to parse response. Raw response:`, responseData.substring(0, 1000));
            reject(new Error(`Error parsing response: ${error.message}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`Request failed: ${error.message}`));
      });

      if (data) {
        req.write(postData);
      }
      req.end();
    });
  }

  public static getInstance(): HypeAuditorDiscoveryService {
    if (!HypeAuditorDiscoveryService.instance) {
      HypeAuditorDiscoveryService.instance = new HypeAuditorDiscoveryService();
    }
    return HypeAuditorDiscoveryService.instance;
  }

  /**
   * Realiza una búsqueda de discovery (producción)
   */
  async searchDiscovery(
    request: DiscoverySearchRequest,
  ): Promise<DiscoveryResponse> {
    try {
      const response = await this.makeHttpsRequest(
        '/api/method/auditor.search',
        request,
      );

      // 🔍 LOG: Complete response structure for username debugging
      console.log('🔍 [HypeAuditor Discovery] FULL RESPONSE:', JSON.stringify(response, null, 2));

      // Log first result to see structure clearly
      if (response?.result?.items && response.result.items.length > 0) {
        console.log('🔍 [HypeAuditor Discovery] FIRST ITEM STRUCTURE:', JSON.stringify(response.result.items[0], null, 2));
      }

      return response;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async searchSuggestion(
    search: string | string[],
    st?: string,
  ): Promise<any> {
    try {
      // Build query parameters
      const searchParam = Array.isArray(search) ? search[0] : search;
      const queryParams = new URLSearchParams({
        search: searchParam,
        ...(st && { st }),
      });

      const endpoint = `/api/method/auditor.suggester?${queryParams.toString()}`;
      const response = await this.makeHttpsRequest(endpoint);

      return response;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  /**
   * Transforma los filtros del Explorer al formato de HypeAuditor
   */
  transformExplorerFiltersToHypeAuditor(
    filters: ExplorerFilters,
  ): DiscoverySearchRequest {
    const hypeAuditorRequest: DiscoverySearchRequest = {
      social_network: this.mapPlatformToHypeAuditor(filters.platform || 'all'),
      page: filters.page || 1,
    };

    // Búsqueda por texto
    if (filters.searchQuery) {
      hypeAuditorRequest.search = [filters.searchQuery];
    }

    // Búsqueda por contenido
    if (filters.searchContent && filters.searchContent.length > 0) {
      hypeAuditorRequest.search_content = filters.searchContent;
    }

    // Búsqueda por descripción
    if (filters.searchDescription && filters.searchDescription.length > 0) {
      hypeAuditorRequest.search_description = filters.searchDescription;
    }

    // 🎯 CATEGORÍAS DEL TAXONOMY DE HYPEAUDITOR
    if (filters.taxonomyCategories) {
      const includeIds =
        filters.taxonomyCategories.include
          ?.map((id) => parseInt(id))
          .filter((id) => !isNaN(id)) || [];
      const excludeIds =
        filters.taxonomyCategories.exclude
          ?.map((id) => parseInt(id))
          .filter((id) => !isNaN(id)) || [];

      if (includeIds.length > 0 || excludeIds.length > 0) {
        hypeAuditorRequest.category = {};
        if (includeIds.length > 0) {
          hypeAuditorRequest.category.include = includeIds;
        }
        if (excludeIds.length > 0) {
          hypeAuditorRequest.category.exclude = excludeIds;
        }
      }
    }

    // 📊 CATEGORÍAS LEGACY (para compatibilidad hacia atrás)
    else if (
      filters.selectedCategories &&
      filters.selectedCategories.length > 0
    ) {
      // Enviar IDs numéricos a category.include y nombres como niche_search
      const numericIds = filters.selectedCategories
        .map((cat) => parseInt(cat, 10))
        .filter((id) => !isNaN(id));
      const nicheNames = filters.selectedCategories.filter(
        (cat) =>
          isNaN(parseInt(cat as any, 10)) &&
          typeof cat === 'string' &&
          cat.trim().length > 0,
      );

      if (numericIds.length > 0) {
        hypeAuditorRequest.category = { include: numericIds };
      }

      if (nicheNames.length > 0) {
        hypeAuditorRequest.niche_search = nicheNames as string[];
      }
    }

    // Ubicación de la cuenta
    if (filters.location && filters.location !== 'all') {
      hypeAuditorRequest.account_geo = {
        country: [filters.location],
      };
    }

    // Género de la cuenta (solo Instagram y TikTok)
    if (filters.accountGender) {
      hypeAuditorRequest.account_gender = filters.accountGender;
    }

    // Edad de la cuenta (solo Instagram)
    if (filters.accountAge) {
      hypeAuditorRequest.account_age = filters.accountAge;
    }

    // Idiomas de la cuenta
    if (filters.accountLanguages && filters.accountLanguages.length > 0) {
      hypeAuditorRequest.account_languages = filters.accountLanguages;
    }

    // Tipo de cuenta (solo Instagram)
    if (filters.accountType) {
      hypeAuditorRequest.account_type = filters.accountType;
    }

    // Tiene contactos
    // if (filters.hasContacts !== undefined) {
    // 	hypeAuditorRequest.account_has_contacts = filters.hasContacts;
    // }

    // Ha lanzado publicidad
    if (filters.hasLaunchedAdvertising !== undefined) {
      hypeAuditorRequest.account_has_launched_advertising =
        filters.hasLaunchedAdvertising;
    }

    // Menciones de cuenta (solo Instagram y TikTok)
    if (filters.accountMentions) {
      hypeAuditorRequest.account_mentions = filters.accountMentions;
    }

    // Seguidores
    if (filters.minFollowers || filters.maxFollowers) {
      hypeAuditorRequest.subscribers_count = {
        from: filters.minFollowers || 0,
        to: filters.maxFollowers || 100000000,
      };
    }

    // Engagement rate
    if (filters.minEngagement || filters.maxEngagement) {
      hypeAuditorRequest.er = {
        from: filters.minEngagement || 0,
        to: filters.maxEngagement || 100,
      };
    }

    // AQS (Audience Quality Score)
    if (filters.aqs) {
      hypeAuditorRequest.aqs = filters.aqs;
    }

    // CQS (Channel Quality Score) - solo YouTube
    if (filters.cqs && hypeAuditorRequest.social_network === 'youtube') {
      hypeAuditorRequest.cqs = filters.cqs;
    }

    // Última actividad
    if (filters.lastMediaTime) {
      hypeAuditorRequest.last_media_time = filters.lastMediaTime;
    }

    // Conteo de medios
    if (filters.mediaCount) {
      hypeAuditorRequest.media_count = filters.mediaCount;
    }

    // Conteo de likes
    if (filters.likesCount) {
      hypeAuditorRequest.likes_count = filters.likesCount;
    }

    // Promedios
    if (filters.likesAvg) {
      hypeAuditorRequest.alikes_avg = filters.likesAvg;
    }

    if (filters.viewsAvg) {
      hypeAuditorRequest.views_avg = filters.viewsAvg;
    }

    if (filters.commentsAvg) {
      hypeAuditorRequest.comments_avg = filters.commentsAvg;
    }

    if (filters.sharesAvg) {
      hypeAuditorRequest.shares_avg = filters.sharesAvg;
    }

    // Crecimiento
    if (filters.selectedGrowthRate) {
      hypeAuditorRequest.growth = {
        period: filters.selectedGrowthRate.period || '30d',
        from: filters.selectedGrowthRate.min,
        to: filters.selectedGrowthRate.max,
      };
    }

    // Crecimiento de likes (solo TikTok)
    if (
      filters.likesGrowthPrc &&
      hypeAuditorRequest.social_network === 'tiktok'
    ) {
      hypeAuditorRequest.likes_growth_prc = {
        period: filters.likesGrowthPrc.period || '30d',
        from: filters.likesGrowthPrc.min,
        to: filters.likesGrowthPrc.max,
      };
    }

    // Verificación
    if (filters.verified !== undefined) {
      hypeAuditorRequest.verified = filters.verified ? 1 : 0;
    }

    // Precios de blogger
    if (filters.bloggerPrices) {
      hypeAuditorRequest['blogger_prices'] = {
        post_price: filters.bloggerPrices,
      };
    }

    // Ingresos (solo Instagram)
    if (filters.income && hypeAuditorRequest.social_network === 'instagram') {
      hypeAuditorRequest.income = filters.income;
    }

    // Etnicidad (solo Instagram)
    if (
      filters.ethnicity &&
      hypeAuditorRequest.social_network === 'instagram'
    ) {
      hypeAuditorRequest.ethnicity = filters.ethnicity;
    }

    // Intereses (solo Instagram)
    if (
      filters.interests &&
      hypeAuditorRequest.social_network === 'instagram'
    ) {
      hypeAuditorRequest.interests = filters.interests;
    }

    // Exclusión de usuarios
    if (filters.usernameExclude && filters.usernameExclude.length > 0) {
      hypeAuditorRequest.username_exclude = filters.usernameExclude;
    }

    // Búsqueda similar
    if (filters.similar) {
      hypeAuditorRequest.similar = filters.similar;
    }

    // Filtros específicos de Instagram
    if (
      filters.reelsVideoViewsAvg &&
      hypeAuditorRequest.social_network === 'instagram'
    ) {
      hypeAuditorRequest.reels_video_views_avg = filters.reelsVideoViewsAvg;
    }

    // Filtros específicos de YouTube
    if (
      filters.shortsVideoViewsAvg &&
      hypeAuditorRequest.social_network === 'youtube'
    ) {
      hypeAuditorRequest.shorts_video_views_avg = filters.shortsVideoViewsAvg;
    }

    // Filtros específicos de Twitch
    if (
      filters.twitchActiveDaysPerWeek &&
      hypeAuditorRequest.social_network === 'twitch'
    ) {
      hypeAuditorRequest.twitch_active_days_per_week =
        filters.twitchActiveDaysPerWeek;
    }

    if (
      filters.twitchHoursStreamed &&
      hypeAuditorRequest.social_network === 'twitch'
    ) {
      hypeAuditorRequest.twitch_hours_streamed = filters.twitchHoursStreamed;
    }

    if (
      filters.twitchLiveViewersAvg &&
      hypeAuditorRequest.social_network === 'twitch'
    ) {
      hypeAuditorRequest.twitch_live_viewers_avg = filters.twitchLiveViewersAvg;
    }

    if (filters.twitchGames && hypeAuditorRequest.social_network === 'twitch') {
      hypeAuditorRequest.twitch_games = filters.twitchGames;
    }

    // Filtros específicos de Twitter
    if (
      filters.twitterLikes &&
      hypeAuditorRequest.social_network === 'twitter'
    ) {
      hypeAuditorRequest.twitter_likes = filters.twitterLikes;
    }

    if (
      filters.twitterReplies &&
      hypeAuditorRequest.social_network === 'twitter'
    ) {
      hypeAuditorRequest.twitter_replies = filters.twitterReplies;
    }

    if (
      filters.twitterRetweet &&
      hypeAuditorRequest.social_network === 'twitter'
    ) {
      hypeAuditorRequest.twitter_retweet = filters.twitterRetweet;
    }

    if (
      filters.twitterTweet &&
      hypeAuditorRequest.social_network === 'twitter'
    ) {
      hypeAuditorRequest.twitter_tweet = filters.twitterTweet;
    }

    // Ordenamiento
    if (filters.sortBy) {
      hypeAuditorRequest.sort = {
        field: this.mapSortField(filters.sortBy),
        order: filters.sortOrder || 'desc',
      };
    }

    // Filtros de audiencia - Mapear al formato HypeAuditor
    // Si viene ya formateado como {groups: string[], prc: number}, enviarlo directamente
    if ((filters as any).audience_age) {
      if (typeof (filters as any).audience_age === 'object' && !Array.isArray((filters as any).audience_age) && (filters as any).audience_age.groups) {
        // Ya viene en formato {groups: string[], prc: number}
        hypeAuditorRequest.audience_age = (filters as any).audience_age;
      } else if (Array.isArray((filters as any).audience_age)) {
        // Si viene como array de rangos [{from, to, prc}], enviarlo directamente
        hypeAuditorRequest.audience_age = (filters as any).audience_age;
      }
    } else if (filters.audienceAge) {
      // Formato legacy con minAge, maxAge, percentage - convertir a grupos
      const ageGroups = this.mapAgeRangeToGroups(
        filters.audienceAge.minAge,
        filters.audienceAge.maxAge,
      );
      hypeAuditorRequest.audience_age = {
        groups: ageGroups,
        prc: filters.audienceAge.percentage,
      };
    }

    // Mapear audience_geo - Si viene ya formateado, enviarlo directamente
    if ((filters as any).audience_geo && typeof (filters as any).audience_geo === 'object') {
      // Ya viene en formato {countries: Array<{id, prc}>, cities: Array<{id, prc}>}
      hypeAuditorRequest.audience_geo = (filters as any).audience_geo;
    } else if ((filters as any).audience_location) {
      // Mapear audience_location -> audience_geo (similar a account_geo)
      const locs = (filters as any).audience_location as Array<{ id: any; type?: number; prc?: number }>;
      const audienceGeo: any = {};
      const countries: Array<{ id: string; prc: number }> = [];
      const cities: Array<{ id: number; prc: number }> = [];
      
      for (const loc of locs) {
        const prc = typeof loc.prc === 'number' ? loc.prc : 0;
        
        if (loc.type === 0) {
          // type 0 = city (solo disponible para Instagram)
          if (hypeAuditorRequest.social_network === 'instagram') {
            const cityId = typeof loc.id === 'string' ? parseInt(loc.id, 10) : Number(loc.id);
            if (!isNaN(cityId)) {
              cities.push({ id: cityId, prc });
            }
          }
        } else {
          // type != 0 = country (ISO 3166 two-letter code)
          const countryId = typeof loc.id === 'string' ? loc.id : String(loc.id || '');
          // Validar que sea código de 2 letras (opcional, pero mejor validar)
          if (countryId && countryId.length === 2) {
            countries.push({ id: countryId.toUpperCase(), prc });
          }
        }
      }
      
      if (countries.length > 0) {
        audienceGeo.countries = countries;
      }
      if (cities.length > 0) {
        audienceGeo.cities = cities;
      }
      
      if (countries.length > 0 || cities.length > 0) {
        hypeAuditorRequest.audience_geo = audienceGeo;
      }
    }

    if (filters.audienceGender && filters.audienceGender.gender !== 'any') {
      // Mapear gender con porcentaje correcto
      hypeAuditorRequest.audience_gender = {
        gender: filters.audienceGender.gender as 'male' | 'female',
        prc: filters.audienceGender.percentage,
      };
    }

    // Solo procesar audienceGeo (camelCase) si no se procesó audience_geo (snake_case) arriba
    if (!hypeAuditorRequest.audience_geo && filters.audienceGeo) {
      // Mapear países y ciudades al formato array de HypeAuditor
      const audienceGeo: any = {};

      if (Object.keys(filters.audienceGeo.countries).length > 0) {
        audienceGeo.countries = Object.entries(
          filters.audienceGeo.countries,
        ).map(([countryCode, percentage]) => ({
          id: countryCode,
          prc: percentage,
        }));
      }

      if (Object.keys(filters.audienceGeo.cities).length > 0) {
        audienceGeo.cities = Object.entries(filters.audienceGeo.cities).map(
          ([cityId, percentage]) => ({
            id: parseInt(cityId),
            prc: percentage,
          }),
        );
      }

      if (audienceGeo.countries || audienceGeo.cities) {
        hypeAuditorRequest.audience_geo = audienceGeo;
      }
    }

    console.log('Request sent to HypeAuditor', hypeAuditorRequest);
    return hypeAuditorRequest;
  }

  transformHypeAuditorSuggestionToExplorer(
    response: any,
  ): ExplorerSearchResponse {
    // Mapear los datos del suggester (que usa 'list' en lugar de 'search_results')
    // y tienen una estructura diferente en la raíz del elemento
    const items: ExplorerResult[] = (response.result?.list || []).map(
      (item: any, index: number) => {
        // Mapear redes sociales desde social_networks
        const rawNetworks = item.social_networks || [];
        const mappedNetworks = rawNetworks
          .filter((n: any) => {
            // Filter to only include Instagram, TikTok, and YouTube
            const platformType = (n.type || '').toLowerCase();
            return ['instagram', 'tiktok', 'youtube'].includes(platformType);
          })
          .map((n: any) => ({
            platform: (n.type || '').toLowerCase(),
            username: n.username || '',
            followers: n.subscribers_count || 0,
            engagement: typeof n.er === 'number' ? n.er : 0,
            _raw: {
              socialId: n.social_id,
              title: n.title,
              avatarUrl: n.avatar_url,
              state: n.state,
            },
          }));

        // Elegir plataforma principal por mayor cantidad de seguidores
        const sortedByFollowers = [...mappedNetworks].sort(
          (a, b) => (b.followers || 0) - (a.followers || 0),
        );
        const mainNetwork = sortedByFollowers[0];

        // Extraer seguidores del nivel superior del item
        const followers = item.subscribers_count || mainNetwork?.followers || 0;

        // Calcular engagement rate promedio de todas las plataformas sociales
        const validEngagementRates = mappedNetworks
          .map((n: { engagement: number }) => n.engagement)
          .filter((eng: number) => typeof eng === 'number' && eng > 0);
        const averageEngagement = validEngagementRates.length > 0
          ? validEngagementRates.reduce((a: number, b: number) => a + b, 0) / validEngagementRates.length
          : 0;

        // Determinar plataforma principal dinámicamente
        const platform =
          mainNetwork?.platform ||
          rawNetworks[0]?.type?.toLowerCase() ||
          item.type?.toLowerCase() ||
          'instagram';

        // Extraer ubicación/país (suggestion response may not have account_geo)
        const country = (item as any).account_geo?.country || undefined;

        // Crear el objeto en el formato que espera la tabla del Explorer
        return {
          // IDs y básicos
          id: item.username || `user_${index}`,
          creatorId: item.username || item.user_id || `user_${index}`,
          name: item.title || item.username || 'Sin nombre',
          avatar: item.avatar_url || '',
          isVerified: item.is_verified || false,

          // Campos que usa directamente la tabla
          followersCount: followers,
          averageEngagementRate: averageEngagement / 100, // Convertir a decimal
          location: country,
          language: undefined,
          categories: [],

          // Plataforma principal
          mainSocialPlatform: platform,

          // Estructura completa para compatibilidad
          contentNiches: [],
          country: country,
          socialPlatforms:
            mappedNetworks.length > 0
              ? mappedNetworks
                  .sort(
                    (a: { followers: any }, b: { followers: any }) =>
                      (b.followers || 0) - (a.followers || 0),
                  )
                  .map((n: { platform: any; username: any }) => ({
                    platform: n.platform,
                    username: n.username,
                  }))
              : [{ platform, username: item.username || '' }],
          platformInfo: {
            state: item.is_private ? 'private' : 'active',
            socialNetworks: mappedNetworks.map(
              (n: {
                platform: any;
                username: any;
                followers: any;
                engagement: any;
                _raw: any;
              }) => ({
                platform: n.platform,
                username: n.username,
                followers: n.followers,
                engagement: n.engagement,
                ...n._raw,
              }),
            ),
          },
          metrics: {
            engagementRate: averageEngagement,
            realFollowers: undefined,
          },
          // Datos adicionales
          audienceData: undefined,
        };
      },
    );

    // Ordenar por cantidad de seguidores (descendente)
    const sortedItems = items.sort((a, b) => {
      const aFollowers = (a as any).followersCount || 0;
      const bFollowers = (b as any).followersCount || 0;
      return bFollowers - aFollowers;
    });

    return {
      success: true,
      items: sortedItems,
      totalCount: sortedItems.length,
      currentPage: 1,
      totalPages: 1,
      queriesLeft: response.result?.queries_left || 0,
      provider: 'HypeAuditor',
      metadata: {
        searchTime: Date.now(),
        filtersApplied: [],
        cacheHit: false,
        mode: 'suggester',
      },
    };
  }

  /**
   * Transforma la respuesta de HypeAuditor al formato del Explorer
   */
  transformHypeAuditorResponseToExplorer(
    response: DiscoveryResponse,
  ): ExplorerSearchResponse {
    // Debug: Log para ver qué datos devuelve HypeAuditor
    if (response.result.search_results.length > 0) {
    }

    const items: ExplorerResult[] = response.result.search_results.map(
      (item, index) => {
        // Log individual para cada resultado - usando los campos reales

        // Mapear redes sociales completas desde features.social_networks
        const rawNetworks = item.features?.social_networks || [];
        const mappedNetworks = rawNetworks
          .filter((n) => {
            // Filter to only include Instagram, TikTok, and YouTube
            const platformType = (n.type || '').toLowerCase();
            return ['instagram', 'tiktok', 'youtube'].includes(platformType);
          })
          .map((n) => ({
            platform: (n.type || '').toLowerCase(),
            username: n.username || '',
            followers: n.subscribers_count || 0,
            engagement: typeof n.er === 'number' ? n.er : 0,
            _raw: {
              socialId: n.social_id,
              title: n.title,
              avatarUrl: n.avatar_url,
              state: n.state,
            },
          }));

        // Elegir plataforma principal por mayor cantidad de seguidores
        const sortedByFollowers = [...mappedNetworks].sort(
          (a, b) => (b.followers || 0) - (a.followers || 0),
        );
        const mainNetwork = sortedByFollowers[0];

        // Extraer seguidores/engagement si no hay redes
        const fallbackFollowers = item.metrics?.subscribers_count?.value || 0;
        const fallbackEngagementRate = item.metrics?.er?.value || 0;
        const followers = mainNetwork?.followers ?? fallbackFollowers;
        const realFollowers = item.metrics?.real_subscribers_count?.value || 0;
        const engagementRate =
          mainNetwork?.engagement ?? fallbackEngagementRate;

        // Mapear topics a categorías (necesitaremos un mapeo de IDs a nombres)
        const topicIds = (item.features as any)?.blogger_topics?.data || [];
        const contentNiches = topicIds.map((id: any) => `Topic ${id}`); // Temporal hasta tener el mapeo real

        // Determinar plataforma principal dinámicamente
        const platform =
          mainNetwork?.platform ||
          rawNetworks[0]?.type?.toLowerCase() ||
          'instagram';

        // Extraer ubicación/país desde account_geo
        const accountGeo = item.features?.account_geo;
        const country = accountGeo?.country || undefined;

        // Crear el objeto en el formato que espera la tabla del Explorer
        return {
          // IDs y básicos
          id: item.basic?.username || `user_${index}`,
          creatorId: item.basic?.username || `user_${index}`,
          name: item.basic?.title || item.basic?.username || 'Sin nombre',
          avatar: item.basic?.avatar_url || '',
          isVerified: false,

          // Campos que usa directamente la tabla
          followersCount: followers, // ✅ Campo que lee la tabla
          averageEngagementRate: engagementRate / 100, // ✅ Campo que lee la tabla (convertir a decimal)
          location: country, // ✅ Extract from account_geo
          language: undefined, // No disponible en la respuesta
          categories: contentNiches,

          // Plataforma principal
          mainSocialPlatform: platform,

          // Estructura completa para compatibilidad
          contentNiches: contentNiches,
          country: country, // ✅ Extract from account_geo
          socialPlatforms:
            mappedNetworks.length > 0
              ? mappedNetworks
                  .sort((a, b) => (b.followers || 0) - (a.followers || 0))
                  .map((n) => ({ platform: n.platform, username: n.username }))
              : [{ platform, username: item.basic?.username || '' }],
          platformInfo: {
            state: 'active',
            aqs: item.features?.aqs?.data?.mark,
            socialNetworks: mappedNetworks.map((n) => ({
              platform: n.platform,
              username: n.username,
              followers: n.followers,
              engagement: n.engagement,
              ...n._raw,
            })),
          },
          metrics: {
            engagementRate: engagementRate,
            realFollowers: realFollowers,
            aqs: item.features?.aqs?.data?.mark,
            cqs: item.features?.cqs?.data?.mark,
          },
          // Datos adicionales
          audienceData: undefined,
        };
      },
    );

    // Ordenar por cantidad de seguidores (descendente)
    const sortedItems = items.sort((a, b) => {
      const aFollowers = (a as any).followersCount || 0;
      const bFollowers = (b as any).followersCount || 0;
      return bFollowers - aFollowers;
    });

    return {
      success: true,
      items: sortedItems,
      totalCount: response.result.total_pages * 20, // 20 items por página
      currentPage: response.result.current_page,
      totalPages: response.result.total_pages,
      queriesLeft: response.result.queries_left,
      provider: 'HypeAuditor',
      metadata: {
        searchTime: Date.now(),
        filtersApplied: [],
        cacheHit: false,
      },
    };
  }

  /**
   * Mapea la plataforma del Explorer a la plataforma de HypeAuditor
   */
  private mapPlatformToHypeAuditor(
    platform: string,
  ): 'instagram' | 'youtube' | 'tiktok' | 'twitter' | 'twitch' {
    switch (platform.toLowerCase()) {
      case 'instagram':
      case 'ig':
        return 'instagram';
      case 'youtube':
      case 'yt':
        return 'youtube';
      case 'tiktok':
      case 'tt':
        return 'tiktok';
      case 'twitter':
      case 'x':
        return 'twitter';
      case 'twitch':
        return 'twitch';
      default:
        return 'instagram'; // Por defecto Instagram
    }
  }

  /**
   * Mapea el campo de ordenamiento del Explorer al campo de HypeAuditor
   */
  private mapSortField(sortBy: string): string {
    switch (sortBy) {
      case 'followers':
        return 'subscribers_count';
      case 'engagement':
        return 'er';
      case 'username':
        return 'username';
      default:
        return 'subscribers_count';
    }
  }

  /**
   * Mapea un rango de edad a los grupos de edad de HypeAuditor
   */
  private mapAgeRangeToGroups(minAge: number, maxAge: number): string[] {
    const availableGroups = [
      '13-17',
      '18-24',
      '25-34',
      '35-44',
      '45-54',
      '55-64',
      '65+',
    ];

    const selectedGroups: string[] = [];

    for (const group of availableGroups) {
      const [groupMin, groupMax] = group.includes('+')
        ? [parseInt(group.replace('+', '')), 100]
        : group.split('-').map(Number);

      // Si hay intersección entre el rango solicitado y el grupo
      if (minAge <= groupMax && maxAge >= groupMin) {
        selectedGroups.push(group);
      }
    }

    return selectedGroups.length > 0 ? selectedGroups : ['18-24']; // Default group si no hay intersección
  }

  /**
   * Obtiene la taxonomía de categorías de HypeAuditor
   */
  async getTaxonomy(): Promise<any> {
    try {
      const response = await this.makeHttpsRequest(
        '/api/method/auditor.taxonomy',
      );

      return response;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  /**
   * Busca posts por keywords
   */
  async searchKeywordsPosts(
    socialNetwork: string,
    contentIds: string[],
  ): Promise<any> {
    try {
      const contentIdsString = contentIds.join(',');
      const endpoint = `/api/method/auditor.searchKeywordsPosts/?socialNetwork=${socialNetwork}&contentIds=${contentIdsString}`;

      const response = await this.makeHttpsRequest(endpoint);

      return response;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}
