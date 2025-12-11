import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TrendingUp, FileImage } from "lucide-react";
import { getActivePlatformUsernames, getPlatformProfileUrl } from "./InfluencerUtils";
import { useRouter } from "next/navigation";

interface InfluencerActionsProps {
  influencerId: string;
  influencerName: string;
  platformInfo: any;
  activePlatforms: string[];
  onAddPost: (influencerId: string, influencerName: string) => void;
  campaignId?: string; // 🎯 NUEVO: ID de la campaña para contexto de navegación
}

export const InfluencerActions = ({ 
  influencerId, 
  influencerName, 
  platformInfo, 
  activePlatforms, 
  onAddPost,
  campaignId // 🎯 NUEVO: ID de la campaña
}: InfluencerActionsProps) => {
  const usernames = getActivePlatformUsernames(platformInfo, activePlatforms);
  const router = useRouter();
  
  const renderViewProfileButton = () => {
    // 🎯 NUEVA LÓGICA: Construir URL con parámetros de contexto
    const getProfileUrl = () => {
      const baseUrl = `/influencers/${influencerId}`;
      const params = new URLSearchParams();
      
      if (campaignId) {
        params.append('redirect', 'campaign');
        params.append('campaignId', campaignId);
        params.append('tab', 'influencers'); // 🎯 NUEVO: Agregar tab para volver a influencers
      }
      
      const queryString = params.toString();
      return queryString ? `${baseUrl}?${queryString}` : baseUrl;
    };

    return (
      <Button
        variant="outline"
        size="sm"
        className="text-xs hover:bg-blue-50 hover:text-blue-600"
        style={{ borderColor: '#e5e7eb' }}
        onClick={() => router.push(getProfileUrl())}
      >
        <TrendingUp className="h-3.5 w-3.5 mr-1" />
        <span className="ml-1">Ver perfil</span>
      </Button>
    );
  };

  return (
    <div className="flex items-center justify-end mt-4 gap-3">
      <Button
        onClick={() => onAddPost(influencerId, influencerName)}
        variant="outline"
        size="sm"
        className="text-xs gap-1 hover:bg-blue-50 hover:text-blue-600 px-2 py-1 h-7 min-w-0"
        style={{ borderColor: '#e5e7eb' }}
      >
        <FileImage className="h-3 w-3" />
        <span className="text-xs">Add Post</span>
      </Button>
    </div>
  );
}; 