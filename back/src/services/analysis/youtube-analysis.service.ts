import axios from 'axios';
import { youtubeConfig } from '../../config/youtube.config';
import { multilingualRobertaSentimentService, MultilingualRobertaSentimentResult } from './multilingual-roberta-sentiment.service';
import { openAISentimentService, HybridSentimentResult } from './openai-sentiment.service';
import { postgresCacheService } from '../cache/postgres-cache.service';
import { apifyTikTokService, TikTokComment } from './apify-tiktok.service';
import { apifyTwitterService, TwitterComment } from './apify-twitter.service';
import { google } from 'googleapis';

const YOUTUBE_API_KEY = youtubeConfig.apiKey; 
const youtube = google.youtube({ version: 'v3', auth: YOUTUBE_API_KEY });

// --- INTERFACES ---
export interface YouTubeComment { id: string; text: string; author: string; publishedAt: string; likeCount: number; replyCount: number; }
export interface SentimentResult { label: string; score: number; confidence: number; method: string; rawScores?: { negative: number; neutral: number; positive: number; }; }
export interface CommentWithSentiment extends YouTubeComment { sentiment: SentimentResult; }
export interface YouTubeAnalysisResult { videoId: string; videoTitle: string; totalComments: number; analyzedComments: number; comments: CommentWithSentiment[]; sentimentSummary: { positive: number; negative: number; neutral: number; positivePercentage: number; negativePercentage: number; neutralPercentage: number; }; platform?: string; }
export interface OptimizedAnalysisResult extends Omit<YouTubeAnalysisResult, 'commentsSample'> { comments: CommentWithSentiment[]; processingStats: { totalProcessed: number; processingTimeMs: number; batchesProcessed: number; averageProcessingTimePerComment: number; modelInfo?: { name: string; method: string; accuracy: string; }; }; source?: 'cache' | 'live'; }

function withTimeout<T>(promise: Promise<T>, ms: number, errorMessage: string): Promise<T> {
  const timeout = new Promise<T>((_, reject) =>
    setTimeout(() => reject(new Error(errorMessage)), ms)
  );
  return Promise.race([promise, timeout]);
}

export class YouTubeAnalysisService {
  
