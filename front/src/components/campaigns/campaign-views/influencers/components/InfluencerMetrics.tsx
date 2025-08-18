import { formatNumber } from "./InfluencerUtils";

interface InfluencerMetricsProps {
  followersCount?: number;
  averageEngagementRate?: number;
  postsCount: number;
}

export const InfluencerMetrics = ({ 
  followersCount, 
  averageEngagementRate, 
  postsCount 
}: InfluencerMetricsProps) => {
  return (
    <div className="grid grid-cols-3 gap-2 mt-3 text-center">
      <div className="rounded-lg border p-2 bg-gray-50 border-gray-100">
        <div className="text-xs text-gray-600">Seguidores</div>
        <div className="font-semibold text-gray-800">
          {followersCount ? formatNumber(followersCount) : 'N/A'}
        </div>
      </div>
      <div className="rounded-lg border p-2 bg-slate-50 border-slate-100">
        <div className="text-xs text-slate-600">Engagement</div>
        <div className="font-semibold text-slate-800">
          {averageEngagementRate 
            ? `${(averageEngagementRate * 100).toFixed(1)}%`
            : 'N/A'
          }
        </div>
      </div>
      <div className="rounded-lg border p-2 bg-stone-50 border-stone-100">
        <div className="text-xs text-stone-600">Posts</div>
        <div className="font-semibold text-stone-800">
          {postsCount}
        </div>
      </div>
    </div>
  );
}; 