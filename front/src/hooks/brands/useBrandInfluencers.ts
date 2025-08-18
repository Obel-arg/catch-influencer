import { useState, useCallback, useEffect } from 'react';
import { brandService } from '@/lib/services/brands';
import { campaignService } from '@/lib/services/campaign';
import { influencerService } from '@/lib/services/influencer';
import { handleHookError } from '@/utils/httpErrorHandler';
import { getInstagramThumbnailValidated } from '@/utils/instagram';
import { getTikTokThumbnailValidated } from '@/utils/tiktok';
import { getTwitterThumbnailValidated } from '@/utils/twitter';

export interface BrandInfluencer {
  id: string;
  campaign_id: string;
  influencer_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  payment_status: 'pending' | 'paid' | 'cancelled';
  assigned_budget: number;
  actual_cost: number;
  start_date: string;
  end_date: string;
  content_requirements: string;
  deliverables: string;
  notes: string;
  created_at: string;
  updated_at: string;
  // Información del influencer
  influencers: {
    id: string;
    name: string;
    location: string;
    categories: string[];
    status: string;
    created_by: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    metadata: any;
    creator_id: string;
    main_social_platform: string;
    followers_count: number;
    average_engagement_rate: number;
    content_niches: string[];
    social_platforms: any;
    platform_info: any;
    avatar: string;
    is_verified: boolean;
    language: string;
  };
  // Información de la campaña
  campaign: {
    id: string;
    name: string;
    description: string;
    status: string;
    start_date: string;
    end_date: string;
    budget: number;
    currency: string;
  };
}

// 🎯 Helper para procesar avatares - SOLO cuando hay problemas de CORS
const processAvatarUrl = async (avatarUrl: string): Promise<string> => {
  if (!avatarUrl) return '';
  
  try {
    // 🔥 REGLA: Usar URL original SIEMPRE que sea posible
    
    // URLs que funcionan perfectamente → usar directamente  
    if (avatarUrl.startsWith('https://yt3.googleusercontent.com') || 
        avatarUrl.startsWith('https://youtube.com') ||
        avatarUrl.startsWith('https://www.youtube.com')) {
      console.log('🖼️ Avatar directo (sin procesar):', avatarUrl.substring(0, 60) + '...');
      return avatarUrl;
    }
    
    // URLs HTTP genéricas - verificar que no sean problemáticas
    if (avatarUrl.startsWith('http') && 
        !avatarUrl.includes('instagram.f') && 
        !avatarUrl.includes('cdninstagram') &&
        !avatarUrl.includes('fbcdn.net') &&
        !avatarUrl.includes('instagram.') &&
        !avatarUrl.includes('tiktok.') &&
        !avatarUrl.includes('muscdn.') &&
        !avatarUrl.includes('twimg.com')) {
      console.log('🖼️ Avatar directo (HTTP genérico):', avatarUrl.substring(0, 60) + '...');
      return avatarUrl;
    }
    
    // ⚠️ SOLO procesar URLs problemáticas (CORS)
    
    // Instagram - URLs bloqueadas por CORS (DETECCIÓN MEJORADA)
    if (avatarUrl.includes('instagram.f') || 
        avatarUrl.includes('cdninstagram') ||
        avatarUrl.includes('fbcdn.net') ||
        avatarUrl.includes('instagram.')) {
      console.log('🔧 Procesando Instagram (CORS):', avatarUrl.substring(0, 60) + '...');
      try {
        const processed = await getInstagramThumbnailValidated(avatarUrl);
        if (processed && processed.length > 100 && !processed.includes('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJQAAACUCAMAAABC4vDmAAABHVBMVEUAAAD')) {
          return processed;
        }
        console.warn('⚠️ Instagram processing failed, usando original');
        return avatarUrl;
      } catch {
        return avatarUrl;
      }
    }
    
    // TikTok - solo si tiene problemas
    if (avatarUrl.includes('tiktok.') || avatarUrl.includes('muscdn.')) {
      console.log('🔧 Procesando TikTok:', avatarUrl.substring(0, 60) + '...');
      try {
        const processed = await getTikTokThumbnailValidated(avatarUrl);
        if (processed && processed.length > 100) {
          return processed;
        }
        return avatarUrl;
      } catch {
        return avatarUrl;
      }
    }
    
    // Twitter - solo si tiene problemas  
    if (avatarUrl.includes('twimg.com')) {
      console.log('🔧 Procesando Twitter:', avatarUrl.substring(0, 60) + '...');
      try {
        const processed = await getTwitterThumbnailValidated(avatarUrl);
        if (processed && processed.length > 100) {
          return processed;
        }
        return avatarUrl;
      } catch {
        return avatarUrl;
      }
    }
    
    // Base64 válido
    if (avatarUrl.startsWith('data:image') && avatarUrl.length > 100) {
      console.log('🖼️ Base64 válido');
      return avatarUrl;
    }
    
    // Default: usar original
    console.log('🖼️ Avatar original (default):', avatarUrl.substring(0, 60) + '...');
    return avatarUrl;
    
  } catch (error) {
    console.warn('❌ Error procesando avatar, usando original:', error);
    return avatarUrl;
  }
};

