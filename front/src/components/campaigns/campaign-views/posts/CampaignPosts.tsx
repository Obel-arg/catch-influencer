import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Image, 
  XCircle,
  RefreshCw,
  Grid,
  List,
} from "lucide-react";
import { Campaign } from "@/types/campaign";
import { useCampaignPosts } from "@/hooks/campaign/useCampaignPosts";
import { AnalysisSidebar } from "../analysis/AnalysisSidebar";
import { useState, useEffect } from "react";
import { SentimentAnalysisService } from "@/lib/services/analysis/sentiment-analysis.service";
import { PostCard } from "./components/PostCard";
import { PostListItem } from "./components/PostListItem";
import { PostCardSkeleton } from "./components/PostCardSkeleton";
import { PostListItemSkeleton } from "./components/PostListItemSkeleton";
import { extractPostTitle, extractMetricsFromRawResponse, extractEngagementRateFromRawResponse, formatNumber as formatNumberUtils } from "./components/PostUtils";
import { PostFilters, PostFiltersButton } from "./components/PostFilters";
import { DeletePostModal } from "./components/DeletePostModal";
import { ErrorModal } from "./components/ErrorModal";
import { CacheInvalidators } from "@/lib/http/cacheManager";
import { CardNoInfo, CardNoInfoContent } from "@/components/ui/cardNoInfo";

interface CampaignPostsProps {
  campaign: Campaign;
}

