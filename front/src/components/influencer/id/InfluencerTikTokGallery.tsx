import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Play,
  Heart,
  MessageCircle,
  Share
} from "lucide-react";
import { getTikTokThumbnailValidated } from "@/utils/tiktok";
import { TikTokImageCache } from "@/utils/imageCache";

// Función para obtener datos de TikTok (igual que en el dashboard)
function getTiktokData(platform_info: any) {
  return (
    platform_info?.tiktok?.basicTikTok ||
    platform_info?.tiktok?.basicTiktok ||
    platform_info?.tiktok ||
    platform_info?.basicTikTok ||
    platform_info?.basicTiktok
  );
}

interface TikTokVideo {
  videoId: string;
  title?: string;
  description?: string;
  plays: number; // Cambio de 'views' a 'plays'
  hearts: number; // Cambio de 'likes' a 'hearts'
  comments: number;
  shares: number;
  uploadDate: number; // Cambio de 'string' a 'number' (timestamp)
  length: number; // Cambio de 'duration' a 'length'
  music?: string;
  hashtags?: string[];
  cover: string; // Cambio de 'thumbnailUrl' a 'cover'
  audioTitle?: string;
  audioAuthor?: string;
}

interface InfluencerTikTokGalleryProps {
  influencer: any;
}

export const InfluencerTikTokGallery = ({ influencer }: InfluencerTikTokGalleryProps) => {
  const [videos, setVideos] = useState<TikTokVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [processedThumbnails, setProcessedThumbnails] = useState<Record<string, string>>({});
  const [imageLoading, setImageLoading] = useState<Record<string, boolean>>({});
  
  // 🎯 INSTANCIA DEL CACHE DE TIKTOK
  const tiktokImageCache = TikTokImageCache.getInstance();

  // Extraer videos de TikTok del influencer (limitado a 4)
  useEffect(() => {
    const extractTikTokVideos = () => {
      try {
        
        const tiktokData = getTiktokData(influencer.platform_info);
        
        if (tiktokData?.recentVideos) {
          
          // Limitar a 4 videos
          setVideos(tiktokData.recentVideos.slice(0, 4));
        } else {
          
        }
      } catch (error) {
        console.error('Error extrayendo videos de TikTok:', error);
      }
    };

    if (influencer) {
      extractTikTokVideos();
    }
  }, [influencer]);

  // Procesar thumbnails usando el utils de TikTok CON CACHE
  useEffect(() => {
    const processThumbnails = async () => {
      const thumbnails: Record<string, string> = {};
      const loadingState: Record<string, boolean> = {};
      
      // Inicializar estado de loading para todos los videos
      videos.forEach(video => {
        loadingState[video.videoId] = true;
      });
      setImageLoading(loadingState);
      
      for (const video of videos) {
        try {
          // Crear URL de TikTok para procesar
          const tiktokData = getTiktokData(influencer.platform_info);
          const tiktokId = tiktokData?.tiktokId;
          if (tiktokId) {
            const tiktokUrl = `https://www.tiktok.com/@${tiktokId}/video/${video.videoId}`;
            
            // 🎯 VERIFICAR CACHE PRIMERO
            const cachedUrl = tiktokImageCache.get(tiktokUrl);
            if (cachedUrl) {
              
              thumbnails[video.videoId] = cachedUrl;
              continue;
            }
            
            // Si no está en cache, procesar la imagen
            
            const processedThumbnail = await getTikTokThumbnailValidated(tiktokUrl);
            
            // 🎯 GUARDAR EN CACHE
            tiktokImageCache.set(tiktokUrl, processedThumbnail);
            thumbnails[video.videoId] = processedThumbnail;
            
              
          } else {
            // Si no hay tiktokId, usar la thumbnail original
            thumbnails[video.videoId] = video.cover;
          }
        } catch (error) {
          console.error('Error procesando thumbnail:', error);
          // Usar thumbnail original como fallback
          thumbnails[video.videoId] = video.cover;
        }
      }
      
      setProcessedThumbnails(thumbnails);
      
      // Marcar todas las imágenes como cargadas
      const finalLoadingState: Record<string, boolean> = {};
      videos.forEach(video => {
        finalLoadingState[video.videoId] = false;
      });
      setImageLoading(finalLoadingState);
    };

    if (videos.length > 0) {
      processThumbnails();
    }
  }, [videos, influencer, tiktokImageCache]);

  const openTikTokVideo = (videoId: string) => {
    const tiktokData = getTiktokData(influencer.platform_info);
    const tiktokId = tiktokData?.tiktokId;
    if (tiktokId) {
      window.open(`https://www.tiktok.com/@${tiktokId}/video/${videoId}`, '_blank', 'noopener,noreferrer');
    } else {
      console.error('No TikTok ID found for influencer');
    }
  };

  const formatNumber = (num: number | undefined | null): string => {
    if (num === undefined || num === null) return '0';
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDate = (timestamp: number | undefined | null): string => {
    if (timestamp === undefined || timestamp === null) return 'Fecha desconocida';
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleImageLoad = (videoId: string) => {
    setImageLoading(prev => ({
      ...prev,
      [videoId]: false
    }));
  };

  const handleImageError = (videoId: string) => {
    setImageLoading(prev => ({
      ...prev,
      [videoId]: false
    }));
    console.error(`Error loading image for video: ${videoId}`);
  };

  if (!videos.length) {
    return (
      <Card className="p-6">
        <CardContent className="text-center">
          <Play className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            No hay videos de TikTok disponibles
          </h3>
          <p className="text-gray-500">
            No se encontraron videos recientes de TikTok para este influencer.
          </p>
        </CardContent>
      </Card>
    );
  }

     return (
     <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Play className="h-5 w-5 text-black" />
          <h3 className="text-lg font-semibold">Galería de TikTok</h3>
          <span className="text-sm text-gray-500">({videos.length} videos)</span>
        </div>
      </div>

             {/* Grid de videos */}
       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 h-full">
        {videos.map((video) => (
                     <Card 
             key={video.videoId} 
             className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
             onClick={() => openTikTokVideo(video.videoId)}
           >
                         <div className="relative aspect-[4/3]">
              {/* Loader mientras la imagen carga */}
              {imageLoading[video.videoId] && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                </div>
              )}
              
              {/* Imagen real */}
              {processedThumbnails[video.videoId] && (
                <img
                  src={processedThumbnails[video.videoId]}
                  alt={video.title || 'TikTok Video'}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    imageLoading[video.videoId] ? 'opacity-0' : 'opacity-100'
                  }`}
                  onLoad={() => handleImageLoad(video.videoId)}
                  onError={() => handleImageError(video.videoId)}
                />
              )}
              
              {/* Overlay con información */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300">
                <div className="absolute top-2 left-2 flex items-center space-x-1 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                  <Play className="h-3 w-3" />
                  <span>Video</span>
                </div>
                
                                                  <div className="absolute bottom-4 left-3 text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                   <div className="flex items-center space-x-3">
                     <span>❤️ {formatNumber(video.hearts)}</span>
                     <span>💬 {formatNumber(video.comments)}</span>
                   </div>
                 </div>

                                 {/* Indicador de duración si está disponible */}
                 {video.length && (
                   <div className="absolute bottom-4 right-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                     {video.length}s
                   </div>
                 )}
              </div>
            </div>
            
                         <div className="p-3">
               <div className="h-5 mb-1"></div>
               <div className="flex items-center justify-start text-xs text-gray-500">
                 <span>📅 {formatDate(video.uploadDate)}</span>
               </div>
             </div>
          </Card>
        ))}
      </div>
    </div>
  );
};