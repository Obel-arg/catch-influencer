import { Button } from "@/components/ui/button";
import { Users, XCircle, RefreshCw, Grid, List, UserPlus } from "lucide-react";
import { Campaign } from "@/types/campaign";
import { useCampaignContext } from "@/contexts/CampaignContext";
import { useCampaigns } from "@/hooks/campaign/useCampaigns";
import { AddPostModal, CreatePostData } from "../../modals/AddPostModal";
import { influencerPostService } from "@/lib/services/influencer-posts";
import { useEffect, useState } from "react";
import { InfluencerCard } from "./components/InfluencerCard";
import { InfluencerListItem } from "./components/InfluencerListItem";
import { InfluencerCardSkeleton } from "./components/InfluencerCardSkeleton";
import {
  InfluencerFilters,
  InfluencerFiltersButton,
} from "./components/InfluencerFilters";
import { DeleteInfluencerModal } from "./components/DeleteInfluencerModal";
import { AddInfluencerToCampaignModal } from "./components/AddInfluencerToCampaignModal";
import { handleHttpError } from "@/utils/httpErrorHandler";
import { CacheInvalidators } from "@/lib/http/cacheManager";
import {
  calculatePerformanceScore,
  getPlatformInfluencerId,
} from "./components/InfluencerUtils";
import { CardNoInfo, CardNoInfoContent } from "@/components/ui/cardNoInfo";

interface CampaignInfluencersProps {
  campaign: Campaign;
}

