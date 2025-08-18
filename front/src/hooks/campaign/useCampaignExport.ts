import { useState } from 'react';
import { exportCampaignPostsToExcel, CampaignData } from '@/utils/excel-export';
import { Campaign } from '@/types/campaign';
import { InfluencerPost } from '@/lib/services/influencer-posts';

export function useCampaignExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const exportCampaign = async (campaign: Campaign, posts: InfluencerPost[]) => {
    setIsExporting(true);
    setExportError(null);

    try {
      // Transformar los datos de la campaña al formato esperado
      const campaignData: CampaignData = {
        id: campaign.id,
        name: campaign.name,
        description: campaign.description,
        start_date: campaign.start_date,
        end_date: campaign.end_date,
        status: campaign.status,
        posts: posts.map(post => {
          // Debug: Log para posts de Instagram
          if (post.platform.toLowerCase() === 'instagram') {
            console.log('🔍 [HOOK DEBUG] Instagram post being processed:', {
              postId: post.id,
              hasPostMetrics: !!post.post_metrics,
              hasRawResponse: !!post.post_metrics?.raw_response,
              platform: post.platform
            });
          }
          
          return {
            id: post.id,
            title: post.caption || 'Sin título',
            description: post.caption || 'Sin descripción',
            url: post.post_url,
            platform: post.platform,
            influencer_name: post.influencers?.name,
            influencer_username: post.influencers?.platform_info?.username || 'N/A',
            created_at: post.created_at,
            likes: post.post_metrics?.likes_count || post.likes_count || 0,
            comments: post.post_metrics?.comments_count || post.comments_count || 0,
            shares: 0, // No disponible en el modelo actual
            views: post.post_metrics?.views_count || 0,
            reach: 0, // No disponible en el modelo actual
            engagement_rate: post.post_metrics?.engagement_rate || 0,
            image_url: post.image_url,
            post_metrics: post.post_metrics // Incluir el objeto completo con raw_response
          };
        })
      };

      // Exportar a Excel
      await exportCampaignPostsToExcel(campaignData);
      
      console.log('✅ Exportación completada exitosamente');
      
    } catch (error) {
      console.error('❌ Error en la exportación:', error);
      setExportError(error instanceof Error ? error.message : 'Error desconocido al exportar');
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportCampaign,
    isExporting,
    exportError,
    clearError: () => setExportError(null)
  };
} 