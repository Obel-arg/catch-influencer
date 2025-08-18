import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { BarChart3, Sparkles } from "lucide-react";
import { SentimentAnalysisService, SentimentAnalysisData } from "@/lib/services/analysis/sentiment-analysis.service";
import { Badge } from "@/components/ui/badge";
import { httpApiClient } from "@/lib/http";
import { useCampaignContext } from "@/contexts/CampaignContext";

// Componentes separados
import { PostInformation } from './components/PostInformation';
import { SentimentAnalysis } from './components/SentimentAnalysis';
import { PostDetails } from './components/PostDetails';
import { LoadingState, ErrorState, NoDataState } from './components/LoadingState';
import StoryAnalysis from './StoryAnalysis';

// Extender la interfaz para incluir las métricas avanzadas
interface ExtendedSentimentAnalysisData extends SentimentAnalysisData {
  reach_estimate?: number;
  engagement_rate?: number;
  conversion_estimate?: number;
  conversion_rate?: number;
  impression_estimate?: number;
  virality_score?: number;
  influence_score?: number;
}

interface AnalysisSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  postUrl: string;
  postImage?: string;
  platform: string;
  postId: string;
  postData?: any;
}

export const AnalysisSidebar: React.FC<AnalysisSidebarProps> = React.memo(({
  isOpen,
  onClose,
  postUrl,
  postImage,
  platform,
  postId,
  postData
}) => {
  const [analysisData, setAnalysisData] = useState<ExtendedSentimentAnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keyTopics, setKeyTopics] = useState<string[]>([]);
  const [currentPostId, setCurrentPostId] = useState<string | null>(null);
  
  // Usar useRef para el timeout para evitar dependencias circulares
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // ✅ NUEVO: Hook para forzar recarga de posts cuando se guardan métricas manuales
  const { refetch } = useCampaignContext();
  
  // Detectar si es una historia de Instagram
  const isInstagramStory = platform?.toLowerCase() === 'instagram' && /instagram\.com\/stories\//i.test(postUrl);
  
  // ✅ NUEVO: Función para refrescar métricas cuando se guardan métricas manuales
  const handleMetricsSaved = useCallback(async () => {
    console.log('📸 [ANALYSIS-SIDEBAR] Refrescando posts después de guardar métricas...');
    try {
      await refetch();
      console.log('✅ [ANALYSIS-SIDEBAR] Posts refrescados exitosamente');
    } catch (error) {
      console.error('❌ [ANALYSIS-SIDEBAR] Error refrescando posts:', error);
    }
  }, [refetch]);
  
  // Memoizar las funciones para evitar re-creaciones innecesarias
  const loadAnalysis = useCallback(async () => {
    if (!postId) return;
    
    // No cargar análisis automático para historias de Instagram
    if (isInstagramStory) {
      setLoading(false);
      setAnalysisData(null);
      return;
    }
    
    // Guardar el postId actual para evitar race conditions
    const currentRequestPostId = postId;
    
    try {
      setLoading(true);
      setError(null);
      
      // Limpiar timeout anterior si existe
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      
      // Timeout de seguridad: si después de 30 segundos sigue cargando, forzar stop
      const timeout = setTimeout(() => {
        if (currentPostId === currentRequestPostId && loading) {
          console.warn('⚠️ Timeout de carga alcanzado, forzando stop');
          setLoading(false);
          setError('Timeout: La carga tomó demasiado tiempo');
        }
      }, 30000);
      
      loadingTimeoutRef.current = timeout;
      
      const result = await SentimentAnalysisService.getSentimentAnalysisByPostId(postId);
      
      // Limpiar timeout si la petición se completó exitosamente
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      
      // Solo actualizar si aún estamos en el mismo postId
      if (currentPostId === currentRequestPostId) {
        if (result) {
          setAnalysisData(result);
        } else {
          setAnalysisData(null);
        }
      }
    } catch (err: any) {
      console.error('❌ Error cargando análisis:', err);
      
      // Limpiar timeout en caso de error
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      
      // Solo mostrar error si aún estamos en el mismo postId
      if (currentPostId === currentRequestPostId) {
        setError(err.message || 'Error al cargar el análisis');
      }
    } finally {
      // Solo dejar de cargar si aún estamos en el mismo postId
      if (currentPostId === currentRequestPostId) {
        setLoading(false);
      }
    }
  }, [postId, currentPostId, isInstagramStory]);

  const fetchKeyTopics = useCallback(async () => {
    if (!postId || isInstagramStory) return;
    
    try {
      const res = await httpApiClient.get<{ keywords: string[] }>(`/post-topics/${postId}/keywords`);
      // Solo actualizar si aún estamos en el mismo postId
      if (currentPostId === postId) {
        setKeyTopics(res.data.keywords || []);
      }
    } catch {
      // Solo limpiar si aún estamos en el mismo postId
      if (currentPostId === postId) {
        setKeyTopics([]);
      }
    }
  }, [postId, currentPostId, isInstagramStory]);

  // Resetear estados cuando cambia el postId o se abre/cierra
  useEffect(() => {
    if (isOpen && postId) {
      // Si es un postId diferente, resetear inmediatamente todos los estados
      if (currentPostId !== postId) {
        // Limpiar timeout anterior si existe
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
          loadingTimeoutRef.current = null;
        }
        
        setAnalysisData(null);
        setError(null);
        setKeyTopics([]);
        setCurrentPostId(postId);
      }
    } else if (!isOpen) {
      // Al cerrar, resetear todo
      // Limpiar timeout si existe
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      
      setCurrentPostId(null);
      setAnalysisData(null);
      setError(null);
      setKeyTopics([]);
    }
    
    // Cleanup function para limpiar timeout al desmontar
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    };
  }, [isOpen, postId, currentPostId]);

  // Efecto separado para cargar datos cuando cambie currentPostId
  useEffect(() => {
    if (isOpen && currentPostId && currentPostId === postId) {
      // 🚀 OPTIMIZACIÓN: Cargar análisis y keywords en paralelo
      Promise.all([
        loadAnalysis(),
        fetchKeyTopics()
      ]).catch(error => {
        console.error('❌ Error loading analysis and keywords in parallel:', error);
      });
    }
  }, [currentPostId, isOpen, postId, loadAnalysis, fetchKeyTopics]);

  const handleClose = useCallback(() => {
    // Limpiar timeout si existe
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
    
    setAnalysisData(null);
    setError(null);
    setKeyTopics([]);
    setCurrentPostId(null);
    onClose();
  }, [onClose]);

  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) {
      handleClose();
    }
  }, [handleClose]);

  const handleRefresh = useCallback(() => {
    if (currentPostId === postId) {
      // 🚀 OPTIMIZACIÓN: Refresh en paralelo
      Promise.all([
        loadAnalysis(),
        fetchKeyTopics()
      ]).catch(error => {
        console.error('❌ Error refreshing analysis and keywords:', error);
      });
    }
  }, [currentPostId, postId, loadAnalysis, fetchKeyTopics]);

  // Memoizar el contenido para evitar re-renders innecesarios
  const sidebarContent = useMemo(() => {
    return (
      <ScrollArea className="flex-1 mt-6">
        <div className="space-y-6 pr-4">
          {/* Mostrar componente especial para historias de Instagram */}
          {isInstagramStory && (
            <StoryAnalysis 
              postUrl={postUrl} 
              platform={platform} 
              postId={postId}
              onMetricsSaved={handleMetricsSaved}
            />
          )}

          {/* Loading - mostrar SOLO mientras está cargando y no es historia */}
          {loading && !isInstagramStory && (
            <LoadingState onRefresh={handleRefresh} />
          )}

          {/* Error - solo mostrar si hay error para el post actual y no es historia */}
          {error && currentPostId === postId && !loading && !isInstagramStory && (
            <ErrorState error={error} onRefresh={handleRefresh} />
          )}

          {/* Sin análisis disponible - cuando no está cargando, no hay error y no hay datos y no es historia */}
          {!loading && !error && !analysisData && currentPostId === postId && !isInstagramStory && (
            <NoDataState postImage={postImage} onRefresh={handleRefresh} />
          )}

          {/* Resultados del análisis - solo mostrar si hay datos para el post actual y no es historia */}
          {analysisData && !loading && currentPostId === postId && !isInstagramStory && (
            <Card className="border-0 shadow-none bg-white">
                <CardContent className="p-6">
                  <div className="space-y-4">
                  {/* Header del resumen con miniatura y datos del post */}
                  <PostInformation postData={postData} postImage={postImage} />

                  {/* Sección de Sentimiento Predominante */}
                  <SentimentAnalysis analysisData={analysisData} />
                  </div>
                  
                {/* Información adicional del post */}
                {postData && (
                    <>
                    <Separator className="my-4 bg-transparent" />
                    <PostDetails postData={postData} />
                    </>
                  )}

                  {keyTopics.length > 0 && (
                    <div className="mt-4">
                      <div className="font-medium text-sm flex items-center gap-1.5 mb-2">
                        <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                        Temas clave mencionados
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {keyTopics.map((topic, idx) => (
                          <Badge key={idx} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs py-0.5">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
          )}
        </div>
      </ScrollArea>
    );
  }, [loading, error, currentPostId, postId, analysisData, postImage, postData, keyTopics, handleRefresh, isInstagramStory, postUrl, platform, handleMetricsSaved]);

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent 
        side="right" 
        className="bg-white text-gray-900 overflow-hidden flex flex-col" 
        style={{ width: '50vw', maxWidth: 'none' }}
      >
        {sidebarContent}
      </SheetContent>
    </Sheet>
  );
});

AnalysisSidebar.displayName = 'AnalysisSidebar'; 