import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Eye
} from "lucide-react";
import { useRouter } from "next/navigation";
import { BrandInfluencer } from "@/hooks/brands/useBrandInfluencers";
import {
  InfluencerPlatformDisplay,
  InfluencerCategories,
  InfluencerMetrics,
  InfluencerPerformanceBar,
  calculatePerformanceScore,
  getInfluencerStatusBadge
} from "@/components/campaigns/campaign-views/influencers/components";

interface BrandInfluencerCardProps {
  brandInfluencer: BrandInfluencer;
  brandId: string;
}

export const BrandInfluencerCard = ({ 
  brandInfluencer, 
  brandId 
}: BrandInfluencerCardProps) => {
  const router = useRouter();
  const influencer = brandInfluencer.influencers;
  
  // Validar que el influencer existe
  if (!influencer) {
    console.warn('Influencer data is null for brand influencer:', brandInfluencer.id);
    return null;
  }
  
  // 🔍 DEBUG - Verificar avatar en componente
  console.log('🎨 CARD - Influencer:', influencer?.name, 'Avatar:', influencer?.avatar);
  
  const performanceScore = calculatePerformanceScore(influencer);
  const isActive = influencer?.status === 'active';
  
  const handleViewInfluencerDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/influencers/${brandInfluencer.influencer_id}?redirect=brands&brandId=${brandId}&tab=influencers`);
  };
  
  const handleViewInfluencer = () => {
    // Navegación a detalle del influencer desde card click
    router.push(`/influencers/${brandInfluencer.influencer_id}?redirect=brands&brandId=${brandId}&tab=influencers`);
  };

  return (
    <Card 
      key={brandInfluencer.id} 
      className="overflow-hidden bg-white border-gray-200 border hover:shadow-md transition-all flex flex-col h-full group cursor-pointer"
      onClick={handleViewInfluencer}
    >
      <div className="relative">
        <div className="absolute top-2 right-2 z-10">
          {getInfluencerStatusBadge(influencer?.status || '')}
        </div>
        <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
      </div>

      <div className="px-4 -mt-16 relative">
        <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
          <AvatarImage src={influencer?.avatar || ''} alt={influencer?.name || 'Influencer'} />
          <AvatarFallback className="bg-blue-100 text-blue-700">
            {influencer?.name?.charAt(0) || 'IN'}
          </AvatarFallback>
        </Avatar>

        <div className="mt-4 text-center">
          <h3 className="font-semibold text-lg">{influencer?.name || 'Nombre no disponible'}</h3>
          <InfluencerPlatformDisplay 
            platformInfo={influencer?.platform_info}
            activePlatforms={[influencer?.main_social_platform || '']}
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
            postsCount={0} // No tenemos esta info en este contexto
          />

          <InfluencerPerformanceBar 
            score={performanceScore}
            isActive={isActive}
          />
        </div>

        {/* Botón para ver influencer */}
        <div className="mt-4 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full h-8 text-xs"
            onClick={handleViewInfluencerDetails}
          >
            <Eye className="h-3 w-3 mr-1" />
            Ver Influencer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}; 