  // --- EXTRACTORES DE ID ---
  private extractVideoId(url: string): string | null { 
    // Patrones para diferentes formatos de URLs de YouTube incluyendo Shorts
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([^&\n?#]+)/,
      /(?:youtu\.be\/)([^&\n?#]+)/,
      /(?:youtube\.com\/embed\/)([^&\n?#]+)/,
      /(?:youtube\.com\/v\/)([^&\n?#]+)/,
      /(?:youtube\.com\/shorts\/)([^&\n?#]+)/,
      /(?:youtube\.com\/watch\?.*&v=)([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return null;
  }
  private extractTikTokPostId(url: string): string | null { const p = [/video\/(\d+)/, /vm.tiktok.com\/([A-Za-z0-9]+)/]; for (const r of p) { const m = url.match(r); if (m && m[1]) return m[1]; } return null; }
  private extractTwitterPostId(url: string): string | null { const p = [/status\/(\d+)/]; for (const r of p) { const m = url.match(r); if (m && m[1]) return m[1]; } return null; }

  // --- CONVERSORES DE FORMATO ---
  private convertTikTokToYouTubeFormat(comments: TikTokComment[]): YouTubeComment[] { return comments.map(c => ({ id: c.id, text: c.text, author: c.author, publishedAt: c.publishedAt, likeCount: c.likeCount, replyCount: c.replyCount })); }
  private convertTwitterToYouTubeFormat(comments: TwitterComment[]): YouTubeComment[] { return comments.map(c => ({ id: c.id, text: c.text, author: c.author, publishedAt: c.publishedAt, likeCount: c.likeCount, replyCount: c.replyCount })); }

  // --- OBTENER INFO Y COMENTARIOS (YOUTUBE API V3) ---
  private async getVideoInfo(videoId: string): Promise<{ title: string; commentCount: number }> { 
    try {
      const YOUTUBE_INFO_TIMEOUT = 10000; // 10 segundos
      const request = youtube.videos.list({
        part: ['snippet', 'statistics'],
        id: [videoId],
      });

      const response: any = await withTimeout(
        request, 
        YOUTUBE_INFO_TIMEOUT, 
        `Timeout de ${YOUTUBE_INFO_TIMEOUT}ms superado para obtener información del video de YouTube: ${videoId}`
      );

      const video = response.data.items?.[0];
      if (!video) {
        console.error(`❌ [YOUTUBE-INFO] No video found with ID: ${videoId}`);
        return { title: 'Video Desconocido', commentCount: 0 };
      }
      
      const result = {
        title: video.snippet?.title || 'Sin Título',
        commentCount: parseInt(video.statistics?.commentCount || '0', 10),
      };
      return result;
      
    } catch (error) {
      console.error(`❌ [YOUTUBE-INFO] Error fetching video info:`, error);
      return { title: 'Error al obtener título', commentCount: 0 };
    }
  }
  
  private async extractComments(videoId: string, maxComments: number = 100): Promise<YouTubeComment[]> {
    const startTime = Date.now();
    const comments: YouTubeComment[] = [];
    let nextPageToken: string | undefined = undefined;
    let pageCount = 0;
    const YOUTUBE_COMMENTS_TIMEOUT = 15000; // 15 segundos
    const BATCH_SIZE = 50; // Lote reducido para robustez
    const MAX_ERRORS = 3;
    let consecutiveErrors = 0;

    // Utilidad para reintentos por página
    async function withRetries<T>(fn: () => Promise<T>, retries = 3, delayMs = 1000): Promise<T> {
      let lastError;
      for (let i = 0; i < retries; i++) {
        try {
          return await fn();
        } catch (err) {
          lastError = err;
          await new Promise(res => setTimeout(res, delayMs * (i + 1)));
        }
      }
      throw lastError;
    }

    try {
      do {
        pageCount++;
        
        const response: any = await withRetries(
          () => withTimeout(
            youtube.commentThreads.list({
              part: ['snippet', 'replies'],
              videoId: videoId,
              maxResults: BATCH_SIZE,
              pageToken: nextPageToken,
              order: 'relevance'
            }),
            YOUTUBE_COMMENTS_TIMEOUT,
            `Timeout de ${YOUTUBE_COMMENTS_TIMEOUT}ms superado para obtener comentarios de YouTube: ${videoId} (página ${pageCount})`
          ),
          2, 1500
        );

        const items = response.data.items || [];
        const newComments = items.length;

        for (const item of items) {
          const topLevelComment = item.snippet?.topLevelComment?.snippet;
          if (topLevelComment) {
            comments.push({
              id: item.id!,
              text: topLevelComment.textDisplay || '',
              author: topLevelComment.authorDisplayName || 'Anónimo',
              publishedAt: topLevelComment.publishedAt || new Date().toISOString(),
              likeCount: topLevelComment.likeCount || 0,
              replyCount: item.snippet?.totalReplyCount || 0,
            });
          }
        }

        nextPageToken = response.data.nextPageToken || undefined;
        consecutiveErrors = 0; // Resetear errores si la página fue exitosa

      } while (nextPageToken && comments.length < maxComments && consecutiveErrors < MAX_ERRORS);

      const processingTime = Date.now() - startTime;
      return comments.slice(0, maxComments);

    } catch (error: any) {
      const processingTime = Date.now() - startTime;
      console.error(`❌ [YOUTUBE-COMMENTS] Error after ${processingTime}ms:`, error.message);
      if (error.response?.data?.error?.message) {
        console.error(`❌ [YOUTUBE-COMMENTS] API Error: ${error.response.data.error.message}`);
      }
     consecutiveErrors++;
     if (consecutiveErrors >= MAX_ERRORS) {
       console.error(`❌ [YOUTUBE-COMMENTS] Demasiados errores consecutivos extrayendo comentarios. Abortando batch.`);
     }
      return comments;
    }
  }

  // --- NÚCLEO DE ANÁLISIS ---
  private async analyzeSentimentsBatch(comments: YouTubeComment[]): Promise<{ results: CommentWithSentiment[]; stats: any }> {
    const startTime = Date.now();
    
    const texts = comments.map(comment => comment.text);
    
    try {
      const sentimentResult = await openAISentimentService.analyzeSentimentsBatch(texts, 10);
      
      const results: CommentWithSentiment[] = comments.map((comment, index) => {
        const sentiment = sentimentResult.results[index];
        return {
          ...comment,
          sentiment: {
            label: sentiment.label,
            score: sentiment.score,
            confidence: sentiment.confidence,
            method: sentiment.method,
            reasoning: sentiment.reasoning,
            rawScores: sentiment.rawScores
          }
        };
      });

      const processingTime = Date.now() - startTime;

      return {
        results,
        stats: {
          processingTimeMs: sentimentResult.stats.processingTimeMs,
          batchesProcessed: sentimentResult.stats.batchesProcessed,
          averageProcessingTimePerComment: sentimentResult.stats.averageTimePerComment,
          modelInfo: {
            name: sentimentResult.stats.modelInfo.primary,
            method: 'hybrid-openai-youtube',
            accuracy: sentimentResult.stats.modelInfo.accuracy
          }
        }
      };

    } catch (error) {
      console.error('❌ [SENTIMENT-ANALYSIS] OpenAI analysis failed, using RoBERTa fallback:', error);
      
      const { results: sentimentResults, stats: sentimentStats } = await multilingualRobertaSentimentService.analyzeBatch(texts, 16);
      
      const results = comments.map((comment, index) => ({ ...comment, sentiment: { ...sentimentResults[index] } }));
      
      const processingTime = Date.now() - startTime;
      
      return {
        results,
        stats: {
          ...sentimentStats,
          modelInfo: {
            name: 'RoBERTa Multilingüe (Fallback)',
            method: 'multilingual-roberta-fallback',
            accuracy: 'Alta precisión multilingüe (modo fallback)'
          }
        }
      };
    }
  }

  // --- HELPERS DE RESULTADOS ---
  private calculateSentimentSummary(comments: CommentWithSentiment[]) { 
    
    const hybridResults: HybridSentimentResult[] = comments.map(comment => ({
      label: comment.sentiment.label as 'positive' | 'negative' | 'neutral',
      score: comment.sentiment.score,
      confidence: comment.sentiment.confidence,
      method: comment.sentiment.method,
      reasoning: (comment.sentiment as any).reasoning,
      rawScores: comment.sentiment.rawScores
    }));

    const summary = openAISentimentService.calculateSentimentSummary(hybridResults, 0.5);

    return {
      positive: summary.positive,
      negative: summary.negative,
      neutral: summary.neutral,
      positivePercentage: summary.positivePercentage,
      negativePercentage: summary.negativePercentage,
      neutralPercentage: summary.neutralPercentage
    };
  }
  private selectCommentsSample(comments: CommentWithSentiment[], size: number = 100): CommentWithSentiment[] { if (comments.length <= size) return comments; const shuffled = [...comments].sort(() => 0.5 - Math.random()); return shuffled.slice(0, size); }
  private createEmptyResult(postId: string, title: string, platform: string, totalComments: number = 0): OptimizedAnalysisResult { return { videoId: postId, videoTitle: title, totalComments, analyzedComments: 0, comments: [], sentimentSummary: { positive: 0, negative: 0, neutral: 0, positivePercentage: 0, negativePercentage: 0, neutralPercentage: 0 }, platform, processingStats: { totalProcessed: 0, processingTimeMs: 0, batchesProcessed: 0, averageProcessingTimePerComment: 0 } }; }

  // --- ORQUESTADOR PRINCIPAL ---
  async analyzePost(postUrl: string): Promise<OptimizedAnalysisResult> { const platform = postUrl.includes('youtube') || postUrl.includes('youtu.be') ? 'youtube' : postUrl.includes('tiktok') ? 'tiktok' : 'twitter'; if (platform === 'youtube') return this.analyzeYouTubeVideo(postUrl); if (platform === 'tiktok') return this.analyzeTikTokVideo(postUrl); return this.analyzeTwitterPost(postUrl); }

  // --- ANÁLISIS POR PLATAFORMA CON CACHÉ ---
  async analyzeYouTubeVideo(postUrl: string): Promise<OptimizedAnalysisResult> {
    const startTime = Date.now();
    
    
    const videoId = this.extractVideoId(postUrl);
    if (!videoId) {
      console.error('❌ [YOUTUBE-ANALYSIS] Invalid YouTube URL');
      throw new Error('URL de YouTube no válida');
    }


    const cacheKey = `analysis:youtube:${videoId}`;
    
    const cached = await postgresCacheService.get<OptimizedAnalysisResult>(cacheKey);
    if (cached) {
      return { ...cached, source: 'cache' };
    }
    

    const videoInfo = await this.getVideoInfo(videoId);

    
    const comments = await this.extractComments(videoId, 100);

    if (comments.length === 0) {
      return this.createEmptyResult(videoId, videoInfo.title, 'youtube', videoInfo.commentCount);
    }

    const { results, stats } = await this.analyzeSentimentsBatch(comments);
    
    const result: OptimizedAnalysisResult = {
      videoId,
      videoTitle: videoInfo.title,
      totalComments: videoInfo.commentCount,
      analyzedComments: results.length,
      comments: results,
      sentimentSummary: this.calculateSentimentSummary(results),
      platform: 'youtube',
      processingStats: { ...stats, totalProcessed: comments.length },
      source: 'live'
    };

    await postgresCacheService.set(cacheKey, result, 3600 * 24).catch(() => {
      console.warn(`⚠️ [YOUTUBE-ANALYSIS] Failed to cache results`);
    });

    const totalTime = Date.now() - startTime;
    
    return result;
  }

  async analyzeTikTokVideo(postUrl: string): Promise<OptimizedAnalysisResult> {
    const postId = this.extractTikTokPostId(postUrl) || postUrl;
    const cacheKey = `analysis:tiktok:${postId}`;
    const cached = await postgresCacheService.get<OptimizedAnalysisResult>(cacheKey);
    if (cached) return { ...cached, source: 'cache' };
    
    const tiktokResult = await apifyTikTokService.extractTikTokComments(postUrl, 100);
    if (tiktokResult.comments.length === 0) return this.createEmptyResult(tiktokResult.videoId, tiktokResult.videoTitle, 'tiktok');
    
    const comments = this.convertTikTokToYouTubeFormat(tiktokResult.comments);
    const { results, stats } = await this.analyzeSentimentsBatch(comments);
    const result: OptimizedAnalysisResult = { 
      videoId: tiktokResult.videoId, 
      videoTitle: tiktokResult.videoTitle, 
      totalComments: tiktokResult.totalComments, 
      analyzedComments: results.length, 
      comments: results, 
      sentimentSummary: this.calculateSentimentSummary(results), 
      platform: 'tiktok', 
      processingStats: { ...stats, totalProcessed: comments.length }, 
      source: 'live' 
    };
    await postgresCacheService.set(cacheKey, result, 3600 * 24).catch(() => null);
    return result;
  }

  async analyzeTwitterPost(postUrl: string): Promise<OptimizedAnalysisResult> {
    const startTime = Date.now();
    const postId = this.extractTwitterPostId(postUrl);
    if (!postId) {
      throw new Error('URL de Twitter/X no válida o no se pudo extraer el ID del Tweet');
    }
    const cacheKey = `analysis:twitter:${postId}`;
    const cached = await postgresCacheService.get<OptimizedAnalysisResult>(cacheKey);
    if (cached) return { ...cached, source: 'cache' };
    
    const twitterResult = await apifyTwitterService.extractTwitterComments(postUrl, 100);
    if (twitterResult.comments.length === 0) return this.createEmptyResult(twitterResult.tweetId, twitterResult.tweetText, 'twitter');
    
    const comments = this.convertTwitterToYouTubeFormat(twitterResult.comments);
    const { results, stats } = await this.analyzeSentimentsBatch(comments);
    const result: OptimizedAnalysisResult = { 
      videoId: twitterResult.tweetId, 
      videoTitle: twitterResult.tweetText, 
      totalComments: twitterResult.totalComments, 
      analyzedComments: results.length, 
      comments: results, 
      sentimentSummary: this.calculateSentimentSummary(results), 
      platform: 'twitter', 
      processingStats: { ...stats, totalProcessed: comments.length }, 
      source: 'live' 
    };
    await postgresCacheService.set(cacheKey, result, 3600 * 24).catch(() => null);
    return result;
  }
} 