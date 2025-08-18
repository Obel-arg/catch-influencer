import React, { useState, useEffect } from 'react';
import { Eye, Heart, MessageCircle, TrendingUp, Image, Play } from "lucide-react";
import { extractPostTitle, extractMetricsFromRawResponse, extractEngagementRateFromRawResponse, getPlatformInfluencerId, getSmallPlatformIcon, getImageUrl } from "./PostUtils";
import { SmartImage } from "@/components/ui/SmartImage";
import { LazyInfluencerAvatar } from "@/components/explorer/LazyInfluencerAvatar";

interface PostListItemProps {
  post: any;
  performanceLevel: 'Alto' | 'Medio' | 'Bajo' | 'TBC' | 'Completed';
  getSentimentBadgeColor: (performance: string) => string;
  getSentimentLabel: (performance: string) => string;
  formatNumber: (num?: number | string, options?: { 
    isReach?: boolean; 
    platform?: string; 
    likes?: number | string; 
    comments?: number | string;
    postUrl?: string;
  }) => string;
  onAnalyze: (postUrl: string, postImage?: string, platform?: string, postId?: string, postData?: any) => void;
}

export const PostListItem: React.FC<PostListItemProps> = ({
  post,
  performanceLevel,
  getSentimentBadgeColor,
  getSentimentLabel,
  formatNumber,
  onAnalyze
}) => {
  const postTitle = extractPostTitle(post);
  const metrics = extractMetricsFromRawResponse(post);
  const platformId = getPlatformInfluencerId(post.influencers?.platform_info, post.platform, post.influencers?.name);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Cargar la imagen de forma asíncrona
  useEffect(() => {
    const loadImage = async () => {
      try {
        const url = await getImageUrl(post);
        setImageUrl(url);
      } catch (error) {
        console.error('Error cargando imagen:', error);
        setImageUrl(post.image_url || '');
      }
    };
    
    loadImage();
  }, [post]);

  const handleImageClick = () => {
    if (post.post_url) {
      window.open(post.post_url, '_blank', 'noopener,noreferrer');
    }
  };

  const getContentTypeLabel = (): string | null => {
    const platform = (post.platform || '').toLowerCase();
    const url = post.post_url || '';
    if (!platform) return null;
    if (platform === 'youtube') {
      return url.includes('/shorts/') ? 'Short' : 'Video';
    }
    if (platform === 'tiktok') {
      return 'Video';
    }
    if (platform === 'twitter') {
      return 'Post';
    }
    if (platform === 'instagram') {
      if (url.includes('/stories/')) return 'Story';
      return url.includes('/reel/') ? 'Reel' : 'Post';
    }
    return null;
  };
  const contentTypeLabel = getContentTypeLabel();
  
  // Detectar si es una historia de Instagram
  const isInstagramStory = post.platform?.toLowerCase() === 'instagram' && /instagram\.com\/stories\//i.test(post.post_url);
  
  // Para historias, verificar si tienen datos reales
  const hasRealData = metrics.views && metrics.likes && metrics.comments && 
                      (metrics.views !== 0 || metrics.likes !== 0 || metrics.comments !== 0);


  return (
    <div className="flex rounded-lg overflow-hidden hover:shadow-md transition-all bg-white h-24">
      <div 
        className={`relative w-16 sm:w-20 flex-shrink-0 h-full ${post.post_url ? 'cursor-pointer' : ''}`}
        onClick={handleImageClick}
      >
        {/* CHECKBOX DE SELECCIÓN COMENTADO - NO IMPLEMENTADO AÚN */}
        {/* <div className="absolute top-1 left-1 z-10">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-gray-300 bg-white/90"
            checked={selectedPosts.includes(post.id)}
            onChange={() => togglePostSelection(post.id)}
          />
        </div> */}
        {/* Badge de tipo de contenido en esquina superior derecha */}
        {contentTypeLabel && (
          <div className="absolute top-1 right-1 z-[1] pointer-events-none flex items-center space-x-1 bg-black bg-opacity-50 text-white px-1.5 py-0.5 rounded text-[10px]">
            {contentTypeLabel === 'Post' ? (
              <Image className="h-3 w-3" />
            ) : (
              <Play className="h-3 w-3" />
            )}
            <span>{contentTypeLabel}</span>
          </div>
        )}

        <SmartImage
          src={imageUrl || undefined}
          alt={`Post de ${post.influencers?.name || ''}`}
          className="object-contain w-full h-full bg-gray-50"
          fallback={
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <Image className="h-6 w-6 text-gray-300 mx-auto mb-1" />
                <p className="text-xs text-gray-400">Sin imagen disponible</p>
              </div>
            </div>
          }
        />
      </div>
      <div className="flex-1 flex flex-col p-3">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          {/* Avatar */}
          <LazyInfluencerAvatar 
            influencer={{
              name: post.influencers?.name || 'Influencer',
              avatar: post.influencers?.avatar || ''
            }}
            className="h-6 w-6"
          />
          <div className="font-medium text-sm">{post.influencers?.name}</div>
          <div className="text-xs text-gray-500">{post.post_date ? new Date(post.post_date).toLocaleDateString() : ''}</div>
          {/* Icono de plataforma con username */}
          {platformId && (
            <div className="flex items-center space-x-1">
              {getSmallPlatformIcon(post.platform)}
              <p className="text-xs text-gray-500">
                {platformId.startsWith('@') ? platformId : `@${platformId}`}
              </p>
            </div>
          )}
          {/* Badge de plataforma */}
          <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">{post.platform}</span>
          {/* Badge de sentimiento */}
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getSentimentBadgeColor(performanceLevel)}`}>{getSentimentLabel(performanceLevel)}</span>
        </div>
        
        {/* Título del post - Siempre reservar espacio */}
        <div className="mb-1 min-h-[20px] flex items-start">
          <p className="text-sm font-medium text-gray-600 line-clamp-1">
            {postTitle || '\u00A0'}
          </p>
        </div>
        
        <p className="text-sm text-gray-700 line-clamp-1 mb-1">{post.caption}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4 text-blue-500" />
                             <span>
                 {isInstagramStory && !hasRealData ? "..." : formatNumber(metrics.views, { 
                   isReach: true, 
                   platform: post.platform, 
                   likes: metrics.likes, 
                   comments: metrics.comments,
                   postUrl: post.post_url
                 })}
               </span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4 text-pink-500" />
              <span>{isInstagramStory && !hasRealData ? "..." : formatNumber(metrics.likes)}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4 text-purple-500" />
              <span>{isInstagramStory && !hasRealData ? "..." : formatNumber(metrics.comments)}</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span>
                {isInstagramStory && !hasRealData ? "..." : (extractEngagementRateFromRawResponse(post) ? `${(extractEngagementRateFromRawResponse(post) * 100).toFixed(1)}%` : '-')}
              </span>
            </div>
          </div>
          <button
            className="ml-auto px-3 py-1 rounded-md border-gray-300 border text-xs font-medium bg-white hover:bg-blue-50 transition-colors flex items-center gap-1"
            onClick={() => onAnalyze(post.post_url, imageUrl || undefined, post.platform, post.id, post)}
          >
            Ver análisis
          </button>
        </div>
      </div>
    </div>
  );
}; 