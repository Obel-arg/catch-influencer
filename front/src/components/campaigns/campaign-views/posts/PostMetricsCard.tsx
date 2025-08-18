import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  MessageCircle, 
  Share, 
  Eye, 
  RefreshCw, 
  AlertCircle,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import { usePostMetrics } from "@/hooks/campaign/usePostMetrics";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface PostMetricsCardProps {
  postId: string;
  platform: string;
  postUrl: string;
  className?: string;
}

export const PostMetricsCard: React.FC<PostMetricsCardProps> = ({
  postId,
  platform,
  postUrl,
  className = ""
}) => {
  const [metrics, setMetrics] = useState<any>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const { isLoading, error, getPostWithMetrics, refreshPostMetrics } = usePostMetrics();

  // Detectar si es una historia de Instagram
  const isInstagramStory = platform.toLowerCase() === 'instagram' && /instagram\.com\/stories\//i.test(postUrl);
  


  const loadMetrics = useCallback(async () => {
    try {
      const result = await getPostWithMetrics(postId);
      setMetrics(result.metrics);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Error loading metrics:', err);
    }
  }, [getPostWithMetrics, postId]);

  useEffect(() => {
    // Cargar métricas para todos los posts (incluidas historias)
    loadMetrics();
  }, [postId, loadMetrics]);

  const handleRefreshMetrics = async () => {
    // No hacer refresh si es una historia de Instagram
    if (isInstagramStory) return;
    
    try {
      await refreshPostMetrics(postId);
      await loadMetrics();
    } catch (err) {
      console.error('Error refreshing metrics:', err);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'youtube':
        return '🎥';
      case 'instagram':
        return '📸';
      case 'tiktok':
        return '🎵';
      case 'twitter':
        return '🐦';
      default:
        return '📱';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      case 'error':
        return <XCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="text-2xl">{getPlatformIcon(platform)}</span>
            Métricas de {platform.charAt(0).toUpperCase() + platform.slice(1)}
          </CardTitle>
          {!isInstagramStory && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshMetrics}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Estado de las métricas */}
        {metrics && !isInstagramStory && (
          <div className="flex items-center justify-between">
            <Badge className={`flex items-center gap-1 ${getStatusColor(metrics.api_status)}`}>
              {getStatusIcon(metrics.api_status)}
              {metrics.api_status === 'success' ? 'Datos actualizados' : 
               metrics.api_status === 'error' ? 'Error al obtener datos' : 
               'Extrayendo datos...'}
            </Badge>
            {lastRefresh && (
              <span className="text-sm text-gray-500">
                Última actualización: {format(lastRefresh, 'HH:mm', { locale: es })}
              </span>
            )}
          </div>
        )}

                 {/* Badge especial para historias */}
         {isInstagramStory && (
           <div className="flex items-center justify-between">
             <Badge className={`flex items-center gap-1 ${
               metrics && metrics.api_status === 'success' 
                 ? 'bg-green-100 text-green-800' 
                 : 'bg-purple-100 text-purple-800'
             }`}>
               {metrics && metrics.api_status === 'success' ? (
                 <>
                   <CheckCircle className="h-4 w-4" />
                   Completed
                 </>
               ) : (
                 <>
                   <AlertCircle className="h-4 w-4" />
                   TBC
                 </>
               )}
             </Badge>
             <span className="text-sm text-gray-500">
               Historia de Instagram
               {lastRefresh && metrics && metrics.api_status === 'success' && (
                 <> • {format(lastRefresh, 'HH:mm', { locale: es })}</>
               )}
             </span>
           </div>
         )}
        


        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {/* Métricas principales para posts normales */}
        {metrics && metrics.api_status === 'success' && !isInstagramStory && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <Heart className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-sm font-medium">Likes</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {metrics.likes_count?.toLocaleString() || '0'}
              </div>
            </div>

            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <MessageCircle className="h-4 w-4 text-blue-500 mr-1" />
                <span className="text-sm font-medium">Comentarios</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {metrics.comments_count?.toLocaleString() || '0'}
              </div>
            </div>

            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <Share className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm font-medium">Compartidos</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {metrics.shares_count?.toLocaleString() || '0'}
              </div>
            </div>

            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <Eye className="h-4 w-4 text-purple-500 mr-1" />
                <span className="text-sm font-medium">Vistas</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {metrics.views_count?.toLocaleString() || '0'}
              </div>
            </div>
          </div>
        )}

                 {/* Métricas para historias de Instagram */}
         {isInstagramStory && (
           <div className="grid grid-cols-3 gap-4">
             <div className="text-center p-3 bg-gray-50 rounded-lg">
               <div className="flex items-center justify-center mb-1">
                 <Eye className="h-4 w-4 text-purple-500 mr-1" />
                 <span className="text-sm font-medium">Alcance</span>
               </div>
               <div className="text-2xl font-bold text-gray-900">
                 {metrics && metrics.api_status === 'success' 
                   ? (metrics.views_count?.toLocaleString() || '0')
                   : '...'
                 }
               </div>
             </div>

             <div className="text-center p-3 bg-gray-50 rounded-lg">
               <div className="flex items-center justify-center mb-1">
                 <Heart className="h-4 w-4 text-red-500 mr-1" />
                 <span className="text-sm font-medium">Likes</span>
               </div>
               <div className="text-2xl font-bold text-gray-900">
                 {metrics && metrics.api_status === 'success' 
                   ? (metrics.likes_count?.toLocaleString() || '0')
                   : '...'
                 }
               </div>
             </div>

             <div className="text-center p-3 bg-gray-50 rounded-lg">
               <div className="flex items-center justify-center mb-1">
                 <MessageCircle className="h-4 w-4 text-blue-500 mr-1" />
                 <span className="text-sm font-medium">Comentarios</span>
               </div>
               <div className="text-2xl font-bold text-gray-900">
                 {metrics && metrics.api_status === 'success' 
                   ? (metrics.comments_count?.toLocaleString() || '0')
                   : '...'
                 }
               </div>
             </div>
           </div>
         )}

        {/* Información adicional */}
        {metrics && metrics.author_username && (
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Autor:</span>
              <span className="font-medium">@{metrics.author_username}</span>
            </div>
            {metrics.post_date && (
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-600">Fecha de publicación:</span>
                <span className="font-medium">
                  {format(new Date(metrics.post_date), 'dd/MM/yyyy', { locale: es })}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Estado de carga - solo para posts normales */}
        {isLoading && !isInstagramStory && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
              <span className="text-gray-600">Extrayendo métricas...</span>
            </div>
          </div>
        )}

        {/* Estado vacío - solo para posts normales */}
        {!metrics && !isLoading && !error && !isInstagramStory && (
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">No hay métricas disponibles</p>
            <p className="text-sm text-gray-500 mt-1">
              Las métricas se extraerán automáticamente en breve
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 