export const useBrandInfluencers = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [influencers, setInfluencers] = useState<BrandInfluencer[]>([]);

  const getBrandInfluencers = useCallback(async (brandId: string): Promise<BrandInfluencer[]> => {
    if (!brandId) {
      setInfluencers([]);
      return [];
    }

    try {
      setLoading(true);
      setError(null);
      
      // 1. Obtener todas las campañas de la marca
      const brandCampaigns = await brandService.getBrandCampaigns(brandId);
      
      if (!brandCampaigns || brandCampaigns.length === 0) {
        setInfluencers([]);
        return [];
      }

      // 2. Para cada campaña, obtener sus influencers
      const allInfluencersPromises = brandCampaigns.map(async (brandCampaign) => {
        try {
          const campaignInfluencers = await campaignService.getCampaignInfluencers(brandCampaign.campaigns?.id || '');
          
          // 3. Para cada influencer de la campaña, obtener su información completa
          const enrichedInfluencersPromises = campaignInfluencers.map(async (campaignInfluencer: any) => {
                         try {
               // Obtener información completa del influencer (incluyendo avatar)
               const fullInfluencerData = await influencerService.getInfluencerById(campaignInfluencer.influencer_id);
               
                               console.log('🔍 DEBUG - Influencer:', fullInfluencerData?.name || 'Unknown');
                console.log('🔍 DEBUG - Avatar from API:', fullInfluencerData?.avatar);
                
                // 🎯 Procesar el avatar según la plataforma
                const originalAvatar = fullInfluencerData?.avatar || campaignInfluencer.influencers?.avatar || '';
                const processedAvatar = await processAvatarUrl(originalAvatar);
                
                console.log('🖼️ Avatar final:', processedAvatar.substring(0, 100) + (processedAvatar.length > 100 ? '...' : ''));
               
               return {
                 ...campaignInfluencer,
                 // Sobrescribir con información completa del influencer
                 influencers: {
                   ...campaignInfluencer.influencers,
                   ...fullInfluencerData,
                   // Usar el avatar procesado
                   avatar: processedAvatar
                 },
                campaign: {
                  id: brandCampaign.campaigns?.id || '',
                  name: brandCampaign.campaigns?.name || 'Campaña sin nombre',
                  description: brandCampaign.campaigns?.description || '',
                  status: brandCampaign.campaigns?.status || '',
                  start_date: brandCampaign.campaigns?.start_date || '',
                  end_date: brandCampaign.campaigns?.end_date || '',
                  budget: brandCampaign.campaigns?.budget || 0,
                  currency: brandCampaign.campaigns?.currency || 'USD',
                }
              };
            } catch (influencerErr) {
              console.warn(`Error al obtener detalles del influencer ${campaignInfluencer.influencer_id}:`, influencerErr);
              // Si falla, devolver con datos básicos
              return {
                ...campaignInfluencer,
                campaign: {
                  id: brandCampaign.campaigns?.id || '',
                  name: brandCampaign.campaigns?.name || 'Campaña sin nombre',
                  description: brandCampaign.campaigns?.description || '',
                  status: brandCampaign.campaigns?.status || '',
                  start_date: brandCampaign.campaigns?.start_date || '',
                  end_date: brandCampaign.campaigns?.end_date || '',
                  budget: brandCampaign.campaigns?.budget || 0,
                  currency: brandCampaign.campaigns?.currency || 'USD',
                }
              };
            }
          });
          
          return Promise.all(enrichedInfluencersPromises);
        } catch (err) {
          console.warn(`Error al obtener influencers de la campaña ${brandCampaign.campaigns?.name}:`, err);
          return [];
        }
      });

      // 4. Esperar todas las promesas y concatenar resultados
      const allInfluencersArrays = await Promise.all(allInfluencersPromises);
      const allInfluencers = allInfluencersArrays.flat();
      
      // 5. Eliminar duplicados basándose en influencer_id
      // Mantener la instancia más reciente (por created_at) o la que esté "accepted"
      const uniqueInfluencers = allInfluencers.reduce((acc: BrandInfluencer[], current: BrandInfluencer) => {
        const existingIndex = acc.findIndex(inf => inf.influencer_id === current.influencer_id);
        
        if (existingIndex === -1) {
          // No existe, agregarlo
          acc.push(current);
        } else {
          const existing = acc[existingIndex];
          
          // Priorizar estados: accepted > completed > pending > rejected
          const statusPriority = { 'accepted': 4, 'completed': 3, 'pending': 2, 'rejected': 1 };
          const currentPriority = statusPriority[current.status] || 0;
          const existingPriority = statusPriority[existing.status] || 0;
          
          // Si el actual tiene mayor prioridad de estado, o mismo estado pero más reciente, reemplazar
          if (currentPriority > existingPriority || 
              (currentPriority === existingPriority && new Date(current.created_at) > new Date(existing.created_at))) {
            acc[existingIndex] = current;
          }
        }
        
        return acc;
      }, []);
      
      setInfluencers(uniqueInfluencers);
      return uniqueInfluencers;
      
    } catch (err) {
      handleHookError(err, setError, 'Error al obtener influencers de la marca');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Estadísticas calculadas
  const stats = {
    total: influencers.length,
    confirmed: influencers.filter(i => i.status === 'accepted').length,
    pending: influencers.filter(i => i.status === 'pending').length,
    campaigns: Array.from(new Set(influencers.map(i => i.campaign_id))).length,
    totalReach: influencers.reduce((sum, i) => {
      const followersCount = i.influencers?.followers_count;
      if (followersCount && typeof followersCount === 'number') {
        return sum + followersCount;
      }
      return sum;
    }, 0),
    totalBudget: influencers.reduce((sum, i) => sum + (i.assigned_budget || 0), 0),
    averageEngagement: influencers.length > 0 
      ? influencers.reduce((sum, i) => {
          const engagementRate = i.influencers?.average_engagement_rate;
          if (engagementRate && typeof engagementRate === 'number') {
            return sum + engagementRate;
          }
          return sum;
        }, 0) / influencers.length 
      : 0
  };

  return {
    influencers,
    loading,
    error,
    getBrandInfluencers,
    stats
  };
}; 