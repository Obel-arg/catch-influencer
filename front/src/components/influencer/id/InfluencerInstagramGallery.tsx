import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Image, 
  Grid,
  List,
  RefreshCw,
  Instagram,
  Play,
  Image as ImageIcon,
  Loader2
} from "lucide-react";
import { getInstagramImageAggressive, getInstagramThumbnailValidated } from "@/utils/instagram";
import { InstagramImageCache } from "@/utils/imageCache";

interface InstagramPost {
  likes: number;
  title: string;
  isReels: boolean;
  isVideo: boolean;
  comments: number;
  photoURL: string;
  carouselUrls: string[];
  shortcode: string;
  engageRate: number;
  updateDate: number;
}

interface InfluencerInstagramGalleryProps {
  influencer: any;
}

export const InfluencerInstagramGallery = ({ influencer }: InfluencerInstagramGalleryProps) => {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [processedImages, setProcessedImages] = useState<Record<string, string>>({});
  const [imageLoading, setImageLoading] = useState<Record<string, boolean>>({});
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  
  // 🎯 INSTANCIA DEL CACHE
  const imageCache = InstagramImageCache.getInstance();

  // Extraer posts de Instagram del influencer (limitado a 4)
  useEffect(() => {
    const extractInstagramPosts = () => {
      try {
        const instagramData = influencer.platform_info?.instagram?.basicInstagram;
        if (instagramData?.recentPosts) {
          // Limitar a 4 posts
          const limitedPosts = instagramData.recentPosts.slice(0, 4);
          setPosts(limitedPosts);
          
          // Inicializar estado de loading para todas las imágenes
          const loadingState: Record<string, boolean> = {};
          limitedPosts.forEach(post => {
            loadingState[post.shortcode] = true;
          });
          setImageLoading(loadingState);
        }
      } catch (error) {
        console.error('Error extrayendo posts de Instagram:', error);
      }
    };

    extractInstagramPosts();
  }, [influencer]);

  // Procesar imágenes usando las funciones de Instagram utils CON CACHE
  useEffect(() => {
    const processImages = async () => {
      const processed: Record<string, string> = {};
      
      for (const post of posts) {
        try {
          console.log('🔄 [INSTAGRAM] Procesando imagen para post:', post.shortcode);
          
          // Construir la URL completa del post de Instagram
          const instagramPostUrl = `https://www.instagram.com/p/${post.shortcode}/`;
          
          // 🎯 VERIFICAR CACHE PRIMERO
          const cachedUrl = imageCache.get(instagramPostUrl);
          if (cachedUrl) {
            console.log('✅ [INSTAGRAM] Imagen encontrada en cache:', post.shortcode);
            processed[post.shortcode] = cachedUrl;
            continue;
          }
          
          // Si no está en cache, procesar la imagen
          console.log('🔄 [INSTAGRAM] Procesando imagen nueva:', post.shortcode);
          const processedUrl = await getInstagramImageAggressive(instagramPostUrl);
          
          // 🎯 GUARDAR EN CACHE
          imageCache.set(instagramPostUrl, processedUrl);
          processed[post.shortcode] = processedUrl;
          
          console.log('✅ [INSTAGRAM] Imagen procesada y cacheada:', processedUrl);
        } catch (error) {
          console.error('❌ [INSTAGRAM] Error procesando imagen para post:', post.shortcode, error);
          
          // Si falla, intentar con la función de fallback
          try {
            const instagramPostUrl = `https://www.instagram.com/p/${post.shortcode}/`;
            
            // 🎯 VERIFICAR CACHE PARA FALLBACK
            const cachedFallback = imageCache.get(`${instagramPostUrl}_fallback`);
            if (cachedFallback) {
              console.log('✅ [INSTAGRAM] Fallback encontrado en cache:', post.shortcode);
              processed[post.shortcode] = cachedFallback;
              continue;
            }
            
            const fallbackUrl = await getInstagramThumbnailValidated(instagramPostUrl);
            
            // 🎯 GUARDAR FALLBACK EN CACHE
            imageCache.set(`${instagramPostUrl}_fallback`, fallbackUrl);
            processed[post.shortcode] = fallbackUrl;
            console.log('✅ [INSTAGRAM] Usando fallback y cacheado:', fallbackUrl);
          } catch (fallbackError) {
            console.error('❌ [INSTAGRAM] Fallback también falló:', fallbackError);
            // Marcar como imagen fallida para mostrar fallback visual
            setFailedImages(prev => new Set(prev).add(post.shortcode));
          }
        }
      }
      
      setProcessedImages(processed);
      
      // Marcar todas las imágenes como cargadas
      const finalLoadingState: Record<string, boolean> = {};
      posts.forEach(post => {
        finalLoadingState[post.shortcode] = false;
      });
      setImageLoading(finalLoadingState);
    };

    if (posts.length > 0) {
      processImages();
    }
  }, [posts, imageCache]);

  const openInstagramPost = (shortcode: string) => {
    window.open(`https://www.instagram.com/p/${shortcode}/`, '_blank', 'noopener,noreferrer');
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getPostTypeIcon = (post: InstagramPost) => {
    if (post.isReels) {
      return <Play className="h-3 w-3" />;
    } else if (post.isVideo) {
      return <Play className="h-3 w-3" />;
    } else if (post.carouselUrls.length > 1) {
      return <ImageIcon className="h-3 w-3" />;
    } else {
      return <Image className="h-3 w-3" />;
    }
  };

  const getPostTypeLabel = (post: InstagramPost): string => {
    if (post.isReels) {
      return 'Reel';
    } else if (post.isVideo) {
      return 'Video';
    } else if (post.carouselUrls.length > 1) {
      return 'Carousel';
    } else {
      return 'Post';
    }
  };

  if (!posts.length) {
    return (
      <Card className="p-6">
        <CardContent className="text-center">
          <Instagram className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            No hay posts de Instagram disponibles
          </h3>
          <p className="text-gray-500">
            No se encontraron posts recientes de Instagram para este influencer.
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
          <Instagram className="h-5 w-5 text-pink-500" />
          <h3 className="text-lg font-semibold">Galería de Instagram</h3>
          <span className="text-sm text-gray-500">({posts.length} posts)</span>
        </div>
      </div>

             {/* Grid de posts */}
       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 h-full">
        {posts.map((post) => (
                     <Card 
             key={post.shortcode} 
             className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
             onClick={() => openInstagramPost(post.shortcode)}
           >
                         <div className="relative aspect-[4/3]">
              {/* Loader mientras la imagen carga */}
              {imageLoading[post.shortcode] && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <Loader2 className="h-6 w-6 animate-spin text-pink-500" />
                </div>
              )}
              
              {/* Imagen procesada */}
              {processedImages[post.shortcode] && !failedImages.has(post.shortcode) ? (
                <img
                  src={processedImages[post.shortcode]}
                  alt={post.title}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    imageLoading[post.shortcode] ? 'opacity-0' : 'opacity-100'
                  }`}
                  onLoad={() => {
                    setImageLoading(prev => ({
                      ...prev,
                      [post.shortcode]: false
                    }));
                  }}
                  onError={() => {
                    console.error('❌ [INSTAGRAM] Error cargando imagen procesada');
                    setImageLoading(prev => ({
                      ...prev,
                      [post.shortcode]: false
                    }));
                    
                    // Marcar como imagen fallida para mostrar fallback visual
                    setFailedImages(prev => new Set(prev).add(post.shortcode));
                    console.log('🔄 [INSTAGRAM] Mostrando fallback visual para post:', post.shortcode);
                  }}
                />
              ) : (
                // Fallback visual cuando no hay imagen procesada o falló
                <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                  <div className="text-center">
                    <Instagram className="h-8 w-8 text-pink-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">
                      {failedImages.has(post.shortcode) ? 'Imagen no disponible' : 'Cargando imagen...'}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Overlay con información */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300">
                <div className="absolute top-2 left-2 flex items-center space-x-1 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                  {getPostTypeIcon(post)}
                  <span>{getPostTypeLabel(post)}</span>
                </div>
                
                                                  <div className="absolute bottom-4 left-3 text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                   <div className="flex items-center space-x-3">
                     <span>❤️ {formatNumber(post.likes)}</span>
                     <span>💬 {formatNumber(post.comments)}</span>
                   </div>
                 </div>

                                 {/* Indicador de carousel */}
                 {post.carouselUrls.length > 1 && (
                   <div className="absolute top-3 right-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                     {post.carouselUrls.length} fotos
                   </div>
                 )}
              </div>
            </div>
            
            <div className="p-3">
              <h4 className="text-sm font-medium text-gray-900 truncate mb-1">
                {post.title || 'Sin título'}
              </h4>
                             <div className="flex items-center justify-start text-xs text-gray-500">
                 <span>📅 {formatDate(post.updateDate)}</span>
               </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};