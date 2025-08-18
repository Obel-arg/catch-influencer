import { useState, useEffect, useCallback } from 'react';
import { campaignMetricsService, CampaignMetrics } from '@/lib/services/campaign/campaign-metrics.service';
import { useCampaignContext } from '@/contexts/CampaignContext';

export const useCampaignMetrics = (campaignId: string) => {
  const [metrics, setMetrics] = useState<CampaignMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { posts, postsLoading } = useCampaignContext();

  const calculateMetrics = useCallback(async () => {
    if (!campaignId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Try to fetch from API first
      const apiMetrics = await campaignMetricsService.getCampaignMetrics(campaignId);
      
      // Check if we have real data (not all zeros)
      const hasRealData = (apiMetrics?.reach?.total || 0) > 0 || 
                         (apiMetrics?.likes?.total || 0) > 0 || 
                         (apiMetrics?.comments?.total || 0) > 0 ||
                         (apiMetrics?.engagement?.average || 0) > 0;
      
      if (hasRealData) {
        setMetrics(apiMetrics);
        setLoading(false);
        return;
      }
    } catch (err) {
      console.error('Error fetching campaign metrics:', err);
    }

    // If no API data or error, calculate from posts
    if (posts.length > 0 && !postsLoading) {
      const calculatedMetrics = campaignMetricsService.calculateMetricsFromPosts(posts);
      const hasCalculatedData = (calculatedMetrics?.reach?.total || 0) > 0 || 
                               (calculatedMetrics?.likes?.total || 0) > 0 || 
                               (calculatedMetrics?.comments?.total || 0) > 0 ||
                               (calculatedMetrics?.engagement?.average || 0) > 0;
      
      if (hasCalculatedData) {
        setMetrics(calculatedMetrics);
        setError(null);
      } else {
        setMetrics(null);
        setError('No metrics data available');
      }
      setLoading(false);
    } else if (!postsLoading) {
      // No posts available and not loading
      setMetrics(null);
      setError('No posts available');
      setLoading(false);
    }
  }, [campaignId, posts, postsLoading]);

  // Calculate metrics when campaignId changes or when posts are loaded
  useEffect(() => {
    calculateMetrics();
  }, [calculateMetrics]);

  const refetch = useCallback(() => {
    calculateMetrics();
  }, [calculateMetrics]);

  return {
    metrics,
    loading: loading || postsLoading,
    error,
    refetch
  };
}; 