import React from 'react';
import { Tag, Target, Zap, Hash, Folder, TrendingUp } from 'lucide-react';
import { cn } from "@/lib/utils";
import { normalizeYouTubeCategory } from './MetricsUtils';

interface PostDetailsProps {
  postData: any;
}

export const PostDetails: React.FC<PostDetailsProps> = ({ postData }) => {
  if (!postData) return null;

  const rawResponse = postData.post_metrics?.raw_response;
  const platform = postData.platform.toLowerCase();

  // Hashtags
  let hashtags = [];
  if (platform === 'youtube' && rawResponse?.data?.basicYoutubePost?.hashtags) {
    hashtags = rawResponse.data.basicYoutubePost.hashtags;
  } else if (platform === 'tiktok' && rawResponse?.data?.basicTikTokVideo?.hashtags) {
    hashtags = rawResponse.data.basicTikTokVideo.hashtags;
  } else if (platform === 'twitter' && rawResponse?.data?.basicTwitterPost?.hashtags) {
    hashtags = rawResponse.data.basicTwitterPost.hashtags;
  } else if (platform === 'instagram' && rawResponse?.data?.basicInstagramPost?.hashtags) {
    hashtags = rawResponse.data.basicInstagramPost.hashtags;
  }

  // Category
  let category = null;
  if (platform === 'youtube' && rawResponse?.data?.basicYoutubePost?.category) {
    category = normalizeYouTubeCategory(rawResponse.data.basicYoutubePost.category);
  } else if (platform === 'twitter' && rawResponse?.data?.basicTwitterPost?.verificationType) {
    category = `Verificado: ${rawResponse.data.basicTwitterPost.verificationType}`;
  }

  // Engagement Rate
  let engageRate = null;
  if (platform === 'youtube' && rawResponse?.data?.basicYoutubePost?.engageRate) {
    engageRate = rawResponse.data.basicYoutubePost.engageRate;
  } else if (platform === 'tiktok' && rawResponse?.data?.basicTikTokVideo?.engageRate) {
    engageRate = rawResponse.data.basicTikTokVideo.engageRate;
  } else if (platform === 'twitter' && rawResponse?.data?.basicTwitterPost?.engageRate) {
    engageRate = rawResponse.data.basicTwitterPost.engageRate;
  } else if (platform === 'instagram' && rawResponse?.data?.basicInstagramPost?.engageRate) {
    engageRate = rawResponse.data.basicInstagramPost.engageRate;
  }

  const detailCards = [
    {
      title: 'Hashtags',
      icon: Hash,
      iconColor: 'text-blue-500',
      content: hashtags && hashtags.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto">
          {hashtags.map((hashtag: string, index: number) => (
            <span 
              key={index}
              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200 transition-colors"
            >
              {hashtag}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 italic">No se encontraron hashtags</p>
      )
    },
    {
      title: 'Categoría',
      icon: Folder,
      iconColor: 'text-purple-500',
      content: category ? (
        <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
          {category}
        </div>
      ) : (
        <p className="text-sm text-gray-500 italic">Sin categoría definida</p>
      )
    },
    {
      title: 'Engagement Rate',
      icon: TrendingUp,
      iconColor: 'text-green-500',
      content: engageRate ? (
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">
            {(engageRate * 100).toFixed(2)}%
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500 italic">Datos no disponibles</p>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-base font-semibold text-gray-900">Detalles del Contenido</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {detailCards.map((card, index) => (
          <div 
            key={index}
            className="rounded-xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg">
                <card.icon className={cn("h-4 w-4", card.iconColor)} />
              </div>
              <h4 className="font-semibold text-gray-900 text-sm">
                {card.title}
              </h4>
            </div>
            
            <div className="min-h-[3rem] flex items-start">
              {card.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 