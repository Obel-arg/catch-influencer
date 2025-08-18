import supabase from '../../config/supabase';

export interface SentimentAnalysisData {
  post_id: string;
  platform: 'youtube' | 'tiktok' | 'twitter' | 'instagram';
  positive_count: number;
  negative_count: number;
  neutral_count: number;
  total_comments: number;
  positive_percentage: number;
  negative_percentage: number;
  neutral_percentage: number;
  // Nuevas métricas avanzadas
  reach_estimate?: number;
  engagement_rate?: number;
  conversion_estimate?: number;
  conversion_rate?: number;
  impression_estimate?: number;
  virality_score?: number;
  influence_score?: number;
}

export interface AdvancedMetrics {
  reachEstimate: number;
  engagementRate: number;
  conversionEstimate: number;
  conversionRate: number;
  impressionEstimate: number;
  viralityScore: number;
  influenceScore: number;
}

export interface PostMetrics {
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  viewsCount?: number;
  followerCount?: number;
}

export class SentimentAnalysisService {
  
  /**
   * Guarda el análisis de sentimientos en Supabase
   */
  static async saveSentimentAnalysis(data: SentimentAnalysisData, postMetrics?: PostMetrics): Promise<void> {
    try {

      // Calcular métricas avanzadas si se proporcionan las métricas del post
      let finalData = { ...data };
      
      if (postMetrics) {
        
        const advancedMetrics = AdvancedMetricsCalculator.calculateAllMetrics(
          postMetrics,
          data.positive_percentage,
          data.negative_percentage,
          data.platform
        );

        finalData = {
          ...finalData,
          reach_estimate: advancedMetrics.reachEstimate,
          engagement_rate: advancedMetrics.engagementRate,
          conversion_estimate: advancedMetrics.conversionEstimate,
          conversion_rate: advancedMetrics.conversionRate,
          impression_estimate: advancedMetrics.impressionEstimate,
          virality_score: advancedMetrics.viralityScore,
          influence_score: advancedMetrics.influenceScore
        };

        
      }

      // Verificar si ya existe un análisis para este post
      const { data: existing } = await supabase
        .from('sentiment_analysis')
        .select('id')
        .eq('post_id', finalData.post_id)
        .single();

      if (existing) {
        // Actualizar análisis existente
        const updateData: any = {
          positive_count: finalData.positive_count,
          negative_count: finalData.negative_count,
          neutral_count: finalData.neutral_count,
          total_comments: finalData.total_comments,
          positive_percentage: finalData.positive_percentage,
          negative_percentage: finalData.negative_percentage,
          neutral_percentage: finalData.neutral_percentage,
          analyzed_at: new Date().toISOString()
        };

        // Agregar métricas avanzadas si están disponibles
        if (postMetrics) {
          updateData.reach_estimate = finalData.reach_estimate;
          updateData.engagement_rate = finalData.engagement_rate;
          updateData.conversion_estimate = finalData.conversion_estimate;
          updateData.conversion_rate = finalData.conversion_rate;
          updateData.impression_estimate = finalData.impression_estimate;
          updateData.virality_score = finalData.virality_score;
          updateData.influence_score = finalData.influence_score;
        }

        const { error } = await supabase
          .from('sentiment_analysis')
          .update(updateData)
          .eq('post_id', finalData.post_id);

        if (error) {
          console.error('❌ Error actualizando análisis de sentimientos:', error);
          throw error;
        }

      
      } else {
        // Crear nuevo análisis
        const { error } = await supabase
          .from('sentiment_analysis')
          .insert([finalData]);

        if (error) {
          console.error('❌ Error guardando análisis de sentimientos:', error);
          throw error;
        }

       
      }
    } catch (error) {
      console.error('❌ Error en servicio de análisis de sentimientos:', error);
      throw error;
    }
  }

