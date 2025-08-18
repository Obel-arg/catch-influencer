import { useState, useEffect } from 'react';
import { campaignService } from '@/lib/services/campaign';
import { handleHookError } from '@/utils/httpErrorHandler';

export interface CampaignInfluencer {
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
}

export const useCampaignInfluencers = (campaignId: string) => {
  const [influencers, setInfluencers] = useState<CampaignInfluencer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInfluencers = async () => {
    if (!campaignId) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await campaignService.getCampaignInfluencers(campaignId);
      
   
      
      setInfluencers(data);
    } catch (err) {
      // Usar la función utility para manejar errores
      handleHookError(err, setError, 'Error al cargar los influencers de la campaña');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInfluencers();
  }, [campaignId]);

  const refetch = () => {
    fetchInfluencers();
  };

  // Estadísticas calculadas
  const stats = {
    total: influencers.length,
    confirmed: influencers.filter(i => i.status === 'accepted').length,
    pending: influencers.filter(i => i.status === 'pending').length,
    totalReach: influencers.reduce((sum, i) => {
      // Usar followers_count del nuevo esquema
      const followersCount = i.influencers?.followers_count;
      if (followersCount && typeof followersCount === 'number') {
        return sum + followersCount;
      }
      return sum;
    }, 0),
    totalBudget: influencers.reduce((sum, i) => sum + i.assigned_budget, 0),
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
    refetch,
    stats
  };
}; 