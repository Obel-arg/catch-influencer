import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Eye, 
  Heart, 
  MessageCircle,
  ThumbsUp,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { Campaign, CampaignGoal } from "@/types/campaign";
import { useCampaignMetrics } from "@/hooks/campaign/useCampaignMetrics";
import { useCampaignContext } from "@/contexts/CampaignContext";

interface CampaignMetricsCardsProps {
  campaign: Campaign;
}

// Skeleton component for metric cards
const MetricCardSkeleton = () => (
  <Card className="bg-white border-gray-200">
    <CardContent className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 mt-4">
          {/* Icon skeleton */}
          <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
          {/* Title skeleton */}
          <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
        </div>
        {/* Trend badge skeleton */}
        <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full mt-4">
          <div className="h-3 w-3 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded w-12 animate-pulse"></div>
        </div>
      </div>
      <div className="space-y-1">
        {/* Main value skeleton */}
        <div className="text-2xl font-bold">
          <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
        </div>
        {/* Subtitle skeleton */}
        <div className="text-xs text-gray-500">
          <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
        </div>
        {/* Extra space to make card taller */}
        <div className="h-4"></div>
      </div>
    </CardContent>
  </Card>
);

export const CampaignMetricsCards = ({ campaign }: CampaignMetricsCardsProps) => {
  const { metrics, loading } = useCampaignMetrics(campaign.id);
  const { posts: campaignPosts, postsLoading } = useCampaignContext();

  // Usar el engagement del backend si existe, sino el calculado localmente
  const backendEngagement = campaign.avg_engagement_rate || 0;

  // Parse campaign goals from JSON string format
  const parseCampaignGoals = (goals: any): CampaignGoal[] => {
    if (!goals) return [];

    // Si es un string JSON, parsear todo el array
    if (typeof goals === 'string') {
      try {
        const parsed = JSON.parse(goals);
        return parseCampaignGoals(parsed);
      } catch {
        return [];
      }
    }

    // Si es un array de strings JSON, parsear cada uno
    if (Array.isArray(goals)) {
      return goals.map((goal: any) => {
        if (typeof goal === 'string') {
          try {
            return JSON.parse(goal);
          } catch {
            return null;
          }
        }
        return goal;
      }).filter((g): g is CampaignGoal => g && typeof g.type === 'string' && typeof g.value !== 'undefined');
    }

    // Si es un solo objeto
    if (typeof goals === 'object' && goals !== null && typeof goals.type === 'string') {
      return [goals];
    }

    return [];
  };

  // Get campaign goals
  const campaignGoals = parseCampaignGoals(campaign.goals);

  // Get goal value by type
  const getGoalByType = (type: string): CampaignGoal | undefined => {
    return campaignGoals.find(goal => goal.type === type);
  };

  // Format goal display
  const formatGoalDisplay = (goal: CampaignGoal | undefined): string => {
    if (!goal) return "Sin objetivo";
    const formattedValue = formatNumber(goal.value);
    return `Objetivo: ${formattedValue} ${goal.unit}`;
  };

  // Format number for display
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Check if campaign has no posts
  const hasNoPosts = !postsLoading && campaignPosts.length === 0;
  
  // Calculate engagement value early (needed in both branches)
  const engagementValue = backendEngagement > 0 ? backendEngagement : (metrics?.engagement.average || 0);
    
  // If no posts, show zero values instead of skeleton
  if (hasNoPosts) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <Card className="bg-white border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 mt-4">
                <Eye className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-gray-600">Reach</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold">0</div>
              <div className="text-xs text-gray-500">{formatGoalDisplay(getGoalByType('Reach'))}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 mt-4">
                <Heart className="h-5 w-5 text-pink-600" />
                <span className="text-sm text-gray-600">Engagement</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold">{engagementValue.toFixed(1)}%</div>
              <div className="text-xs text-gray-500">{formatGoalDisplay(getGoalByType('Engagement'))}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 mt-4">
                <ThumbsUp className="h-5 w-5 text-green-600" />
                <span className="text-sm text-gray-600">Likes</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold">0</div>
              <div className="text-xs text-gray-500">{formatGoalDisplay(getGoalByType('Likes'))}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 mt-4">
                <MessageCircle className="h-5 w-5 text-purple-600" />
                <span className="text-sm text-gray-600">Comentarios</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold">0</div>
              <div className="text-xs text-gray-500">{formatGoalDisplay(getGoalByType('Comments'))}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show skeletons while loading or if no metrics data
  if (loading || !metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
      </div>
    );
  }

  // Get reach data
  const reachValue = metrics?.reach.total || 0;
  const reachGoal = campaign.goals?.find(g => g.type === 'Reach');
  const reachTarget = reachGoal?.value || 0;
  const reachProgress = reachTarget > 0 ? Math.min((reachValue / reachTarget) * 100, 100) : 0;
  
  // Calculate reach variation percentage
  const reachVariation = reachTarget > 0 ? ((reachValue - reachTarget) / reachTarget) * 100 : 0;
  const reachTrend = reachVariation > 0 ? `+${reachVariation.toFixed(1)}%` : `${reachVariation.toFixed(1)}%`;
  const reachTrendColor = reachVariation >= 0 ? 'text-green-600' : 'text-red-600';
  const reachTrendBg = reachVariation >= 0 ? 'bg-green-100' : 'bg-red-100';
  const reachTrendIcon = reachVariation >= 0 ? <ArrowUp className="h-3 w-3 text-green-600" /> : <ArrowDown className="h-3 w-3 text-red-600" />;

  // Get engagement data (already calculated above)
  const engagementGoal = campaign.goals?.find(g => g.type === 'Engagement');
  const engagementTarget = engagementGoal?.value || 0;
  const engagementProgress = engagementTarget > 0 ? Math.min((engagementValue / engagementTarget) * 100, 100) : 0;
  
  // Calculate engagement variation percentage
  const engagementVariation = engagementTarget > 0 ? ((engagementValue - engagementTarget) / engagementTarget) * 100 : 0;
  const engagementTrend = engagementVariation > 0 ? `+${engagementVariation.toFixed(1)}%` : `${engagementVariation.toFixed(1)}%`;
  const engagementTrendColor = engagementVariation >= 0 ? 'text-green-600' : 'text-red-600';
  const engagementTrendBg = engagementVariation >= 0 ? 'bg-green-100' : 'bg-red-100';
  const engagementTrendIcon = engagementVariation >= 0 ? <ArrowUp className="h-3 w-3 text-green-600" /> : <ArrowDown className="h-3 w-3 text-red-600" />;

  // Get likes data
  const likesValue = metrics?.likes.total || 0;
  const likesGoal = campaign.goals?.find(g => g.type === 'Likes');
  const likesTarget = likesGoal?.value || 0;
  const likesVariation = likesTarget > 0 ? ((likesValue - likesTarget) / likesTarget) * 100 : 0;
  const likesTrend = likesVariation > 0 ? `+${likesVariation.toFixed(1)}%` : `${likesVariation.toFixed(1)}%`;
  const likesTrendColor = likesVariation >= 0 ? 'text-green-600' : 'text-red-600';
  const likesTrendBg = likesVariation >= 0 ? 'bg-green-100' : 'bg-red-100';
  const likesTrendIcon = likesVariation >= 0 ? <ArrowUp className="h-3 w-3 text-green-600" /> : <ArrowDown className="h-3 w-3 text-red-600" />;

  // Get comments data
  const commentsValue = metrics?.comments.total || 0;
  const commentsGoal = campaign.goals?.find(g => g.type === 'Comments');
  const commentsTarget = commentsGoal?.value || 0;
  const commentsVariation = commentsTarget > 0 ? ((commentsValue - commentsTarget) / commentsTarget) * 100 : 0;
  const commentsTrend = commentsVariation > 0 ? `+${commentsVariation.toFixed(1)}%` : `${commentsVariation.toFixed(1)}%`;
  const commentsTrendColor = commentsVariation >= 0 ? 'text-green-600' : 'text-red-600';
  const commentsTrendBg = commentsVariation >= 0 ? 'bg-green-100' : 'bg-red-100';
  const commentsTrendIcon = commentsVariation >= 0 ? <ArrowUp className="h-3 w-3 text-green-600" /> : <ArrowDown className="h-3 w-3 text-red-600" />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      <Card className="bg-white border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 mt-4">
              <Eye className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-gray-600">Reach</span>
            </div>
            {reachTarget > 0 ? (
              <div className={`flex items-center gap-1 px-2 py-1 ${reachTrendBg} rounded-full mt-4`}>
                {reachTrendIcon}
                <span className={`text-xs ${reachTrendColor} font-medium`}>{reachTrend}</span>
              </div>
            ) : null}
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold">
              {formatNumber(reachValue)}
            </div>
            <div className="text-xs text-gray-500">
              {reachTarget > 0 ? `Objetivo: ${formatNumber(reachTarget)}` : 'Sin objetivo'}
            </div>
            {reachTarget > 0 && (
              <Progress value={reachProgress} className="h-1" />
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 mt-4">
              <Heart className="h-5 w-5 text-pink-600" />
              <span className="text-sm text-gray-600">Engagement</span>
            </div>
            {engagementTarget > 0 ? (
              <div className={`flex items-center gap-1 px-2 py-1 ${engagementTrendBg} rounded-full mt-4`}>
                {engagementTrendIcon}
                <span className={`text-xs ${engagementTrendColor} font-medium`}>{engagementTrend}</span>
              </div>
            ) : null}
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold">
              {`${engagementValue.toFixed(1)}%`}
            </div>
            <div className="text-xs text-gray-500">
              {engagementTarget > 0 ? `Objetivo: ${engagementTarget}%` : 'Sin objetivo'}
            </div>
            {engagementTarget > 0 && (
              <Progress value={engagementProgress} className="h-1" />
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 mt-4">
              <ThumbsUp className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-600">Likes</span>
            </div>
            {likesTarget > 0 ? (
              <div className={`flex items-center gap-1 px-2 py-1 ${likesTrendBg} rounded-full mt-4`}>
                {likesTrendIcon}
                <span className={`text-xs ${likesTrendColor} font-medium`}>{likesTrend}</span>
              </div>
            ) : null}
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold">
              {formatNumber(likesValue)}
            </div>
            <div className="text-xs text-gray-500">
              {likesTarget > 0 ? `Objetivo: ${formatNumber(likesTarget)}` : 'Sin objetivo'}
            </div>
            {likesTarget > 0 && (
              <Progress value={Math.min((likesValue / likesTarget) * 100, 100)} className="h-1" />
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 mt-4">
              <MessageCircle className="h-5 w-5 text-purple-600" />
              <span className="text-sm text-gray-600">Comentarios</span>
            </div>
            {commentsTarget > 0 ? (
              <div className={`flex items-center gap-1 px-2 py-1 ${commentsTrendBg} rounded-full mt-4`}>
                {commentsTrendIcon}
                <span className={`text-xs ${commentsTrendColor} font-medium`}>{commentsTrend}</span>
              </div>
            ) : null}
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold">
              {formatNumber(commentsValue)}
            </div>
            <div className="text-xs text-gray-500">
              {commentsTarget > 0 ? `Objetivo: ${formatNumber(commentsTarget)}` : 'Sin objetivo'}
            </div>
            {commentsTarget > 0 && (
              <Progress value={Math.min((commentsValue / commentsTarget) * 100, 100)} className="h-1" />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 