  /**
   * Guarda múltiples resultados de análisis de comentarios para un post.
   */
  static async saveSentimentResults(postId: string, results: { label: string; score: number }[]): Promise<void> {
    

    try {
      
      if (!postId || !results || results.length === 0) {
        console.warn(`⚠️ [SENTIMENT-DB] Datos inválidos para guardar sentimientos: postId=${postId}, results.length=${results?.length}`);
        return;
      }

      // Calcular resumen de sentimientos
      const positiveCount = results.filter(r => r.label === 'positive').length;
      const negativeCount = results.filter(r => r.label === 'negative').length;
      const neutralCount = results.filter(r => r.label === 'neutral').length;
      const totalCount = results.length;

      const positivePercentage = totalCount > 0 ? (positiveCount / totalCount) * 100 : 0;
      const negativePercentage = totalCount > 0 ? (negativeCount / totalCount) * 100 : 0;
      const neutralPercentage = totalCount > 0 ? (neutralCount / totalCount) * 100 : 0;

      

      // Guardar resumen en sentiment_analysis (tabla que sí existe)
      const sentimentData = {
        post_id: postId,
        platform: 'unknown' as const, // Se puede actualizar después
        positive_count: positiveCount,
        negative_count: negativeCount,
        neutral_count: neutralCount,
        total_comments: totalCount,
        positive_percentage: positivePercentage,
        negative_percentage: negativePercentage,
        neutral_percentage: neutralPercentage,
        analyzed_at: new Date().toISOString()
      };

     

      // Usar insert simple en lugar de upsert (la tabla no tiene restricción única en post_id)
      const { error } = await supabase
        .from('sentiment_analysis')
        .insert([sentimentData]);

      if (error) {
        console.error(`❌ [SENTIMENT-DB] Error guardando resumen de sentimientos para post ${postId}:`, {
          error,
          errorMessage: error.message,
          errorCode: error.code,
          postId,
          resultsCount: results.length
        });
        throw error;
      }


      // Verificar que se guardó correctamente
      const { data: verificationData, error: verificationError } = await supabase
        .from('sentiment_analysis')
        .select('*')
        .eq('post_id', postId)
        .order('analyzed_at', { ascending: false })
        .limit(1)
        .single();

      if (verificationError) {
        console.error(`❌ [SENTIMENT-DB] Verification failed:`, verificationError);
      } else if (verificationData) {
        
      } else {
        console.warn(`⚠️ [SENTIMENT-DB] Verification failed: No sentiment data found after saving`);
      }

    } catch (error) {
      console.error(`❌ [SENTIMENT-DB] Error en saveSentimentResults para post ${postId}:`, {
        error,
        errorMessage: error instanceof Error ? error.message : 'Error desconocido',
        errorStack: error instanceof Error ? error.stack : undefined,
        postId,
        resultsCount: results?.length
      });
      throw error;
    }
  }

  /**
   * Actualiza el estado de un post para marcar el análisis como completado.
   */
  static async markPostAnalysisAsCompleted(postId: string): Promise<void> {
    try {
      
      if (!postId) {
        console.warn(`⚠️ [SENTIMENT-DB] postId inválido para marcar como completado: ${postId}`);
        return;
      }

      // Como no tenemos la tabla posts, simplemente actualizamos el análisis de sentimientos
      // para indicar que está completado
      const { error } = await supabase
        .from('sentiment_analysis')
        .update({ 
          analyzed_at: new Date().toISOString() 
        })
        .eq('post_id', postId);

      if (error) {
        console.warn(`⚠️ [SENTIMENT-DB] No se pudo actualizar analyzed_at para post ${postId}:`, {
          error,
          errorMessage: error.message,
          errorCode: error.code,
          postId
        });
        // No lanzar error, solo log
        return;
      }

    } catch (error) {
      console.warn(`⚠️ [SENTIMENT-DB] Error en markPostAnalysisAsCompleted para post ${postId}:`, {
        error,
        errorMessage: error instanceof Error ? error.message : 'Error desconocido',
        postId
      });
      // No lanzar error, solo log
    }
  }

  /**
   * Obtiene el análisis de sentimientos de un post
   */
  static async getSentimentAnalysis(postId: string): Promise<SentimentAnalysisData | null> {
    try {
      const { data, error } = await supabase
        .from('sentiment_analysis')
        .select('*')
        .eq('post_id', postId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('❌ Error obteniendo análisis de sentimientos:', error);
        throw error;
      }

      return data || null;
    } catch (error) {
      console.error('❌ Error en servicio de análisis de sentimientos:', error);
      return null;
    }
  }

