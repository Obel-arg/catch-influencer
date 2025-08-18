import { useState, useEffect } from 'react';
import { Campaign } from '@/types/campaign';
import { campaignService } from '@/lib/services/campaign';
import { handleHookError } from '@/utils/httpErrorHandler';

interface UseCampaignReturn {
  campaign: Campaign | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useCampaign = (id: string): UseCampaignReturn => {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaign = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const campaignData = await campaignService.getCampaignById(id);
      setCampaign(campaignData);
    } catch (err) {
      // Usar la función utility para manejar errores
      handleHookError(err, setError, 'Error al cargar la campaña');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaign();
  }, [id]);

  const refetch = () => {
    fetchCampaign();
  };

  return {
    campaign,
    loading,
    error,
    refetch
  };
}; 