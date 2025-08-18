import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { LazyInfluencerAvatar } from "@/components/explorer/LazyInfluencerAvatar";
import { InfluencerCategories } from "./InfluencerCategories";
import { InfluencerPlatformDisplay } from "./InfluencerPlatformDisplay";
import { InfluencerMetrics } from "./InfluencerMetrics";
import { InfluencerPerformanceBar } from "./InfluencerPerformanceBar";
import { InfluencerActions } from "./InfluencerActions";
import { getInfluencerStatusBadge, calculatePerformanceScore } from "./InfluencerUtils";

interface InfluencerCardProps {
  campaignInfluencer: any;
  postsCount: number;
  activePlatforms: string[];
  onAddPost: (influencerId: string, influencerName: string) => void;
  onDeleteInfluencer: (influencerId: string, influencerName: string) => void;
  campaignId?: string; // 🎯 NUEVO: ID de la campaña para contexto de navegación
}

export const InfluencerCard = ({ 
  campaignInfluencer, 
  postsCount, 
  activePlatforms, 
  onAddPost,
  onDeleteInfluencer,
  campaignId // 🎯 NUEVO: ID de la campaña
}: InfluencerCardProps) => {
  const influencer = campaignInfluencer.influencers;
  
  // Validar que el influencer existe
  if (!influencer) {
    console.warn('Influencer data is null for campaign influencer:', campaignInfluencer.id);
    return null;
  }
  
  const performanceScore = calculatePerformanceScore(influencer);
  const isActive = influencer?.status === 'active';
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteInfluencer(influencer.id, influencer.name);
  };
  
  return (
    <Card key={campaignInfluencer.id} className="overflow-hidden bg-white border-gray-200 border hover:shadow-md transition-all flex flex-col h-full group">
      <div className="relative">
        <div className="absolute top-2 right-2 z-10">
          {getInfluencerStatusBadge(influencer?.status || '')}
        </div>
        <div className="absolute top-2 left-2 z-10">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-50/30 bg-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            onClick={handleDelete}
            title="Eliminar influencer"
          >
            <Trash2 className="h-2.5 w-2.5" />
          </Button>
        </div>
        <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
      </div>

      <div className="px-4 -mt-16 relative">
        <LazyInfluencerAvatar 
          influencer={{
            name: influencer?.name || 'Influencer',
            avatar: influencer?.avatar || ''
          }}
          className="h-20 w-20 border-4 border-white shadow-lg"
        />

        <div className="mt-4 text-center">
          <h3 className="font-semibold text-lg">{influencer?.name || 'Nombre no disponible'}</h3>
          <InfluencerPlatformDisplay 
            platformInfo={influencer?.platform_info}
            activePlatforms={activePlatforms}
          />
          <InfluencerCategories 
            platformInfo={influencer?.platform_info}
            staticCategories={influencer?.categories || []}
          />
        </div>
      </div>

      <CardContent className="p-4 pt-2 pb-2 flex flex-col flex-1">
        <div className="flex-1">
          <InfluencerMetrics 
            followersCount={influencer?.followers_count}
            averageEngagementRate={influencer?.average_engagement_rate}
            postsCount={postsCount}
          />

          <InfluencerPerformanceBar 
            score={performanceScore}
            isActive={isActive}
          />
        </div>

        {/* Botones fijos en la parte inferior */}
        <div className="mt-auto pt-2">
          <InfluencerActions 
            influencerId={influencer?.id || ''}
            influencerName={influencer?.name || 'Influencer'}
            platformInfo={influencer?.platform_info}
            activePlatforms={activePlatforms}
            onAddPost={onAddPost}
            campaignId={campaignId} // 🎯 NUEVO: Pasar el ID de la campaña
          />
        </div>
      </CardContent>
    </Card>
  );
}; 