export const CampaignPosts = ({ campaign }: CampaignPostsProps) => {
  const { posts, loading, error, refetch, deletePost } = useCampaignPosts(campaign.id);
  const [analysisSidebar, setAnalysisSidebar] = useState<{
    isOpen: boolean;
    postUrl: string;
    postImage?: string;
    platform: string;
    postId: string;
    postData?: any;
  }>({
    isOpen: false,
    postUrl: '',
    postImage: '',
    platform: '',
    postId: '',
    postData: undefined
  });

  // Estado para la vista: 'grid' o 'list'
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  // Estado para controlar el loading del botón de reload
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Estados para filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPlatform, setFilterPlatform] = useState("all");
  const [filterPerformance, setFilterPerformance] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [showFilters, setShowFilters] = useState(false);
  // const [selectedPosts, setSelectedPosts] = useState<string[]>([]);

  // Estado para almacenar análisis de sentimientos
  const [sentimentAnalysis, setSentimentAnalysis] = useState<Record<string, {
    predominant: 'Positivo' | 'Negativo' | 'Neutral';
    positive: number;
    negative: number;
    neutral: number;
  }>>({});

  // Estado para controlar el loading del análisis de sentimientos
  const [sentimentLoading, setSentimentLoading] = useState<Record<string, boolean>>({});

  // Estado para el modal de confirmación de eliminación
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    postId: string;
    postCaption: string;
  }>({
    isOpen: false,
    postId: '',
    postCaption: ''
  });

  // Estado para el modal de error
  const [errorModal, setErrorModal] = useState<{
    isOpen: boolean;
    message: string;
  }>({
    isOpen: false,
    message: ''
  });

  // Función para manejar el refresh - invalidar cache y recargar posts
  const handleRefresh = () => {
    setIsRefreshing(true);
    
    // Invalidar cache de posts de esta campaña específica ANTES de refetch
    CacheInvalidators.onPostUpdate(campaign.id);
    
    // Usar setTimeout para simular el comportamiento esperado
    setTimeout(async () => {
      try {
        await refetch();
      } catch (error) {
        console.error('❌ Error recargando posts:', error);
      } finally {
        setIsRefreshing(false);
      }
    }, 100);
  };

  // Función para determinar rendimiento basado en análisis de sentimientos
  const getPerformanceLevel = (post: any): 'Alto' | 'Medio' | 'Bajo' | 'TBC' | 'Completed' => {
    // Detectar si es una historia de Instagram
    const isInstagramStory = post.platform?.toLowerCase() === 'instagram' && /instagram\.com\/stories\//i.test(post.post_url);
    
    if (isInstagramStory) {
      // Verificar si tiene métricas reales
      const metrics = extractMetricsFromRawResponse(post);
      const hasRealMetrics = metrics.views !== '...' && 
                            metrics.likes !== '...' && 
                            metrics.comments !== '...' &&
                            (metrics.views !== 0 || metrics.likes !== 0 || metrics.comments !== 0);
      
      return hasRealMetrics ? 'Completed' : 'TBC';
    }
    
    const sentiment = sentimentAnalysis[post.id]?.predominant;
    if (sentiment === 'Positivo') return 'Alto';
    if (sentiment === 'Neutral') return 'Medio';
    if (sentiment === 'Negativo') return 'Bajo';
    // Si no hay análisis de sentimientos, usar engagement como fallback
    const engagement = extractEngagementRateFromRawResponse(post);
    if (engagement >= 0.05) return 'Alto';
    if (engagement >= 0.025) return 'Medio';
    return 'Bajo';
  };

  // Función para obtener el color del badge de sentimiento
  const getSentimentBadgeColor = (performance: string) => {
    switch (performance) {
      case 'Alto':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Medio':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Bajo':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'TBC':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Función para obtener la etiqueta del sentimiento
  const getSentimentLabel = (performance: string) => {
    switch (performance) {
      case 'Alto':
        return 'Positivo';
      case 'Medio':
        return 'Neutral';
      case 'Bajo':
        return 'Negativo';
      case 'TBC':
        return 'TBC';
      case 'Completed':
        return 'Completed';
      default:
        return 'Sin datos';
    }
  };

  // Filtrar y ordenar posts
  const filteredAndSortedPosts = posts
    .filter((post) => {
      // Filtro de plataforma
      if (filterPlatform !== "all" && post.platform !== filterPlatform) {
        return false;
      }

      // Filtro de rendimiento
      if (filterPerformance !== "all" && getPerformanceLevel(post) !== filterPerformance) {
        return false;
      }

      // Filtro de búsqueda por título, descripción (caption) y nombre del influencer
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const postTitle = extractPostTitle(post);
        const matchesSearch = (
          postTitle?.toLowerCase().includes(query) ||
          post.caption?.toLowerCase().includes(query) ||
          post.influencers?.name?.toLowerCase().includes(query)
        );
        if (!matchesSearch) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "performance") {
        const performanceOrder = { Alto: 3, Completed: 2.5, Medio: 2, Bajo: 1, TBC: 0 };
        return performanceOrder[getPerformanceLevel(b)] - performanceOrder[getPerformanceLevel(a)];
      } else if (sortBy === "post_date") {
        // Ordenar por fecha del post (usando uploadDate del raw_response como preferencia)
        const aMetrics = extractMetricsFromRawResponse(a);
        const bMetrics = extractMetricsFromRawResponse(b);
        const aPostDate = aMetrics.uploadDate || (a.post_date ? new Date(a.post_date) : new Date(0));
        const bPostDate = bMetrics.uploadDate || (b.post_date ? new Date(b.post_date) : new Date(0));
        return bPostDate.getTime() - aPostDate.getTime();
      } else if (sortBy === "engagement") {
        const aEngagement = extractEngagementRateFromRawResponse(a);
        const bEngagement = extractEngagementRateFromRawResponse(b);
        
        // Ordenar de mayor a menor engagement rate
        return bEngagement - aEngagement;
      } else if (sortBy === "default") {
        // Ordenar por fecha de agregación (created_at)
        const aCreated = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bCreated = b.created_at ? new Date(b.created_at).getTime() : 0;
        return bCreated - aCreated;
      }
      return 0;
    });

  // FUNCIONALIDAD DE SELECCIÓN COMENTADA - NO IMPLEMENTADA AÚN
  // // Función para seleccionar/deseleccionar todos los posts
  // const toggleSelectAll = () => {
  //   if (selectedPosts.length === filteredAndSortedPosts.length) {
  //     setSelectedPosts([]);
  //   } else {
  //     setSelectedPosts(filteredAndSortedPosts.map((post) => post.id));
  //   }
  // };

  // Función para limpiar filtros
  const handleClearFilters = () => {
    setSearchQuery("");
    setFilterPlatform("all");
    setFilterPerformance("all");
    setSortBy("default");
    // setSelectedPosts([]);
  };

  // // Función para manejar selección individual de posts
  // const togglePostSelection = (postId: string) => {
  //   if (selectedPosts.includes(postId)) {
  //     setSelectedPosts(selectedPosts.filter((id) => id !== postId));
  //   } else {
  //     setSelectedPosts([...selectedPosts, postId]);
  //   }
  // };

  // 🚀 OPTIMIZACIÓN: Cargar análisis de sentimientos en batch para todos los posts
  useEffect(() => {
    const loadSentimentAnalysis = async () => {
      if (posts.length === 0) return;

      // Inicializar loading state para todos los posts
      const initialLoading: Record<string, boolean> = {};
      posts.forEach(post => {
        initialLoading[post.id] = true;
      });
      setSentimentLoading(initialLoading);

      try {
        // 🚀 BATCH REQUEST: Una sola petición para todos los posts
        const postIds = posts.map(post => post.id);
        const analysisResults = await SentimentAnalysisService.getSentimentAnalysisByPostIds(postIds);
        
        // Procesar todos los resultados de una vez
        const analysisData: Record<string, any> = {};
        const loadingUpdates: Record<string, boolean> = {};
        
        posts.forEach(post => {
          const analysis = analysisResults[post.id];
          loadingUpdates[post.id] = false;
          
          if (analysis) {
            // Determinar sentimiento predominante
            const { positive_percentage, negative_percentage, neutral_percentage } = analysis;
            
            let predominant: 'Positivo' | 'Negativo' | 'Neutral' = 'Neutral';
            
            if (positive_percentage > negative_percentage && positive_percentage > neutral_percentage) {
              predominant = 'Positivo';
            } else if (negative_percentage > positive_percentage && negative_percentage > neutral_percentage) {
              predominant = 'Negativo';
            }
            
            analysisData[post.id] = {
              predominant,
              positive: positive_percentage,
              negative: negative_percentage,
              neutral: neutral_percentage
            };
          }
        });
        
        setSentimentAnalysis(analysisData);
        setSentimentLoading(loadingUpdates);
        
      } catch (error) {
        console.error('❌ Error loading sentiment analysis batch:', error);
        // Limpiar loading state en caso de error
        const loadingUpdates: Record<string, boolean> = {};
        posts.forEach(post => {
          loadingUpdates[post.id] = false;
        });
        setSentimentLoading(loadingUpdates);
      }
    };

    loadSentimentAnalysis();
  }, [posts]);

  const handleDeletePost = (postId: string, postCaption?: string) => {
    setDeleteConfirmation({
      isOpen: true,
      postId,
      postCaption: postCaption || ''
    });
  };

  const confirmDeletePost = async () => {
    try {
      await deletePost(deleteConfirmation.postId);
      setDeleteConfirmation({
        isOpen: false,
        postId: '',
        postCaption: ''
      });
    } catch (error) {
      setErrorModal({
        isOpen: true,
        message: 'Error al eliminar el post. Por favor, inténtalo de nuevo.'
      });
    }
  };

  const cancelDeletePost = () => {
    setDeleteConfirmation({
      isOpen: false,
      postId: '',
      postCaption: ''
    });
  };

  const handleOpenAnalysis = (postUrl: string, postImage?: string, platform: string = '', postId: string = '', postData?: any) => {
    setAnalysisSidebar({
      isOpen: true,
      postUrl,
      postImage,
      platform,
      postId,
      postData
    });
  };

  const handleCloseAnalysis = () => {
    setAnalysisSidebar({
      isOpen: false,
      postUrl: '',
      postImage: '',
      platform: '',
      postId: '',
      postData: undefined
    });
  };

  // Utilidad para formatear números con separador de miles
  const formatNumber = (num?: number | string, options?: { 
    isReach?: boolean; 
    platform?: string; 
    likes?: number | string; 
    comments?: number | string; 
  }) => {
    return formatNumberUtils(num || 0, options);
  };

  if (loading || isRefreshing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">Posts de la Campaña</h2>
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg text-sm font-medium">
              0 posts
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className={`bg-white shadow-none p-0 w-10 h-10 flex items-center justify-center rounded-lg border-0 focus:ring-0 focus:outline-none ${viewMode === 'grid' ? 'bg-blue-100' : ''}`}
              disabled
            >
              <Grid className={`h-5 w-5 ${viewMode === 'grid' ? 'text-blue-600' : 'text-gray-700'}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`bg-white shadow-none p-0 w-10 h-10 flex items-center justify-center rounded-lg border-0 focus:ring-0 focus:outline-none ${viewMode === 'list' ? 'bg-blue-100' : ''}`}
              disabled
            >
              <List className={`h-5 w-5 ${viewMode === 'list' ? 'text-blue-600' : 'text-gray-700'}`} />
            </Button>
            <PostFiltersButton
              showFilters={false}
              setShowFilters={() => {}}
            />
            <Button
              variant="ghost"
              size="sm"
              className="bg-white shadow-none p-0 w-10 h-10 flex items-center justify-center rounded-lg border-0 focus:ring-0 focus:outline-none hover:bg-blue-100"
              disabled
            >
              <RefreshCw className="h-5 w-5 text-gray-700 animate-spin" />
            </Button>
          </div>
        </div>
        
        {/* Skeletons según el modo de vista */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            <PostCardSkeleton />
            <PostCardSkeleton />
            <PostCardSkeleton />
          </div>
        ) : (
          <div className="space-y-3">
            <PostListItemSkeleton />
            <PostListItemSkeleton />
            <PostListItemSkeleton />
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={refetch} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">Posts de la Campaña</h2>
          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg text-sm font-medium">
            {filteredAndSortedPosts.length} posts
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className={`bg-white shadow-none p-0 w-10 h-10 flex items-center justify-center rounded-lg border-0 focus:ring-0 focus:outline-none ${viewMode === 'grid' ? 'bg-blue-100' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            <Grid className={`h-5 w-5 ${viewMode === 'grid' ? 'text-blue-600' : 'text-gray-700'}`} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`bg-white shadow-none p-0 w-10 h-10 flex items-center justify-center rounded-lg border-0 focus:ring-0 focus:outline-none ${viewMode === 'list' ? 'bg-blue-100' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <List className={`h-5 w-5 ${viewMode === 'list' ? 'text-blue-600' : 'text-gray-700'}`} />
          </Button>
          {/* Botón Filtros con panel anclado al borde derecho del botón */}
          <div className="relative">
            <PostFiltersButton
              showFilters={showFilters}
              setShowFilters={setShowFilters}
            />
            {showFilters && (
              <div className="absolute top-full right-0 mt-2 z-50">
                <PostFilters
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  filterPlatform={filterPlatform}
                  setFilterPlatform={setFilterPlatform}
                  filterPerformance={filterPerformance}
                  setFilterPerformance={setFilterPerformance}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  onClearFilters={handleClearFilters}
                  onClose={() => setShowFilters(false)}
                />
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="bg-white shadow-none p-0 w-10 h-10 flex items-center justify-center rounded-lg border-0 focus:ring-0 focus:outline-none hover:bg-blue-100"
            onClick={handleRefresh}
            title="Recargar posts"
          >
            <RefreshCw className={`h-5 w-5 text-gray-700 hover:text-blue-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
      {/* Panel ya anclado al botón arriba; no renderizar aquí */}
      {filteredAndSortedPosts.length === 0 ? (
        <CardNoInfo>
          <CardNoInfoContent className="p-12">
            <div className="text-center">
              <Image className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay posts aún
              </h3>
              <p className="text-gray-500 mb-6">
                Los posts se crean desde la pestaña de Influencers
              </p>
              <p className="text-sm text-gray-400">
                Ve a la pestaña "Influencers" y haz clic en "Add Post" en cualquier influencer
              </p>
            </div>
          </CardNoInfoContent>
        </CardNoInfo>
      ) : (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            {filteredAndSortedPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                sentiment={sentimentAnalysis[post.id]?.predominant}
                sentimentLoading={sentimentLoading[post.id]}
                onDelete={handleDeletePost}
                onAnalyze={handleOpenAnalysis}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAndSortedPosts.map((post) => (
              <PostListItem
                key={post.id}
                post={post}
                performanceLevel={getPerformanceLevel(post)}
                getSentimentBadgeColor={getSentimentBadgeColor}
                getSentimentLabel={getSentimentLabel}
                formatNumber={formatNumber}
                onAnalyze={handleOpenAnalysis}
              />
            ))}
          </div>
        )
      )}
      <AnalysisSidebar
        isOpen={analysisSidebar.isOpen}
        onClose={handleCloseAnalysis}
        postUrl={analysisSidebar.postUrl}
        postImage={analysisSidebar.postImage}
        platform={analysisSidebar.platform}
        postId={analysisSidebar.postId}
        postData={analysisSidebar.postData}
      />
      <DeletePostModal
        isOpen={deleteConfirmation.isOpen}
        postCaption={deleteConfirmation.postCaption}
        onConfirm={confirmDeletePost}
        onCancel={cancelDeletePost}
      />
      <ErrorModal
        isOpen={errorModal.isOpen}
        message={errorModal.message}
        onClose={() => setErrorModal({ isOpen: false, message: '' })}
      />
    </div>
  );
};