  /**
   * Obtiene estadísticas de sentimientos por plataforma
   */
  static async getSentimentStatsByPlatform(platform: 'youtube' | 'tiktok' | 'twitter' | 'instagram') {
    try {
      const { data, error } = await supabase
        .from('sentiment_analysis')
        .select('positive_count, negative_count, neutral_count, total_comments')
        .eq('platform', platform);

      if (error) {
        console.error('❌ Error obteniendo estadísticas de sentimientos:', error);
        throw error;
      }

      // Calcular totales
      const totals = data.reduce(
        (acc, curr) => ({
          positive: acc.positive + curr.positive_count,
          negative: acc.negative + curr.negative_count,
          neutral: acc.neutral + curr.neutral_count,
          total: acc.total + curr.total_comments
        }),
        { positive: 0, negative: 0, neutral: 0, total: 0 }
      );

      return {
        platform,
        posts_analyzed: data.length,
        ...totals,
        positive_percentage: totals.total > 0 ? (totals.positive / totals.total) * 100 : 0,
        negative_percentage: totals.total > 0 ? (totals.negative / totals.total) * 100 : 0,
        neutral_percentage: totals.total > 0 ? (totals.neutral / totals.total) * 100 : 0
      };
    } catch (error) {
      console.error('❌ Error en estadísticas de sentimientos:', error);
      return null;
    }
  }

  /**
   * Elimina el análisis de sentimientos de un post
   */
  static async deleteSentimentAnalysis(postId: string): Promise<void> {
    try {
      
      // Verificar si existe el análisis antes de eliminar
      const { data: existing } = await supabase
        .from('sentiment_analysis')
        .select('id, platform')
        .eq('post_id', postId)
        .single();

      if (!existing) {
        return;
      }

     

      // Eliminar el análisis
      const { error } = await supabase
        .from('sentiment_analysis')
        .delete()
        .eq('post_id', postId);

      if (error) {
        console.error(`❌ [SENTIMENT-DELETE] Error eliminando análisis de sentimientos para post ${postId}:`, error);
        throw error;
      }

      
    } catch (error) {
      console.error(`❌ [SENTIMENT-DELETE] Error en eliminación de análisis de sentimientos para post ${postId}:`, error);
      throw error;
    }
  }
}

export class AdvancedMetricsCalculator {
  /**
   * Calcula el Reach Estimate basado en comentarios, likes y shares
   * Para YouTube: usa las vistas reales como reach
   * Para otras plataformas: (comments * 50) + (likes * 10) + (shares * 100)
   */
  static calculateReachEstimate(metrics: PostMetrics, platform?: string): number {
    // Para YouTube, usar las vistas reales como reach estimate
    if (platform === 'youtube' && metrics.viewsCount && metrics.viewsCount > 0) {
      return metrics.viewsCount;
    }
    
    // Para otras plataformas, usar la fórmula de estimación
    const baseReach = (metrics.commentsCount * 50) + 
                     (metrics.likesCount * 10) + 
                     (metrics.sharesCount * 100);
    
    // Aplicar multiplicador basado en el nivel de engagement
    const engagementMultiplier = this.getEngagementMultiplier(metrics);
    
    const estimatedReach = Math.round(baseReach * engagementMultiplier);
    
    return estimatedReach;
  }

