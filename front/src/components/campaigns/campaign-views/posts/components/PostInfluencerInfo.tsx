import { Users } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { InfluencerPost } from "@/lib/services/influencer-posts";
import { getPlatformInfluencerId, getSmallPlatformIcon } from "./PostUtils";
import { ImageProxyService } from "@/lib/services/image-proxy.service";
import { LazyInfluencerAvatar } from "@/components/explorer/LazyInfluencerAvatar";

interface PostInfluencerInfoProps {
  post: InfluencerPost;
  uploadDate: Date | null;
}

export const PostInfluencerInfo = ({ post, uploadDate }: PostInfluencerInfoProps) => {
  const platformId = getPlatformInfluencerId(post.influencers?.platform_info, post.platform, post.influencers?.name);
  const platformLower = (post.platform || '').toLowerCase();
  const url = post.post_url || '';

  const getContentTypeLabel = (): string | null => {
    if (!platformLower) return null;
    if (platformLower === 'youtube') {
      return url.includes('/shorts/') ? 'Short' : 'Video';
    }
    if (platformLower === 'tiktok') {
      return 'Video';
    }
    if (platformLower === 'twitter') {
      return 'Post';
    }
    if (platformLower === 'instagram') {
      if (url.includes('/reel/')) return 'Reel';
      return 'Post';
    }
    return null;
  };
  const contentTypeLabel = getContentTypeLabel();

  const getTypeChipClass = () => {
    switch (platformLower) {
      case 'youtube':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'instagram':
        return 'bg-pink-50 text-pink-700 border-pink-200';
      case 'twitter':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'tiktok':
        return 'bg-gray-900 text-white border-gray-900';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="flex items-center justify-between mt-1">
      <div className="flex items-center space-x-1">
        <LazyInfluencerAvatar 
          influencer={{
            name: post.influencers?.name || 'Influencer',
            avatar: post.influencers?.avatar || ''
          }}
          className="w-5 h-5"
        />
        <div>
          <p className="font-semibold text-xs text-gray-900">
            {post.influencers?.name || 'Influencer'}
          </p>
          <div className="flex items-center space-x-1.5">
            {getSmallPlatformIcon(post.platform)}
            {/* Tipo de contenido oculto temporalmente
            {contentTypeLabel && (
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium border ${getTypeChipClass()}`}>
                {contentTypeLabel}
              </span>
            )}
            */}
            <p className="text-xs text-gray-500">
              {platformId ? (platformId.startsWith('@') ? platformId : `@${platformId}`) : `@${post.influencers?.name || 'Influencer'}`}
            </p>
          </div>

        </div>
      </div>
      <div className="text-right">
        <p className="text-xs text-gray-500">
          {uploadDate ? format(uploadDate, "dd MMM yyyy", { locale: es }) : 
           (post.created_at ? format(new Date(post.created_at), "dd MMM yyyy", { locale: es }) : '')}
        </p>
      </div>
    </div>
  );
}; 