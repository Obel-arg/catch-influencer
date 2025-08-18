import React from 'react';
import { Users, Image, Calendar, User, AtSign } from 'lucide-react';
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { extractMetricsFromRawResponse, extractPostTitle, getPlatformInfluencerId } from './MetricsUtils';
import { getSmallPlatformIcon } from './PlatformIcons';
import { PostMetrics } from './PostMetrics';
import { cn } from "@/lib/utils";
import { LazyInfluencerAvatar } from "@/components/explorer/LazyInfluencerAvatar";

interface PostInformationProps {
  postData: any;
  postImage?: string;
}

export const PostInformation: React.FC<PostInformationProps> = ({ postData, postImage }) => {
  if (!postData) return null;

  const metrics = extractMetricsFromRawResponse(postData);
  const postTitle = extractPostTitle(postData);
  const platformId = getPlatformInfluencerId(postData.influencers?.platform_info, postData.platform);

  return (
    <div className="space-y-6">
      {/* Header con información del influencer */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <LazyInfluencerAvatar 
            influencer={{
              name: postData.influencers?.name || 'Influencer',
              avatar: postData.influencers?.avatar || ''
            }}
            className="w-16 h-16 border-2 border-white shadow-lg"
          />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
            {getSmallPlatformIcon(postData.platform)}
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-sm font-bold text-gray-900 mb-1">
            {postData.influencers?.name || 'Influencer'}
          </h3>
          {platformId && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-gray-600">
                {platformId.startsWith('@') ? platformId : `@${platformId}`}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar className="h-3 w-3" />
            <span>
              {metrics.uploadDate 
                ? format(metrics.uploadDate, "dd 'de' MMMM, yyyy", { locale: es })
                : postData.created_at 
                ? format(new Date(postData.created_at), "dd 'de' MMMM, yyyy", { locale: es })
                : 'Fecha no disponible'}
            </span>
          </div>
        </div>
      </div>

      {/* Contenido del post */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Miniatura del post */}
        <div className="space-y-3">
          <div className="aspect-video w-full rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg">
            {postImage ? (
              <img 
                src={postImage} 
                alt="Post" 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <Image className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Sin imagen</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Información del contenido */}
        <div className="space-y-4">
          {/* Título del post */}
          {postTitle && (
            <div className=" rounded-lg">
              <h4 className="text-sm font-semibold text-black mb-2">Titulo del Post</h4>
              <p className="text-sm text-gray-700 leading-relaxed line-clamp-4">
                {postTitle}
              </p>
            </div>
          )}

          {/* Métricas del post */}
          <div className=" rounded-lg">
            <h4 className="text-sm font-semibold text-black mb-3">Métricas de Rendimiento</h4>
            <PostMetrics postData={postData} />
          </div>
        </div>
      </div>
    </div>
  );
}; 