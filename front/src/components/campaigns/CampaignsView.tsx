"use client";

import { Suspense, useEffect, useState, useCallback, lazy, useMemo } from "react";
import { Loader } from "@/components/ui/loader";
import { CampaignsList } from "@/components/campaigns/campaigns-list";
import { useCampaigns } from "@/hooks/campaign/useCampaigns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Filter, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useRoleCache } from "@/hooks/auth/useRoleCache";
import { OutlineButton } from "@/components/ui/robust-buttons";

// Lazy loading del modal de creación de campaña
const CreateCampaignModal = lazy(() => import("./modals/CreateCampaignModal").then((m) => ({
  default: m.CreateCampaignModal,
})));

// Función para forzar recarga de la página
function forceReload() {
  window.location.reload();
}

export function CampaignsView() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const { campaigns, loading, error, getCampaignsWithMetrics, createCampaign } = useCampaigns();
  const { isViewer, loading: roleLoading, isRoleCached } = useRoleCache();

  // Cargar campañas al montar el componente
  useEffect(() => {
    getCampaignsWithMetrics();
  }, [getCampaignsWithMetrics]);

  // Escuchar cambios en el cache de campañas para recargar automáticamente
  useEffect(() => {
    const handleCacheInvalidation = () => {
        
      getCampaignsWithMetrics();
    };

    // Agregar listener para invalidación de cache
    if (typeof window !== 'undefined') {
      window.addEventListener('campaign-cache-invalidated', handleCacheInvalidation);
      
      return () => {
        window.removeEventListener('campaign-cache-invalidated', handleCacheInvalidation);
      };
    }
  }, [getCampaignsWithMetrics]);

  const handleOpenModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleCampaignCreated = useCallback(() => {
    
    
    // Pequeño delay para asegurar que la campaña se haya guardado completamente
    setTimeout(() => {
      
      window.location.reload();
    }, 1000);
  }, []);

  const handleReloadCampaigns = useCallback(() => {

    window.location.reload();
  }, []);

  // Filtrar y ordenar campañas
  const filteredAndSortedCampaigns = campaigns
    .filter((campaign) => {
      // Filtro de búsqueda
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          campaign.name.toLowerCase().includes(query) ||
          campaign.description?.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .filter((campaign) => {
      // Filtro por estado
      if (statusFilter !== "all") {
        return campaign.status === statusFilter;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date":
          return (
            new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
          );
        case "budget":
          return b.budget - a.budget;
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

  // Paginación
  const totalPages = Math.ceil(filteredAndSortedCampaigns.length / pageSize);
  const paginatedCampaigns = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return filteredAndSortedCampaigns.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedCampaigns, page]);

  // Resetear página cuando cambien los filtros
  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter, sortBy]);

  return (
    <Suspense
      fallback={
        <Card className="col-span-full border-gray-400">
          <CardContent className="flex flex-col items-center justify-center pt-24 pb-16 space-y-4">
            <Loader variant="primary" size="lg" />
            <div className="text-center space-y-2">
              <p className="text-lg font-medium text-gray-900">
                Cargando campañas
              </p>
              <p className="text-sm text-gray-500">
                Obteniendo la información más reciente...
              </p>
            </div>
          </CardContent>
        </Card>
      }
    >
      <div className="space-y-6">
        {/* Header con contenedor blanco */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4">
            {/* Header con título y botón */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Campañas
                </h1>
                <p className="text-gray-500 text-sm">
                  {!roleLoading && isRoleCached() && isViewer() 
                    ? "Visualiza todas las campañas de la organización" 
                    : "Gestiona y supervisa todas tus campañas"
                  }
                </p>
              </div>
              {/* Solo mostrar botón "Nueva Campaña" si NO es viewer */}
              {(!roleLoading && isRoleCached() && !isViewer()) && (
                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleOpenModal}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium shadow-sm hover:from-blue-700 hover:to-blue-800 hover:shadow-md transition-all duration-200 text-sm"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    Nueva Campaña
                  </Button>
                </div>
              )}
            </div>

            {/* Filtros integrados */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
              <div className="flex flex-col lg:flex-row items-center gap-3 flex-1">
                {/* Búsqueda */}
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar campañas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-9 text-sm bg-gray-50 !border-gray-300 focus:bg-white focus:!border-gray-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                  />
                </div>

                {/* Filtros */}
                <div className="flex items-center gap-4">
                  {/* Estado */}
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[220px] h-9 text-sm bg-gray-50 !border-gray-300 focus:bg-white focus:!border-gray-400 text-left">
                      <SelectValue placeholder="Por estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="active">Activas</SelectItem>
                      <SelectItem value="planned">Planificadas</SelectItem>
                      <SelectItem value="draft">Borrador</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Ordenar por */}
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[220px] h-9 text-sm bg-gray-50 !border-gray-300 focus:bg-white focus:!border-gray-400 text-left">
                      <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Nombre</SelectItem>
                      <SelectItem value="date">Fecha</SelectItem>
                      <SelectItem value="budget">Presupuesto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Botón de recarga - completamente a la derecha */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleReloadCampaigns}
                className="h-9 px-3 text-sm bg-gray-50 !border-gray-300 hover:bg-gray-100 hover:!border-gray-400 transition-all duration-200"
                title="Recargar página (F5)"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <Suspense fallback={null}>
          {isModalOpen && (
            <CreateCampaignModal
              open={isModalOpen}
              onOpenChange={handleCloseModal}
              onCreated={handleCampaignCreated}
              createCampaign={createCampaign}
            />
          )}
        </Suspense>

        {/* Contenedor con sombra para la lista de campañas */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <CampaignsList
                campaigns={paginatedCampaigns}
                loading={loading}
                onCampaignUpdated={forceReload}
                onCampaignUpdatedOptimistic={forceReload}
                onCampaignDeletedOptimistic={forceReload}
              />
            </div>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center border-t border-gray-100 bg-white py-2">
              <div className="flex items-center gap-2">
                <OutlineButton
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  disabled={page === 1 || loading}
                  className="px-2 py-1 text-sm"
                >
                  Anterior
                </OutlineButton>
                
                <span className="text-xs text-gray-600 px-2">
                  {page} / {totalPages}
                </span>
                
                <OutlineButton
                  onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={page === totalPages || loading}
                  className="px-2 py-1 text-sm"
                >
                  Siguiente
                </OutlineButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </Suspense>
  );
}
