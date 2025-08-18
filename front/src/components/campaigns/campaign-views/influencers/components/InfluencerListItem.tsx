import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, BarChart3, Star, Plus, Trash2 } from "lucide-react";
import { LazyInfluencerAvatar } from "@/components/explorer/LazyInfluencerAvatar";
import { PlatformIconsRow } from "./PlatformIconsRow";
import { calculatePerformanceScore } from "./InfluencerUtils";

interface InfluencerListItemProps {
  campaignInfluencer: any;
  postsCount: number;
  activePlatforms: string[];
  onAddPost: (influencerId: string, influencerName: string) => void;
  onDeleteInfluencer: (influencerId: string, influencerName: string) => void;
}

export const InfluencerListItem = ({ 
  campaignInfluencer, 
  postsCount, 
  activePlatforms,
  onAddPost,
  onDeleteInfluencer
}: InfluencerListItemProps) => {
  const influencer = campaignInfluencer.influencers;
  
  if (!influencer) return null;

  const handleAddPost = () => {
    onAddPost(influencer.id, influencer.name || 'Influencer');
  };

  const handleDelete = () => {
    onDeleteInfluencer(influencer.id, influencer.name || 'Influencer');
  };

  const formatFollowers = (count?: number) => {
    if (!count) return '-';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <Card className="hover:shadow-md transition-shadow bg-white border-0 relative group">
      {/* Botón de eliminación en esquina superior derecha */}
      <div className="absolute top-2 right-2 z-10">
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
      
      <CardContent className="pt-4 pb-2 px-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Información principal del influencer */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Avatar */}
            <LazyInfluencerAvatar 
              influencer={{
                name: influencer?.name || 'Influencer',
                avatar: influencer?.avatar || ''
              }}
              className="h-12 w-12 flex-shrink-0"
            />

            {/* Detalles del influencer */}
            <div className="flex-1 min-w-0">
              {/* Nombre del influencer */}
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900 truncate">
                  {influencer.name}
                </h3>
                {influencer.verification_status === 'verified' && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs flex-shrink-0">
                    Verificado
                  </Badge>
                )}
              </div>

              {/* Íconos de plataformas clickeables */}
              <div className="mb-2">
                <PlatformIconsRow 
                  platformInfo={influencer?.platform_info}
                  activePlatforms={activePlatforms}
                />
              </div>
              
              {/* Métricas principales */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-gray-600">
                {/* Seguidores */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Users className="h-4 w-4" />
                  <span className="whitespace-nowrap">{formatFollowers(influencer.followers_count)} seguidores</span>
                </div>

                {/* Posts en la campaña */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <BarChart3 className="h-4 w-4" />
                  <span className="whitespace-nowrap">{postsCount} posts</span>
                </div>

                {/* Engagement */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="text-xs text-gray-500">Engagement:</span>
                  <span className="font-medium text-gray-700 whitespace-nowrap">
                    {influencer?.average_engagement_rate 
                      ? `${(influencer.average_engagement_rate * 100).toFixed(1)}%`
                      : 'N/A'
                    }
                  </span>
                </div>

                {/* Performance */}
                {influencer?.status === 'active' && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="text-xs text-gray-500">Performance:</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                      <span className="font-medium text-gray-700 whitespace-nowrap">
                        {calculatePerformanceScore(influencer)}/100
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Botón Add Post - abajo a la derecha */}
        <Button
          onClick={handleAddPost}
          size="sm"
          className="absolute bottom-2 right-2 bg-white hover:bg-gray-50 text-black border border-gray-300 hover:border-gray-400 px-2 py-1 h-6 text-xs"
          title="Add Post"
        >
          <Plus className="h-3 w-3 mr-1 text-black" />
          <span className="whitespace-nowrap text-black">Add Post</span>
        </Button>
      </CardContent>
    </Card>
  );
}; 