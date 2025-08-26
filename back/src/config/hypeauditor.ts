export interface HypeAuditorSearchSort {
	field?: 'subscribers_count' | 'er' | 'username' | 'engagement_avg';
	order?: 'asc' | 'desc';
}

export interface HypeAuditorRange<T = number> {
	from?: T;
	to?: T;
}

export interface HypeAuditorGrowthRange {
	period?: '7d' | '30d' | '90d' | '180d' | '365d';
	from?: number;
	to?: number;
}

export interface HypeAuditorAudienceItem {
	id: string | number;
	prc: number; // 0-100
}

export interface HypeAuditorAudienceGeo {
	countries?: HypeAuditorAudienceItem[]; // id is ISO 3166 country code
	cities?: HypeAuditorAudienceItem[]; // id is geonames city id (int)
}

export interface HypeAuditorSearchFilters {
	social_network: 'instagram' | 'youtube' | 'tiktok' | 'twitter' | 'twitch';
	category?: { include?: number[]; exclude?: number[] };
	thematics?: { include?: number[]; exclude?: number[] };
	account_geo?: { country?: string[]; city?: number[] };
	account_gender?: 'male' | 'female';
	account_age?: HypeAuditorRange<number>;
	account_languages?: string[]; // two-letter language codes
	account_type?: 'brand' | 'human';
	account_has_contacts?: boolean;
	account_has_launched_advertising?: boolean;
	account_mentions?: { include?: string[]; exclude?: string[] };
	audience_geo?: HypeAuditorAudienceGeo;
	audience_age?: { groups: { key: '13_17' | '18_24' | '25_34' | '35_44' | '45_54' | '55_64' | '65'; prc: number }[] };
	audience_gender?: { gender: 'male' | 'female'; prc: number };
	subscribers_count?: HypeAuditorRange<number>;
	er?: HypeAuditorRange<number>; // 0-100
	aqs?: HypeAuditorRange<number>;
	cqs?: HypeAuditorRange<number>;
	last_media_time?: { from?: number };
	media_count?: HypeAuditorRange<number>;
	likes_count?: HypeAuditorRange<number>;
	alikes_avg?: HypeAuditorRange<number>;
	views_avg?: HypeAuditorRange<number>;
	comments_avg?: HypeAuditorRange<number>;
	shares_avg?: HypeAuditorRange<number>;
	reactions_rate?: { marks?: ('poor' | 'fair' | 'average' | 'good' | 'excellent')[] };
	comments_rate?: { marks?: ('poor' | 'fair' | 'average' | 'good' | 'excellent')[] };
	growth?: HypeAuditorGrowthRange;
	likes_growth_prc?: HypeAuditorGrowthRange;
	similar?: string; // username (IG), channel ID (YT), account ID (TT)
	verified?: 0 | 1;
	'blogger_prices.post_price'?: HypeAuditorRange<number>;
	income?: { id: '5k' | '10k' | '25k' | '50k' | '75k' | '100k' | '150k' | '200k'; prc: number };
	ethnicity?: { race: 'african' | 'arabian' | 'asian' | 'caucasian' | 'hispanic' | 'indian'; prc: number }[];
	interests?: { id: number; prc: number }[];
	username_exclude?: string[];
	twitch_active_days_per_week?: HypeAuditorRange<number>;
	twitch_games?: { period?: '7d' | '30d' | '90d' | '180d'; games?: number[] };
	twitch_hours_streamed?: HypeAuditorRange<number>;
	twitch_live_viewers_avg?: HypeAuditorRange<number>;
	twitter_likes?: HypeAuditorRange<number>;
	twitter_replies?: HypeAuditorRange<number>;
	twitter_retweet?: HypeAuditorRange<number>;
	twitter_tweet?: HypeAuditorRange<number>;
	reels_video_views_avg?: { from?: number };
	shorts_video_views_avg?: { from?: number };
	// New keyword fields
	search?: string[];
	search_content?: string[];
	search_description?: string[];
	// Paging and sort
	sort?: HypeAuditorSearchSort;
	page?: number; // default 1, 20 items per page
}

export interface HypeAuditorSearchRequest extends HypeAuditorSearchFilters {}

export interface HypeAuditorSearchResponse {
	queries_left?: number;
	page?: number;
	results?: any[];
	count?: number;
}

export const hypeAuditorConfig = {
	clientId: '360838',
	apiToken: '$2y$04$Ai3PO.ApJUZd2tSpIEvrwuJowWPOVY5DwCE4RNnTVTD6ayQHKtZh6',
	baseUrl: 'https://hypeauditor.com/api/method',
	endpoints: {
		search: '/auditor.search/',
		sandbox: '/auditor.searchSandbox/'
	}
};

export const createHypeAuditorHeaders = (clientId: string, apiToken: string) => ({
	'Content-Type': 'application/json',
	'X-Auth-Id': clientId,
	'X-Auth-Token': apiToken
});

export const validateHypeAuditorConfig = () => {
	if (!hypeAuditorConfig.clientId || !hypeAuditorConfig.apiToken) {
		throw new Error('Credenciales de HypeAuditor no configuradas');
	}
};
