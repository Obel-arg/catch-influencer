import React from 'react';
import { Eye, Heart, MessageCircle } from 'lucide-react';
import { formatMetricNumber, extractMetricsFromRawResponse } from './MetricsUtils';

interface PostMetricsProps {
  postData: any;
}

export const PostMetrics: React.FC<PostMetricsProps> = ({ postData }) => {
  if (!postData) return null;

  const metrics = extractMetricsFromRawResponse(postData);

  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="text-left">
        <div className="rounded p-1">
          <div className="flex items-center justify-start gap-1">
            <Eye className="h-3 w-3 text-black" />
            <p className="text-xs font-bold text-black">
              {formatMetricNumber(metrics.views, {
                isReach: true,
                platform: postData.platform,
                likes: metrics.likes,
                comments: metrics.comments
              })}
            </p>
          </div>
          <p className="text-xs">Alcance</p>
        </div>
      </div>
      <div className="text-left">
        <div className="rounded p-1">
          <div className="flex items-center justify-start gap-1">
            <Heart className="h-3 w-3 text-black" />
            <p className="text-xs font-bold text-black">{formatMetricNumber(metrics.likes)}</p>
          </div>
          <p className="text-xs text-black">Likes</p>
        </div>
      </div>
      <div className="text-left">
        <div className="rounded p-1">
          <div className="flex items-center justify-start gap-1">
            <MessageCircle className="h-3 w-3 text-black" />
            <p className="text-xs font-bold text-black">{formatMetricNumber(metrics.comments)}</p>
          </div>
          <p className="text-xs text-black">Comentarios</p>
        </div>
      </div>
    </div>
  );
}; 