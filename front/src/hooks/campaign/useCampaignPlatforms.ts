import { useState, useEffect, useCallback } from 'react';
import { campaignMetricsService, CampaignMetrics } from '@/lib/services/campaign/campaign-metrics.service';
import { useCampaignContext } from '@/contexts/CampaignContext';

export interface PlatformData {
  name: string;
  posts: number;
  reach: number;
  engagement: number;
  likes: number;
  color: string;
}

export const useCampaignPlatforms = (campaignId: string) => {
  const [platforms, setPlatforms] = useState<PlatformData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { posts, postsLoading } = useCampaignContext();

  const fetchPlatformData = useCallback(async () => {
    if (!campaignId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Try to fetch from API first
      const apiMetrics = await campaignMetricsService.getCampaignMetrics(campaignId);
      
      // Check if we have real data - with safety checks
      const hasRealData = (apiMetrics?.reach?.total || 0) > 0 || 
                         (apiMetrics?.likes?.total || 0) > 0 || 
                         (apiMetrics?.comments?.total || 0) > 0 ||
                         (apiMetrics?.engagement?.average || 0) > 0;
      
              if (hasRealData) {
          const platformData: PlatformData[] = [
            {
              name: 'Instagram',
              posts: apiMetrics?.posts?.instagram || 0,
              reach: apiMetrics?.reach?.instagram || 0,
              engagement: apiMetrics?.engagement?.instagram || 0,
              likes: apiMetrics?.likes?.instagram || 0,
              color: '#E1306C'
            },
            {
              name: 'TikTok',
              posts: apiMetrics?.posts?.tiktok || 0,
              reach: apiMetrics?.reach?.tiktok || 0,
              engagement: apiMetrics?.engagement?.tiktok || 0,
              likes: apiMetrics?.likes?.tiktok || 0,
              color: '#000000'
            },
            {
              name: 'YouTube',
              posts: apiMetrics?.posts?.youtube || 0,
              reach: apiMetrics?.reach?.youtube || 0,
              engagement: apiMetrics?.engagement?.youtube || 0,
              likes: apiMetrics?.likes?.youtube || 0,
              color: '#FF0000'
            },
            {
              name: 'X / Twitter',
              posts: apiMetrics?.posts?.twitter || 0,
              reach: apiMetrics?.reach?.twitter || 0,
              engagement: apiMetrics?.engagement?.twitter || 0,
              likes: apiMetrics?.likes?.twitter || 0,
              color: '#1DA1F2'
            }
          ]; // Always show all platforms, even with 0 posts

        setPlatforms(platformData);
        setLoading(false);
      } else if (posts.length > 0 && !postsLoading) {
        // Calculate from posts if we have posts and they're not loading
        const calculatedMetrics = campaignMetricsService.calculateMetricsFromPosts(posts);
        const hasCalculatedData = (calculatedMetrics?.reach?.total || 0) > 0 || 
                                 (calculatedMetrics?.likes?.total || 0) > 0 || 
                                 (calculatedMetrics?.comments?.total || 0) > 0 ||
                                 (calculatedMetrics?.engagement?.average || 0) > 0;
        
        if (hasCalculatedData) {
          const platformData: PlatformData[] = [
            {
              name: 'Instagram',
              posts: calculatedMetrics?.posts?.instagram || 0,
              reach: calculatedMetrics?.reach?.instagram || 0,
              engagement: calculatedMetrics?.engagement?.instagram || 0,
              likes: calculatedMetrics?.likes?.instagram || 0,
              color: '#E1306C'
            },
            {
              name: 'TikTok',
              posts: calculatedMetrics?.posts?.tiktok || 0,
              reach: calculatedMetrics?.reach?.tiktok || 0,
              engagement: calculatedMetrics?.engagement?.tiktok || 0,
              likes: calculatedMetrics?.likes?.tiktok || 0,
              color: '#000000'
            },
            {
              name: 'YouTube',
              posts: calculatedMetrics?.posts?.youtube || 0,
              reach: calculatedMetrics?.reach?.youtube || 0,
              engagement: calculatedMetrics?.engagement?.youtube || 0,
              likes: calculatedMetrics?.likes?.youtube || 0,
              color: '#FF0000'
            },
            {
              name: 'X / Twitter',
              posts: calculatedMetrics?.posts?.twitter || 0,
              reach: calculatedMetrics?.reach?.twitter || 0,
              engagement: calculatedMetrics?.engagement?.twitter || 0,
              likes: calculatedMetrics?.likes?.twitter || 0,
              color: '#1DA1F2'
            }
          ];

          setPlatforms(platformData);
                 } else {
           // Always show all platforms with 0 values when no data
           const emptyPlatformData: PlatformData[] = [
             {
               name: 'Instagram',
               posts: 0,
               reach: 0,
               engagement: 0,
               likes: 0,
               color: '#E1306C'
             },
             {
               name: 'TikTok',
               posts: 0,
               reach: 0,
               engagement: 0,
               likes: 0,
               color: '#000000'
             },
             {
               name: 'YouTube',
               posts: 0,
               reach: 0,
               engagement: 0,
               likes: 0,
               color: '#FF0000'
             },
             {
               name: 'X / Twitter',
               posts: 0,
               reach: 0,
               engagement: 0,
               likes: 0,
               color: '#1DA1F2'
             }
           ];
          setPlatforms(emptyPlatformData);
          setError(null);
        }
        setLoading(false);
      } else {
        // No data available yet, but don't force loading state to avoid infinite loops
        // The loading state is already managed by the initial state and other conditions
        
      }
    } catch (err) {
      console.error('Error fetching platform data:', err);
      
                     // Fallback to calculating from posts data only if posts are loaded
       if (posts.length > 0 && !postsLoading) {
         const calculatedMetrics = campaignMetricsService.calculateMetricsFromPosts(posts);
         const hasCalculatedData = (calculatedMetrics?.reach?.total || 0) > 0 || 
                                  (calculatedMetrics?.likes?.total || 0) > 0 || 
                                  (calculatedMetrics?.comments?.total || 0) > 0 ||
                                  (calculatedMetrics?.engagement?.average || 0) > 0;
         
         if (hasCalculatedData) {
           const platformData: PlatformData[] = [
             {
               name: 'Instagram',
               posts: calculatedMetrics?.posts?.instagram || 0,
               reach: calculatedMetrics?.reach?.instagram || 0,
               engagement: calculatedMetrics?.engagement?.instagram || 0,
               likes: calculatedMetrics?.likes?.instagram || 0,
               color: '#E1306C'
             },
             {
               name: 'TikTok',
               posts: calculatedMetrics?.posts?.tiktok || 0,
               reach: calculatedMetrics?.reach?.tiktok || 0,
               engagement: calculatedMetrics?.engagement?.tiktok || 0,
               likes: calculatedMetrics?.likes?.tiktok || 0,
               color: '#000000'
             },
             {
               name: 'YouTube',
               posts: calculatedMetrics?.posts?.youtube || 0,
               reach: calculatedMetrics?.reach?.youtube || 0,
               engagement: calculatedMetrics?.engagement?.youtube || 0,
               likes: calculatedMetrics?.likes?.youtube || 0,
               color: '#FF0000'
             },
             {
               name: 'X / Twitter',
                             posts: calculatedMetrics?.posts?.twitter || 0,
              reach: calculatedMetrics?.reach?.twitter || 0,
              engagement: calculatedMetrics?.engagement?.twitter || 0,
              likes: calculatedMetrics?.likes?.twitter || 0,
               color: '#1DA1F2'
             }
           ];

          setPlatforms(platformData);
          } else {
            // Always show all platforms with 0 values when no data
            const emptyPlatformData: PlatformData[] = [
              {
                name: 'Instagram',
                posts: 0,
                reach: 0,
                engagement: 0,
                likes: 0,
                color: '#E1306C'
              },
              {
                name: 'TikTok',
                posts: 0,
                reach: 0,
                engagement: 0,
                likes: 0,
                color: '#000000'
              },
              {
                name: 'YouTube',
                posts: 0,
                reach: 0,
                engagement: 0,
                likes: 0,
                color: '#FF0000'
              },
              {
                name: 'X / Twitter',
                posts: 0,
                reach: 0,
                engagement: 0,
                likes: 0,
                color: '#1DA1F2'
              }
            ];
            setPlatforms(emptyPlatformData);
            setError(null);
          }
      } else {
        setError('Error loading platform data');
      }
      setLoading(false);
    }
  }, [campaignId, posts, postsLoading]);

    // Calculate from posts when posts change and are loaded
  const calculateFromPosts = useCallback(() => {
    if (posts.length > 0 && !postsLoading) {
        
      const calculatedMetrics = campaignMetricsService.calculateMetricsFromPosts(posts);
      
      const hasCalculatedData = (calculatedMetrics?.reach?.total || 0) > 0 || 
                               (calculatedMetrics?.likes?.total || 0) > 0 || 
                               (calculatedMetrics?.comments?.total || 0) > 0 ||
                               (calculatedMetrics?.engagement?.average || 0) > 0;
      
      if (hasCalculatedData) {
        const platformData: PlatformData[] = [
          {
            name: 'Instagram',
            posts: calculatedMetrics?.posts?.instagram || 0,
            reach: calculatedMetrics?.reach?.instagram || 0,
            engagement: calculatedMetrics?.engagement?.instagram || 0,
            likes: calculatedMetrics?.likes?.instagram || 0,
            color: '#E1306C'
          },
          {
            name: 'TikTok',
            posts: calculatedMetrics?.posts?.tiktok || 0,
            reach: calculatedMetrics?.reach?.tiktok || 0,
            engagement: calculatedMetrics?.engagement?.tiktok || 0,
            likes: calculatedMetrics?.likes?.tiktok || 0,
            color: '#000000'
          },
          {
            name: 'YouTube',
            posts: calculatedMetrics?.posts?.youtube || 0,
            reach: calculatedMetrics?.reach?.youtube || 0,
            engagement: calculatedMetrics?.engagement?.youtube || 0,
            likes: calculatedMetrics?.likes?.youtube || 0,
            color: '#FF0000'
          },
          {
            name: 'X / Twitter',
                          posts: calculatedMetrics?.posts?.twitter || 0,
              reach: calculatedMetrics?.reach?.twitter || 0,
              engagement: calculatedMetrics?.engagement?.twitter || 0,
              likes: calculatedMetrics?.likes?.twitter || 0,
            color: '#1DA1F2'
          }
        ];

                 setPlatforms(platformData);
         setError(null);
         setLoading(false);
       } else {
         // Always show all platforms with 0 values when no data
         const emptyPlatformData: PlatformData[] = [
           {
             name: 'Instagram',
             posts: 0,
             reach: 0,
             engagement: 0,
             likes: 0,
             color: '#E1306C'
           },
           {
             name: 'TikTok',
             posts: 0,
             reach: 0,
             engagement: 0,
             likes: 0,
             color: '#000000'
           },
           {
             name: 'YouTube',
             posts: 0,
             reach: 0,
             engagement: 0,
             likes: 0,
             color: '#FF0000'
           },
           {
             name: 'X / Twitter',
             posts: 0,
             reach: 0,
             engagement: 0,
             likes: 0,
             color: '#1DA1F2'
           }
         ];
        setPlatforms(emptyPlatformData);
        setError(null);
      }
      setLoading(false);
    }
  }, [posts, postsLoading]);

  useEffect(() => {
    fetchPlatformData();
  }, [fetchPlatformData]);

  // Recalculate when posts change and are loaded
  useEffect(() => {
    if (posts.length > 0 && !postsLoading) {
      calculateFromPosts();
    }
  }, [posts, postsLoading, calculateFromPosts]);

  const refetch = useCallback(() => {
    fetchPlatformData();
  }, [fetchPlatformData]);

  return {
    platforms,
    loading: loading || (postsLoading && platforms.length === 0), // Only show loading if we don't have platforms yet
    error,
    refetch,
    calculateFromPosts
  };
}; 