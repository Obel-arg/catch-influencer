import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, Lightbulb, AlertCircle } from "lucide-react";
import { CampaignInsight } from "@/hooks/use-campaign-insights";

interface CampaignInsightsCardProps {
  insights: any;
  loading: boolean;
  error: string | null;
  postsLoading: boolean;
  campaignPosts: any[];
  onGenerateInsights: (campaignId: string) => void;
  onClearError: () => void;
  campaignId: string;
}

export const CampaignInsightsCard = ({
  insights,
  loading,
  error,
  postsLoading,
  campaignPosts,
  onGenerateInsights,
  onClearError,
  campaignId
}: CampaignInsightsCardProps) => {
  return (
    <Card className="bg-white border-gray-200">
      <CardHeader className="pb-2 pt-3 px-4 bg-purple-600 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-white" />
            <h3 className="text-sm font-semibold text-white">Insights IA</h3>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col justify-center min-h-[280px] space-y-4">
        {/* Verificar si la campaña tiene posts */}
        {!postsLoading && campaignPosts.length === 0 ? (
          <div className="p-4 rounded-lg">
            <div className="flex items-center gap-2 text-black mb-2">
              <Lightbulb className="h-4 w-4" />
              <span className="text-sm font-medium">Sin posts para analizar</span>
            </div>
            <p className="text-sm text-gray-700 mb-3">
              Para ver insights de IA, necesitas agregar posts a esta campaña.
            </p>
          </div>
        ) : (
          <>
            {/* Mostrar skeleton si está cargando O si hay posts pero no hay insights aún */}
            {(loading || (campaignPosts.length > 0 && !insights && !error)) && (
              <div className="space-y-4">
                {/* Skeleton para el insight */}
                <div className="p-4 rounded-lg bg-white">
                  <div className="flex">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {/* Skeleton para el título */}
                        <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                      </div>
                      {/* Skeleton para la descripción */}
                      <div className="space-y-2 mb-3">
                        <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                      </div>
                      {/* Skeleton para la recomendación */}
                      <div className="bg-blue-50 p-3 rounded-md">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="h-3 w-3 bg-blue-200 rounded animate-pulse"></div>
                          <div className="h-3 bg-blue-200 rounded w-20 animate-pulse"></div>
                        </div>
                        <div className="space-y-1">
                          <div className="h-2 bg-blue-200 rounded w-full animate-pulse"></div>
                          <div className="h-2 bg-blue-200 rounded w-2/3 animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                <div className="flex items-center gap-2 text-red-600 mb-2">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Error</span>
                </div>
                <p className="text-sm text-red-700 mb-3">
                  Falló al realizar los Insights, recargue la página para reintentarlo
                </p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-xs"
                  onClick={() => {
                    window.location.reload();
                  }}
                >
                  Reintentar
                </Button>
              </div>
            )}

            {insights && !loading && !error && (
              <>
                {/* Insight principal */}
                {insights.insights.length > 0 && (
                  <div className="p-4 rounded-lg bg-white">
                    <div className="flex ">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900 text-sm">{insights.insights[0].title}</h4>
                        </div>
                        <p className="text-sm text-gray-700 mb-3">{insights.insights[0].description}</p>
                        
                        {insights.insights[0].recommendation && (
                          <div className="bg-blue-50 p-3 rounded-md">
                            <div className="flex items-center gap-2 text-blue-600 mb-1">
                              <Lightbulb className="h-3 w-3" />
                              <span className="text-xs font-medium">Recomendación:</span>
                            </div>
                            <p className="text-xs text-blue-700">{insights.insights[0].recommendation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}; 