  /**
   * Calcula el Engagement Rate
   * Fórmula: ((likes + comments + shares) / followers) * 100
   */
  static calculateEngagementRate(metrics: PostMetrics): number {
    if (!metrics.followerCount || metrics.followerCount === 0) {
      // Si no hay datos de followers, usar una estimación basada en el engagement
      const totalEngagement = metrics.likesCount + metrics.commentsCount + metrics.sharesCount;
      return Math.min(totalEngagement / 1000 * 100, 15); // Cap at 15% for unknown followers
    }

    const totalEngagement = metrics.likesCount + metrics.commentsCount + metrics.sharesCount;
    const rate = (totalEngagement / metrics.followerCount) * 100;
    
    return Math.round(rate * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Calcula el Conversion Estimate
   * Fórmula: reach_estimate * conversion_rate
   */
  static calculateConversionEstimate(reachEstimate: number, conversionRate: number): number {
    return Math.round(reachEstimate * (conversionRate / 100));
  }

  /**
   * Calcula el Conversion Rate basado en sentiment y engagement
   * Fórmula: base_rate * sentiment_multiplier * engagement_multiplier
   */
  static calculateConversionRate(
    positivePercentage: number, 
    negativePercentage: number,
    engagementRate: number
  ): number {
    // Base conversion rate (industry average)
    const baseRate = 2.5; // 2.5%

    // Sentiment multiplier
    const sentimentScore = positivePercentage - negativePercentage;
    const sentimentMultiplier = 1 + (sentimentScore / 100);

    // Engagement multiplier
    const engagementMultiplier = 1 + Math.min(engagementRate / 10, 1); // Cap at 2x

    const finalRate = baseRate * sentimentMultiplier * engagementMultiplier;
    
    return Math.max(0.1, Math.min(finalRate, 15)); // Between 0.1% and 15%
  }

  /**
   * Calcula el Impression Estimate
   * Fórmula: reach_estimate * impression_multiplier
   */
  static calculateImpressionEstimate(reachEstimate: number, metrics: PostMetrics): number {
    // Base multiplier
    let impressionMultiplier = 3; // Each person reached sees it ~3 times on average

    // Adjust based on shares (viral content gets more impressions)
    if (metrics.sharesCount > 0) {
      const shareMultiplier = 1 + (metrics.sharesCount / Math.max(metrics.likesCount, 1));
      impressionMultiplier *= Math.min(shareMultiplier, 5); // Cap at 5x
    }

    return Math.round(reachEstimate * impressionMultiplier);
  }

  /**
   * Calcula el Virality Score
   * Fórmula: (shares / (likes + comments)) * 100 + engagement_bonus
   */
  static calculateViralityScore(metrics: PostMetrics, engagementRate: number): number {
    const totalEngagement = metrics.likesCount + metrics.commentsCount;
    
    if (totalEngagement === 0) return 0;

    // Base virality from share ratio
    const shareRatio = metrics.sharesCount / totalEngagement;
    let viralityScore = shareRatio * 100;

    // Engagement bonus
    const engagementBonus = Math.min(engagementRate / 2, 10); // Max 10 points bonus
    viralityScore += engagementBonus;

    // Growth velocity bonus (if comments are high relative to likes)
    const commentRatio = metrics.commentsCount / Math.max(metrics.likesCount, 1);
    if (commentRatio > 0.1) { // More than 10% comment rate is good
      viralityScore += commentRatio * 5;
    }

    return Math.min(Math.round(viralityScore * 10) / 10, 100); // Cap at 100, round to 1 decimal
  }

  /**
   * Calcula el Influence Score
   * Fórmula: (reach_estimate / 1000) + (engagement_rate * 2) + (virality_score / 10) + sentiment_bonus
   */
  static calculateInfluenceScore(
    reachEstimate: number,
    engagementRate: number,
    viralityScore: number,
    positivePercentage: number,
    negativePercentage: number
  ): number {
    // Base influence from reach (per 1000 people reached = 1 point)
    const reachScore = reachEstimate / 1000;

    // Engagement contribution (engagement rate * 2)
    const engagementScore = engagementRate * 2;

    // Virality contribution
    const viralityContribution = viralityScore / 10;

    // Sentiment bonus/penalty
    const sentimentScore = positivePercentage - negativePercentage;
    const sentimentBonus = sentimentScore / 20; // +/- 5 points max

    const totalScore = reachScore + engagementScore + viralityContribution + sentimentBonus;
    
    return Math.max(0, Math.min(Math.round(totalScore * 10) / 10, 100)); // Between 0-100, 1 decimal
  }

  /**
   * Calcula todas las métricas avanzadas
   */
  static calculateAllMetrics(
    metrics: PostMetrics,
    positivePercentage: number,
    negativePercentage: number,
    platform?: string
  ): AdvancedMetrics {
    const reachEstimate = this.calculateReachEstimate(metrics, platform);
    const engagementRate = this.calculateEngagementRate(metrics);
    const conversionRate = this.calculateConversionRate(positivePercentage, negativePercentage, engagementRate);
    const conversionEstimate = this.calculateConversionEstimate(reachEstimate, conversionRate);
    const impressionEstimate = this.calculateImpressionEstimate(reachEstimate, metrics);
    const viralityScore = this.calculateViralityScore(metrics, engagementRate);
    const influenceScore = this.calculateInfluenceScore(
      reachEstimate, 
      engagementRate, 
      viralityScore, 
      positivePercentage, 
      negativePercentage
    );

    return {
      reachEstimate,
      engagementRate,
      conversionEstimate,
      conversionRate,
      impressionEstimate,
      viralityScore,
      influenceScore
    };
  }

  /**
   * Obtiene el multiplicador de engagement basado en las métricas
   */
  private static getEngagementMultiplier(metrics: PostMetrics): number {
    const totalEngagement = metrics.likesCount + metrics.commentsCount + metrics.sharesCount;
    
    if (totalEngagement > 10000) return 1.5; // High engagement
    if (totalEngagement > 1000) return 1.2;  // Medium engagement
    if (totalEngagement > 100) return 1.0;   // Normal engagement
    return 0.8; // Low engagement
  }
} 