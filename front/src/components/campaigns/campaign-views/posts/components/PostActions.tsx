import { BarChart3, Loader2, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSentimentComponent } from "./PostUtils";

interface PostActionsProps {
  sentiment?: 'Positivo' | 'Negativo' | 'Neutral';
  sentimentLoading?: boolean;
  platform: string;
  onAnalyze: () => void;
  postUrl?: string;
  metrics?: {
    views: number | string;
    likes: number | string;
    comments: number | string;
  };
}

export const PostActions = ({ sentiment, sentimentLoading, platform, onAnalyze, postUrl, metrics }: PostActionsProps) => {
  // Detectar si es una historia de Instagram
  const isInstagramStory = platform?.toLowerCase() === 'instagram' && postUrl && /instagram\.com\/stories\//i.test(postUrl);
  
  // Detectar si tiene métricas reales (para historias)
  const hasRealMetrics = metrics && 
                        metrics.views !== '...' && 
                        metrics.likes !== '...' && 
                        metrics.comments !== '...' &&
                        (metrics.views !== 0 || metrics.likes !== 0 || metrics.comments !== 0);

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        {/* Sentimiento predominante */}
        <div className="flex-1">
          {sentimentLoading ? (
            <div className="flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
              <span className="text-xs text-gray-400">Cargando...</span>
            </div>
          ) : sentiment ? (
            getSentimentComponent(sentiment)
          ) : isInstagramStory ? (
            hasRealMetrics ? (
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-600 font-medium">Completed</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-purple-500" />
                <span className="text-xs text-purple-600 font-medium">TBC</span>
              </div>
            )
          ) : (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-orange-500" />
              <span className="text-xs text-orange-600 font-medium">En Progreso</span>
            </div>
          )}
        </div>
        
        {/* Botón de análisis compacto */}
        <Button
          variant="ghost"
          size="sm"
          className="px-0.5 py-0 rounded border border-gray-300 text-xs font-medium bg-white hover:bg-blue-50 transition-colors h-3 leading-none"
          onClick={onAnalyze}
          disabled={!['youtube', 'tiktok', 'twitter', 'instagram'].includes(platform.toLowerCase())}
        >
          {isInstagramStory ? 'Completar métricas' : 'Ver análisis'}
        </Button>
      </div>
    </div>
  );
}; 