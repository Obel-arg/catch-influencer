import { Eye, Heart, MessageCircle } from "lucide-react";
import { formatNumber } from "./PostUtils";

interface PostMetricsProps {
  views: number | string;
  likes: number | string;
  comments: number | string;
  platform?: string;
  postUrl?: string;
}

export const PostMetrics = ({ views, likes, comments, platform, postUrl }: PostMetricsProps) => {
  return (
    <div className="grid grid-cols-3 gap-1 py-0.5">
      <div className="text-center">
        <div className="bg-blue-500/5 rounded">
          <div className="flex items-center justify-center px-1 py-1">
            <Eye className="h-3 w-3 text-blue-500 mr-1 drop-shadow-sm" />
            <p className="text-xs font-bold text-blue-500 drop-shadow-sm">
              {formatNumber(views, { 
                isReach: true, 
                platform, 
                likes, 
                comments,
                postUrl
              })}
            </p>
          </div>
          <p className="text-xs text-blue-500 px-1 pb-1">Alcance</p>
        </div>
      </div>
      <div className="text-center">
        <div className="bg-pink-500/5 rounded">
          <div className="flex items-center justify-center px-1 py-1">
            <Heart className="h-3 w-3 text-pink-500 mr-1 drop-shadow-sm" />
            <p className="text-xs font-bold text-pink-500 drop-shadow-sm">{formatNumber(likes)}</p>
          </div>
          <p className="text-xs text-pink-500 px-1 pb-1">Likes</p>
        </div>
      </div>
      <div className="text-center">
        <div className="bg-purple-500/5 rounded">
          <div className="flex items-center justify-center px-1 py-1">
            <MessageCircle className="h-3 w-3 text-purple-500 mr-1 drop-shadow-sm" />
            <p className="text-xs font-bold text-purple-500 drop-shadow-sm">{formatNumber(comments)}</p>
          </div>
          <p className="text-xs text-purple-500 px-1 pb-1">Comentarios</p>
        </div>
      </div>
    </div>
  );
}; 