export const CampaignInfluencers = ({ campaign }: CampaignInfluencersProps) => {
  const {
    influencers,
    influencersLoading: loading,
    error,
    refetch,
    updateInfluencers,
    postsCountByInfluencer,
    platformsByInfluencer,
  } = useCampaignContext();

  // Log de platform_info de cada influencer (temporal)
  useEffect(() => {
    try {
      influencers.forEach((ci) => {
        const inf = ci.influencers;
      });
    } catch {}
  }, [influencers]);

  // Hook para manejar operaciones de campaña
  const { removeInfluencerFromCampaign } = useCampaigns();

  const [showAddPostModal, setShowAddPostModal] = useState(false);
  const [showAddInfluencerModal, setShowAddInfluencerModal] = useState(false);
  const [selectedInfluencer, setSelectedInfluencer] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Estados para eliminación de influencers
  const [deleteInfluencerModal, setDeleteInfluencerModal] = useState<{
    isOpen: boolean;
    influencerId: string;
    influencerName: string;
  }>({
    isOpen: false,
    influencerId: "",
    influencerName: "",
  });

  // 🚀 NUEVO: Estado para rastrear influencers eliminados localmente
  const [locallyDeletedInfluencers, setLocallyDeletedInfluencers] = useState<
    Set<string>
  >(new Set());

  // Estados para la vista y filtros (similar a CampaignPosts)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  // Estados para filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPlatform, setFilterPlatform] = useState("all");
  const [sortBy, setSortBy] = useState("default");

  // Función para manejar el refresh - invalidar cache y recargar influencers
  const handleRefresh = () => {
    setIsRefreshing(true);

    // 🚀 NUEVO: Limpiar estado de influencers eliminados localmente
    setLocallyDeletedInfluencers(new Set());

    // Invalidar cache de influencers de esta campaña específica
    CacheInvalidators.onCampaignInfluencersUpdate(campaign.id);

    setTimeout(async () => {
      try {
        await refetch();
      } catch (error) {
        console.error("❌ Error recargando influencers:", error);
      } finally {
        setIsRefreshing(false);
      }
    }, 100);
  };

  // Función para limpiar filtros
  const handleClearFilters = () => {
    setSearchQuery("");
    setFilterPlatform("all");
    setSortBy("default");
  };

  const handleAddPost = (influencerId: string, influencerName: string) => {
    setSelectedInfluencer({ id: influencerId, name: influencerName });
    setShowAddPostModal(true);
  };

  const handleCreatePost = async (postData: CreatePostData) => {
    if (!selectedInfluencer) return;

    try {
      // Usar el método con métricas automáticas
      const result = await influencerPostService.createPostWithMetrics({
        ...postData,
        influencer_id: selectedInfluencer.id,
        campaign_id: campaign.id,
        post_date: postData.post_date || new Date(),
      });

      // NO hacer refetch inmediatamente - el modal se encargará de mostrar la confirmación
      // El refetch se hará cuando el modal se cierre automáticamente

      // Mostrar notificación visual al usuario
      if (
        typeof window !== "undefined" &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        new Notification("Post creado", {
          body: result.message,
          icon: "/favicon.ico",
        });
      }
    } catch (error) {
      console.error("❌ Error creating post with metrics:", error);
      throw error;
    }
  };

  const handleCloseModal = () => {
    setShowAddPostModal(false);
    setSelectedInfluencer(null);

    // NO hacer refetch automático para evitar que se vuelvan a cargar los influencers
    // El usuario puede usar el botón de refresh manualmente si necesita actualizar los datos
  };

  // Función para manejar la eliminación de influencers
  const handleDeleteInfluencer = (
    influencerId: string,
    influencerName: string
  ) => {
    setDeleteInfluencerModal({
      isOpen: true,
      influencerId,
      influencerName,
    });
  };

  // Función para confirmar eliminación
  const confirmDeleteInfluencer = async () => {
    const influencerIdToDelete = deleteInfluencerModal.influencerId;

    try {
      // 🚀 OPTIMIZACIÓN: Cerrar modal inmediatamente para feedback visual
      setDeleteInfluencerModal({
        isOpen: false,
        influencerId: "",
        influencerName: "",
      });

      // 🚀 OPTIMIZACIÓN: Eliminación optimista - actualizar UI inmediatamente
      const updatedInfluencers = influencers.filter(
        (campaignInfluencer) =>
          campaignInfluencer.influencers?.id !== influencerIdToDelete
      );
      updateInfluencers(updatedInfluencers);

      // 🚀 NUEVO: Marcar como eliminado localmente
      setLocallyDeletedInfluencers(
        (prev) => new Set([...prev, influencerIdToDelete])
      );

      // Usar el servicio para eliminar el influencer de la campaña
      const success = await removeInfluencerFromCampaign(
        campaign.id,
        influencerIdToDelete
      );

      if (success) {
        // Invalidar cache manualmente
        if (typeof window !== "undefined") {
          const globalInfluencersCache =
            (window as any).campaignInfluencersCache || new Map();
          globalInfluencersCache.delete(campaign.id);
        }

        // Refetch influencers to update the list
        await refetch();
      } else {
        console.warn(
          "⚠️ [Frontend] removeInfluencerFromCampaign retornó false"
        );
        // Si falla, restaurar el estado original
        setLocallyDeletedInfluencers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(influencerIdToDelete);
          return newSet;
        });
        await refetch();
      }
    } catch (error) {
      console.error("❌ [Frontend] Error eliminando influencer:", error);
      handleHttpError(error);

      // Si hay error, restaurar el estado original
      setLocallyDeletedInfluencers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(influencerIdToDelete);
        return newSet;
      });
      await refetch();
    }
  };

  // Función para cancelar eliminación
  const cancelDeleteInfluencer = () => {
    setDeleteInfluencerModal({
      isOpen: false,
      influencerId: "",
      influencerName: "",
    });
  };

  // Filtrar y ordenar influencers
  const normalizePlatformName = (platform: string): string => {
    const lower = platform.toLowerCase();
    if (lower === "x") return "twitter";
    if (
      lower === "youtube shorts" ||
      lower === "shorts" ||
      lower === "ytshorts"
    )
      return "youtube";
    return lower;
  };

  const filteredInfluencers = influencers
    .filter((campaignInfluencer) => {
      const influencer = campaignInfluencer.influencers;
      if (!influencer) return false;

      // 🚀 NUEVO: Excluir influencers eliminados localmente
      if (locallyDeletedInfluencers.has(influencer.id)) {
        return false;
      }

      // Filtro de búsqueda por nombre
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = influencer.name?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Filtro de plataforma: exigir @ (handle) válido en esa plataforma
      if (filterPlatform !== "all") {
        const normalized = normalizePlatformName(filterPlatform);
        const influencerId = influencer.id || "";
        const platforms = platformsByInfluencer[influencerId] || [];
        if (!platforms.includes(normalized)) return false;

        const handle = getPlatformInfluencerId(
          influencer.platform_info,
          normalized
        );
        if (!handle) return false;
      }

      return true;
    })
    .sort((a, b) => {
      const influencerA = a.influencers;
      const influencerB = b.influencers;

      if (!influencerA || !influencerB) return 0;

      if (sortBy === "engagement") {
        const engagementA = influencerA.average_engagement_rate || 0;
        const engagementB = influencerB.average_engagement_rate || 0;
        return engagementB - engagementA; // Mayor a menor
      } else if (sortBy === "performance") {
        const performanceA = calculatePerformanceScore(influencerA);
        const performanceB = calculatePerformanceScore(influencerB);
        return performanceB - performanceA; // Mayor a menor
      } else if (sortBy === "followers") {
        const followersA = influencerA.followers_count || 0;
        const followersB = influencerB.followers_count || 0;
        return followersB - followersA; // Mayor a menor
      } else {
        // "default" - ordenar por fecha de agregación o mantener orden original
        return 0;
      }
    });

  // 🎯 NUEVO: Mostrar skeleton cards mientras carga
  if (loading || isRefreshing) {
    const skeletonCount = 9; // Número de skeleton cards a mostrar (múltiplo de 3 para filas perfectas)

    return (
      <div className="space-y-6">
        {/* Header con acciones */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">Influencers de la Campaña</h2>
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg text-sm font-medium">
              Cargando...
            </span>
          </div>
          <div className="flex items-center gap-3">
            {/* Botón de vista (cuadrícula) */}
            <Button
              variant="ghost"
              size="sm"
              className={`bg-white shadow-none p-0 w-10 h-10 flex items-center justify-center rounded-lg border-0 focus:ring-0 focus:outline-none ${
                viewMode === "grid" ? "bg-blue-100" : ""
              }`}
              onClick={() => setViewMode("grid")}
            >
              <Grid
                className={`h-5 w-5 ${
                  viewMode === "grid" ? "text-blue-600" : "text-gray-700"
                }`}
              />
            </Button>
            {/* Botón de vista (lista) */}
            <Button
              variant="ghost"
              size="sm"
              className={`bg-white shadow-none p-0 w-10 h-10 flex items-center justify-center rounded-lg border-0 focus:ring-0 focus:outline-none ${
                viewMode === "list" ? "bg-blue-100" : ""
              }`}
              onClick={() => setViewMode("list")}
            >
              <List
                className={`h-5 w-5 ${
                  viewMode === "list" ? "text-blue-600" : "text-gray-700"
                }`}
              />
            </Button>
            {/* Botón de filtros */}
            <InfluencerFiltersButton
              showFilters={showFilters}
              setShowFilters={setShowFilters}
            />
            {/* Botón de agregar influencer */}
            <Button
              variant="ghost"
              size="sm"
              className="bg-white shadow-none p-0 w-10 h-10 flex items-center justify-center rounded-lg border-0 focus:ring-0 focus:outline-none hover:bg-blue-100"
              onClick={() => setShowAddInfluencerModal(true)}
              title="Agregar influencer"
            >
              <UserPlus className="h-5 w-5 text-gray-700 hover:text-blue-600" />
            </Button>
            {/* Botón de reload */}
            <Button
              variant="ghost"
              size="sm"
              className="bg-white shadow-none p-0 w-10 h-10 flex items-center justify-center rounded-lg border-0 focus:ring-0 focus:outline-none hover:bg-blue-100"
              onClick={handleRefresh}
              title="Recargar influencers"
            >
              <RefreshCw
                className={`h-5 w-5 text-gray-700 hover:text-blue-600 ${
                  isRefreshing ? "animate-spin" : ""
                }`}
              />
            </Button>
          </div>
        </div>

        {/* Panel de filtros */}
        {showFilters && (
          <InfluencerFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterPlatform={filterPlatform}
            setFilterPlatform={setFilterPlatform}
            sortBy={sortBy}
            setSortBy={setSortBy}
            onClearFilters={handleClearFilters}
          />
        )}

        {/* Skeleton cards */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
            {Array.from({ length: skeletonCount }).map((_, index) => (
              <InfluencerCardSkeleton key={index} viewMode="grid" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {Array.from({ length: skeletonCount }).map((_, index) => (
              <InfluencerCardSkeleton key={index} viewMode="list" />
            ))}
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
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con acciones */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">Influencers de la Campaña</h2>
          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg text-sm font-medium">
            {filteredInfluencers.length} influencers
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Botón de vista (cuadrícula) */}
          <Button
            variant="ghost"
            size="sm"
            className={`bg-white shadow-none p-0 w-10 h-10 flex items-center justify-center rounded-lg border-0 focus:ring-0 focus:outline-none ${
              viewMode === "grid" ? "bg-blue-100" : ""
            }`}
            onClick={() => setViewMode("grid")}
          >
            <Grid
              className={`h-5 w-5 ${
                viewMode === "grid" ? "text-blue-600" : "text-gray-700"
              }`}
            />
          </Button>
          {/* Botón de vista (lista) */}
          <Button
            variant="ghost"
            size="sm"
            className={`bg-white shadow-none p-0 w-10 h-10 flex items-center justify-center rounded-lg border-0 focus:ring-0 focus:outline-none ${
              viewMode === "list" ? "bg-blue-100" : ""
            }`}
            onClick={() => setViewMode("list")}
          >
            <List
              className={`h-5 w-5 ${
                viewMode === "list" ? "text-blue-600" : "text-gray-700"
              }`}
            />
          </Button>
          {/* Botón de filtros con panel anclado al borde derecho del botón */}
          <div className="relative">
            <InfluencerFiltersButton
              showFilters={showFilters}
              setShowFilters={setShowFilters}
            />
            {showFilters && (
              <div className="absolute top-full right-0 mt-2 z-50">
                <InfluencerFilters
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  filterPlatform={filterPlatform}
                  setFilterPlatform={setFilterPlatform}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  onClearFilters={handleClearFilters}
                  onClose={() => setShowFilters(false)}
                />
              </div>
            )}
          </div>
          {/* Botón de agregar influencer */}
          <Button
            variant="ghost"
            size="sm"
            className="bg-white shadow-none p-0 w-10 h-10 flex items-center justify-center rounded-lg border-0 focus:ring-0 focus:outline-none hover:bg-blue-100"
            onClick={() => setShowAddInfluencerModal(true)}
            title="Agregar influencer"
          >
            <UserPlus className="h-5 w-5 text-gray-700 hover:text-blue-600" />
          </Button>
          {/* Botón de reload */}
          <Button
            variant="ghost"
            size="sm"
            className="bg-white shadow-none p-0 w-10 h-10 flex items-center justify-center rounded-lg border-0 focus:ring-0 focus:outline-none hover:bg-blue-100"
            onClick={handleRefresh}
            title="Recargar influencers"
          >
            <RefreshCw
              className={`h-5 w-5 text-gray-700 hover:text-blue-600 ${
                isRefreshing ? "animate-spin" : ""
              }`}
            />
          </Button>
        </div>
      </div>

      {/* Panel de filtros ya anclado al botón arriba */}

      {/* Lista de influencers */}
      {filteredInfluencers.length === 0 ? (
        <CardNoInfo>
          <CardNoInfoContent className="p-12">
            <div className="text-center">
              <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {influencers.length === 0
                  ? "No hay influencers aún"
                  : "No se encontraron influencers"}
              </h3>
              <p className="text-gray-500">
                {influencers.length === 0
                  ? "No se han agregado influencers a esta campaña"
                  : "Intenta ajustar los filtros para encontrar influencers"}
              </p>
            </div>
          </CardNoInfoContent>
        </CardNoInfo>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
          {filteredInfluencers.map((campaignInfluencer) => {
            const influencerId = campaignInfluencer.influencers?.id || "";

            return (
              <InfluencerCard
                key={campaignInfluencer.id}
                campaignInfluencer={campaignInfluencer}
                postsCount={postsCountByInfluencer[influencerId] || 0}
                activePlatforms={platformsByInfluencer[influencerId] || []}
                onAddPost={handleAddPost}
                onDeleteInfluencer={handleDeleteInfluencer}
                campaignId={campaign.id} // 🎯 NUEVO: Pasar el ID de la campaña
              />
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredInfluencers.map((campaignInfluencer) => {
            const influencerId = campaignInfluencer.influencers?.id || "";

            return (
              <InfluencerListItem
                key={campaignInfluencer.id}
                campaignInfluencer={campaignInfluencer}
                postsCount={postsCountByInfluencer[influencerId] || 0}
                activePlatforms={platformsByInfluencer[influencerId] || []}
                onAddPost={handleAddPost}
                onDeleteInfluencer={handleDeleteInfluencer}
              />
            );
          })}
        </div>
      )}

      {/* Modal para agregar posts */}
      {showAddPostModal && selectedInfluencer && (
        <AddPostModal
          isOpen={showAddPostModal}
          onClose={handleCloseModal}
          onSubmit={handleCreatePost}
          onSuccess={() => {
            // Invalidar cache de posts para que se reflejen las métricas actualizadas
            CacheInvalidators.onPostUpdate(campaign.id, selectedInfluencer.id);
            // El refetch automático ocurrirá al navegar a la tab de Posts
          }}
          influencerName={selectedInfluencer.name}
          campaignId={campaign.id}
          influencerId={selectedInfluencer.id}
        />
      )}

      {/* Modal para eliminar influencers */}
      {deleteInfluencerModal.isOpen && (
        <DeleteInfluencerModal
          isOpen={deleteInfluencerModal.isOpen}
          influencerName={deleteInfluencerModal.influencerName}
          onConfirm={confirmDeleteInfluencer}
          onCancel={cancelDeleteInfluencer}
        />
      )}

      {/* Modal para agregar influencer */}
      <AddInfluencerToCampaignModal
        open={showAddInfluencerModal}
        onClose={() => setShowAddInfluencerModal(false)}
        campaignId={campaign.id}
      />
    </div>
  );
};
