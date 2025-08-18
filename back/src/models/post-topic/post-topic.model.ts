export interface PostTopic {
  id: string;
  post_id: string;
  topic_label: string;
  topic_description?: string;
  keywords: string[];
  relevance_score: number;
  confidence_score: number;
  comment_count: number;
  sentiment_distribution: {
    positive?: number;
    neutral?: number;
    negative?: number;
  };
  extracted_method: string;
  language_detected?: string;
  created_at: Date;
  updated_at: Date;
}

// Nuevos modelos para CreatorDB Topics/Niches
export interface CreatorDBTopic {
  name: string;
  category: string;
  channelCount: number;
}

export interface CreatorDBNiche {
  name: string;
  category: string;
  channelCount: number;
}

export interface CreatorDBTopicTableResponse {
  data: {
    platform: string;
    topics: Record<string, CreatorDBTopic>;
    niches: Record<string, CreatorDBNiche>;
  };
  quotaUsed: number;
  quotaUsedTotal: number;
  remainingPlanCredit: number;
  remainingPrepurchasedCredit: number;
  timestamp: number;
  error: string;
  success: boolean;
}

export interface TopicNicheCategory {
  id: string;
  name: string;
  category: string;
  channelCount: number;
  type: 'topic' | 'niche';
  platform: string;
}

export interface CreatePostTopicDTO {
  post_id: string;
  topic_label: string;
  topic_description?: string;
  keywords: string[];
  relevance_score: number;
  confidence_score: number;
  comment_count: number;
  sentiment_distribution: {
    positive?: number;
    neutral?: number;
    negative?: number;
  };
  extracted_method: string;
  language_detected?: string;
}

export interface UpdatePostTopicDTO {
  topic_label?: string;
  topic_description?: string;
  keywords?: string[];
  relevance_score?: number;
  confidence_score?: number;
  comment_count?: number;
  sentiment_distribution?: {
    positive?: number;
    neutral?: number;
    negative?: number;
  };
  extracted_method?: string;
  language_detected?: string;
}

export interface PostTopicsAnalysisResult {
  postId: string;
  topics: PostTopic[];
  summary: {
    totalTopics: number;
    highConfidenceTopics: number;
    averageRelevance: number;
    averageConfidence: number;
    languagesDetected: string[];
    totalComments: number;
    extractionMethod: string;
  };
  processingStats: {
    processingTimeMs: number;
    commentsProcessed: number;
    topicsExtracted: number;
    averageTimePerComment: number;
  };
} 