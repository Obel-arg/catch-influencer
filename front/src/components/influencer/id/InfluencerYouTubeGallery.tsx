import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Image, 
  Grid,
  List,
  RefreshCw,
  Youtube,
  Play,
  Clock,
  Eye,
  ThumbsUp,
  MessageCircle
} from "lucide-react";
import { getYouTubeThumbnail } from "@/utils/youtube";
import { YouTubeImageCache } from "@/utils/imageCache";

interface YouTubeVideo {
  videoId: string;
  title: string;
  description?: string;
  views: number;
  likes: number;
  comments: number;
  engageRate: number;
  uploadDate: string;
  category?: string;
  duration?: string;
}

interface InfluencerYouTubeGalleryProps {
  influencer: any;
}

export const InfluencerYouTubeGallery = ({ influencer }: InfluencerYouTubeGalleryProps) => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  
  // 🎯 INSTANCIA DEL CACHE DE YOUTUBE
  const youtubeImageCache = YouTubeImageCache.getInstance();

  // Extraer videos de YouTube del influencer (limitado a 8)
  useEffect(() => {
    const extractYouTubeVideos = () => {
      try {
        const youtubeData = influencer.platform_info?.youtube;
        if (youtubeData?.recentVideos) {
          // Limitar a 4 videos
          setVideos(youtubeData.recentVideos.slice(0, 4));
        }
      } catch (error) {
        console.error('Error extrayendo videos de YouTube:', error);
      }
    };

    extractYouTubeVideos();
  }, [influencer]);

  const openYouTubeVideo = (videoId: string) => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank', 'noopener,noreferrer');
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getThumbnailUrl = (videoId: string): string | undefined => {
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    // 🎯 VERIFICAR CACHE PRIMERO
    const cachedUrl = youtubeImageCache.get(videoUrl);
    if (cachedUrl) return cachedUrl || undefined;
    
    // Si no está en cache, generar y cachear
    const thumbnailUrl = getYouTubeThumbnail(videoUrl, 'high');
    
    // 🎯 GUARDAR EN CACHE (asíncrono para no bloquear)
    setTimeout(() => {
      if (thumbnailUrl) {
        youtubeImageCache.set(videoUrl, thumbnailUrl);
      }
    }, 0);
    
    return thumbnailUrl || undefined;
  };

  if (!videos.length) {
    return (
      <Card className="p-6">
        <CardContent className="text-center">
          <Youtube className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            No hay videos de YouTube disponibles
          </h3>
          <p className="text-gray-500">
            No se encontraron videos recientes de YouTube para este influencer.
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
          <Youtube className="h-5 w-5 text-red-500" />
          <h3 className="text-lg font-semibold">Galería de YouTube</h3>
          <span className="text-sm text-gray-500">({videos.length} videos)</span>
        </div>
      </div>

             {/* Grid de videos */}
       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 h-full">
        {videos.map((video) => (
                     <Card 
             key={video.videoId} 
             className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
             onClick={() => openYouTubeVideo(video.videoId)}
           >
                         <div className="relative aspect-[4/3]">
              <img
                src={getThumbnailUrl(video.videoId) || undefined}
                alt={video.title}
                className="w-full h-full object-cover"
              />
              
              {/* Overlay con información */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300">
                <div className="absolute top-2 left-2 flex items-center space-x-1 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                  <Play className="h-3 w-3" />
                  <span>Video</span>
                </div>
                
                                                  <div className="absolute bottom-4 left-3 text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                   <div className="flex items-center space-x-3">
                     <span>❤️ {formatNumber(video.likes)}</span>
                     <span>💬 {formatNumber(video.comments)}</span>
                   </div>
                 </div>
              </div>
            </div>
            
                         <div className="p-3">
               <h4 className="text-sm font-medium text-gray-900 truncate mb-1">
                 {video.title}
               </h4>
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