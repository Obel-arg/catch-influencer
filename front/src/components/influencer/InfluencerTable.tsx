"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { MoreVertical, Eye, UserPlus, Trash2, AlertTriangle, RefreshCw, Search, Users, ChevronUp, ChevronDown, Link } from "lucide-react";
import { useInfluencers } from "@/hooks/influencer/useInfluencers";
import { useRouter } from 'next/navigation';
import { LazyInfluencerAvatar } from "@/components/explorer/LazyInfluencerAvatar";
import { SkeletonInfluencerTableRows } from "./SkeletonInfluencerTable";
import { PrimaryButton, OutlineButton } from "@/components/ui/robust-buttons";
import { campaignService } from "@/lib/services/campaign";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCampaigns } from "@/hooks/campaign/useCampaigns";
import { RobustModal } from "@/components/ui/robust-modal";
import { useRoleCache } from "@/hooks/auth/useRoleCache";
import { ConnectPlatformsModal } from "./ConnectPlatformsModal";

// Iconos de plataformas desde public/icons
const PlatformIcon = ({ platform }: { platform: string }) => {
  const iconMap: Record<string, { src: string; size: number }> = {
    youtube: { src: '/icons/youtube.svg', size: 24 },
    instagram: { src: '/icons/instagram.svg', size: 24 },
    tiktok: { src: '/icons/tiktok.svg', size: 18 },
    facebook: { src: '/icons/facebook.svg', size: 18 },
    threads: { src: '/icons/threads.svg', size: 18 },
    spotify: { src: '/icons/spotify.svg', size: 18 },
    apple: { src: '/icons/apple.svg', size: 18 },
    amazon: { src: '/icons/amazon.svg', size: 18 },
    deezer: { src: '/icons/deezer.svg', size: 18 },
    tidal: { src: '/icons/tidal.svg', size: 18 },
    google: { src: '/icons/google.svg', size: 18 },
  };
  const key = platform.toLowerCase();
  if (iconMap[key]) {
    return <img 
      src={iconMap[key].src} 
      alt={platform} 
      title={platform} 
      style={{ width: iconMap[key].size, height: iconMap[key].size }} 
    />;
  }
  return <span>{platform}</span>;
};

interface InfluencerTableProps {
  influencers?: any[];
  loading?: boolean;
  searchQuery?: string;
}

export default function InfluencerTable({ influencers = [], loading = false, searchQuery = "" }: InfluencerTableProps) {
  const router = useRouter();
  const { deleteInfluencer, refreshInfluencerData } = useInfluencers();
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const { isViewer, loading: roleLoading, isRoleCached } = useRoleCache();
  
  // 🎯 ESTADOS PARA ORDENAMIENTO
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);
  
  // 🎯 ESTADOS PARA MODALES
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedInfluencer, setSelectedInfluencer] = useState<any>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [assignSuccess, setAssignSuccess] = useState(false);
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [campaignSearch, setCampaignSearch] = useState("");
  const [showSubmitCreatorModal, setShowSubmitCreatorModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showConnectPlatformsModal, setShowConnectPlatformsModal] = useState(false);
  
  // 🎯 HOOKS PARA CAMPAÑAS
  const { campaigns = [], loading: loadingCampaigns, getCampaigns } = useCampaigns();

  // 🎯 FUNCIÓN PARA MANEJAR ORDENAMIENTO
  const handleSort = (field: string) => {
    if (sortField === field) {
      // Si ya está ordenado por este campo, cambiar dirección
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        // Si está en desc, volver al orden original
        setSortField(null);
        setSortDirection(null);
      }
    } else {
      // Si es un campo nuevo, empezar con asc
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // 🎯 FUNCIÓN PARA OBTENER ICONO DE ORDENAMIENTO
  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ChevronUp className="h-4 w-4 text-gray-400" />;
    }
    if (sortDirection === 'asc') {
      return <ChevronUp className="h-4 w-4 text-blue-600" />;
    }
    if (sortDirection === 'desc') {
      return <ChevronDown className="h-4 w-4 text-blue-600" />;
    }
    return <ChevronUp className="h-4 w-4 text-gray-400" />;
  };

  // 🎯 FILTRADO Y ORDENAMIENTO SIMPLIFICADO
  const filtered = useMemo(() => {
    let result = influencers;
    
    // Aplicar filtro de búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((inf: any) =>
        (inf.name || "").toLowerCase().includes(query) ||
        (inf.platform_info?.instagram?.basicInstagram?.instagramId || "").toLowerCase().includes(query) ||
        (inf.platform_info?.tiktok?.basicTikTok?.tiktokId || "").toLowerCase().includes(query)
      );
    }
    
    // Aplicar ordenamiento
    if (sortField && sortDirection) {
      result = [...result].sort((a: any, b: any) => {
        let aValue: any;
        let bValue: any;
        
        switch (sortField) {
          case 'followers':
            aValue = Number(a.followers_count) || 0;
            bValue = Number(b.followers_count) || 0;
            break;
          case 'engagement':
            aValue = Number(a.average_engagement_rate) || 0;
            bValue = Number(b.average_engagement_rate) || 0;
            break;
          default:
            return 0;
        }
        
        if (sortDirection === 'asc') {
          return aValue - bValue;
        } else {
          return bValue - aValue;
        }
      });
    }
    
    return result;
  }, [influencers, searchQuery, sortField, sortDirection]);

  // Paginación
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return filtered.slice(startIndex, startIndex + pageSize);
  }, [filtered, page]);

  // 🎯 MOSTRAR "NO FOUND" SOLO SI NO HAY LOADING Y NO HAY DATOS
  const shouldShowNoResults = !loading && filtered.length === 0 && searchQuery;

  // Formatear seguidores como K/M
  const formatNumber = (num: number) => {
    if (!num) return '-';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // 🎯 FUNCIONES PARA MANEJAR ACCIONES
  const handleViewDetails = (influencerId: string) => {
    router.push(`/influencers/${influencerId}`);
  };

  // 🎯 FUNCIONES PARA MANEJAR ACCIONES
  const handleAssignToCampaign = (influencer: any) => {
    setSelectedInfluencer(influencer);
    setSelectedCampaigns([]); // Resetear selección
    setCampaignSearch(""); // Resetear búsqueda
    setShowAssignModal(true);
    setAssignError(null);
    setAssignSuccess(false);
    // Cargar campañas si no están cargadas
    if (campaigns.length === 0) {
      getCampaigns();
    }
  };

  const handleDelete = (influencer: any) => {
    setSelectedInfluencer(influencer);
    setShowDeleteModal(true);
  };

  const handleConnectPlatforms = (influencer: any) => {
    setSelectedInfluencer(influencer);
    setShowConnectPlatformsModal(true);
  };

  // 🎯 FUNCIÓN PARA ASIGNAR A CAMPAÑA
  const handleAssignToCampaigns = async () => {
    if (!selectedInfluencer || selectedCampaigns.length === 0) return;
    
    setIsAssigning(true);
    setAssignError(null);
    
    try {
      
      // Asignar el influencer a cada campaña seleccionada
      const assignments = selectedCampaigns.map(campaignId => 
        campaignService.addInfluencerToCampaign(campaignId, selectedInfluencer.id, 0)
      );
      
      await Promise.all(assignments);
      
      setAssignSuccess(true);
      
      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        setShowAssignModal(false);
        setAssignSuccess(false);
        setSelectedCampaigns([]);
      }, 2000);
      
    } catch (error) {
      console.error('❌ Error al asignar influencer a campañas:', error);
      setAssignError('Error al asignar influencer a campañas');
    } finally {
      setIsAssigning(false);
    }
  };

  // 🎯 FUNCIÓN PARA MANEJAR SELECCIÓN DE CAMPAÑAS
  const handleCampaignToggle = (campaignId: string) => {
    setSelectedCampaigns(prev => 
      prev.includes(campaignId) 
        ? prev.filter(id => id !== campaignId)
        : [...prev, campaignId]
    );
  };

  // 🎯 FILTRAR CAMPAÑAS POR BÚSQUEDA
  const filteredCampaigns = useMemo(() => {
    if (!campaignSearch.trim()) return campaigns;
    return campaigns.filter(campaign =>
      campaign.name.toLowerCase().includes(campaignSearch.toLowerCase())
    );
  }, [campaigns, campaignSearch]);

  // 🎯 FUNCIÓN PARA ACTUALIZAR DATOS DEL INFLUENCER
  const handleRefreshData = async (influencer: any) => {
    try {
      // 🎯 NUEVO: Mostrar indicador de carga específico para este influencer
      const updatedInfluencer = await refreshInfluencerData(influencer.id);
      
      if (updatedInfluencer) {
        // 🎯 NUEVO: Actualizar la lista local con los datos frescos
        // This part of the logic needs to be re-evaluated as 'influencers' prop is now directly used
        // For now, we'll assume the parent component will manage the full list.
        // If the intent was to update the 'influencers' prop directly, this would be needed.
        // For now, we'll just re-filter the current 'influencers' prop.
        // This might need a more robust state management if 'influencers' is not directly mutable.
        // For simplicity, let's assume 'influencers' is managed by the parent and this just refreshes it.
        // If 'influencers' were mutable, you'd do:
        // setAllInfluencers(prev => prev.map(inf => 
        //   inf.id === influencer.id ? updatedInfluencer : inf
        // ));
      }
    } catch (error) {
      console.error('Error refreshing influencer data:', error);
    }
  };

  // 🎯 FUNCIÓN PARA CONFIRMAR ELIMINACIÓN
  const handleConfirmDelete = async () => {
    if (!selectedInfluencer) return;
    
    try {
      await deleteInfluencer(selectedInfluencer.id);
      setShowDeleteModal(false);
      setSelectedInfluencer(null);
      
      // Remover de la lista local
      // This part of the logic needs to be re-evaluated as 'influencers' prop is now directly used
      // For now, we'll assume the parent component will manage the full list.
      // If the intent was to update the 'influencers' prop directly, this would be needed.
      // For now, we'll just re-filter the current 'influencers' prop.
      // This might need a more robust state management if 'influencers' is not directly mutable.
      // For simplicity, let's assume 'influencers' are managed by the parent and this just refreshes it.
      // If 'influencers' were mutable, you'd do:
      // setAllInfluencers(prev => prev.filter(inf => inf.id !== selectedInfluencer.id));
    } catch (error) {
      console.error('Error deleting influencer:', error);
    }
  };

  return (
    <>
      {/* 🎯 NO RESULTS STATE */}
      {shouldShowNoResults && (
        <div className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4">
            <Search className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No se encontraron influencers</h3>
          <p className="text-gray-500">Intenta ajustar la búsqueda para ver más resultados.</p>
        </div>
      )}

      {/* 🎯 TABLA CON SKELETON O DATOS */}
      {(paginated.length > 0 || loading) && (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-gray-200">
                <TableHead className="w-[250px] font-semibold text-gray-700 py-2 text-sm">Influencer</TableHead>
                <TableHead className="w-[120px] font-semibold text-gray-700 text-center py-2 text-sm">País</TableHead>
                <TableHead className="w-[140px] font-semibold text-gray-700 text-center py-2 text-sm">Plataforma</TableHead>
                <TableHead 
                  className="w-[120px] font-semibold text-gray-700 text-center py-2 text-sm cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleSort('followers')}
                >
                  <div className="flex items-center justify-center gap-1">
                    Seguidores
                    {getSortIcon('followers')}
                  </div>
                </TableHead>
                <TableHead 
                  className="w-[120px] font-semibold text-gray-700 text-center py-2 text-sm cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleSort('engagement')}
                >
                  <div className="flex items-center justify-center gap-1">
                    Engagement
                    {getSortIcon('engagement')}
                  </div>
                </TableHead>
                <TableHead className="w-[120px] font-semibold text-gray-700 text-center py-2 text-sm">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Skeleton durante carga */}
              {loading && <SkeletonInfluencerTableRows rows={6} />}
              
              {/* Datos reales (solo si no está cargando) */}
              {!loading && paginated.map((inf: any) => (
                <TableRow key={inf.id} className="hover:bg-gray-200 border-b border-gray-100 transition-colors duration-200">
                  <TableCell>
                    <div className="flex items-center gap-3 min-w-[180px]">
                      {/* 🎯 LAZY LOADING AVATAR */}
                      <LazyInfluencerAvatar 
                        influencer={{
                          name: inf.name,
                          avatar: inf.avatar || inf.platform_info?.youtube?.avatar
                        }}
                        className="w-10 h-10"
                      />
                      <span className="font-medium text-base text-gray-900">
                        {/* 🎯 MOSTRAR USERNAME DE INSTAGRAM O TIKTOK EN LUGAR DEL NOMBRE NUMÉRICO */}
                        {inf.platform_info?.instagram?.basicInstagram?.instagramId && 
                         inf.platform_info.instagram.basicInstagram.instagramId !== inf.name
                          ? `@${inf.platform_info.instagram.basicInstagram.instagramId}`
                          : inf.platform_info?.tiktok?.basicTikTok?.tiktokId && 
                            inf.platform_info.tiktok.basicTikTok.tiktokId !== inf.name
                            ? `@${inf.platform_info.tiktok.basicTikTok.tiktokId}`
                            : inf.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-gray-600">
                    {/* 🎯 MOSTRAR PAÍS DESDE PLATFORM_INFO (INSTAGRAM, TIKTOK, YOUTUBE) */}
                    {inf.platform_info?.instagram?.basicInstagram?.country || 
                     inf.platform_info?.tiktok?.basicTikTok?.country ||
                     inf.platform_info?.youtube?.basicYoutube?.country ||
                     inf.location || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 items-center justify-center">
                      {(inf.social_platforms && inf.social_platforms.length > 0)
                        ? inf.social_platforms.map((p: string) => <PlatformIcon key={p} platform={p} />)
                        : inf.main_social_platform ? <PlatformIcon platform={inf.main_social_platform} /> : (
                          <span className="text-gray-400">-</span>
                        )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-medium text-gray-900">
                    {formatNumber(Number(inf.followers_count))}
                  </TableCell>
                  <TableCell className="text-center">
                    {typeof inf.average_engagement_rate === 'number'
                      ? <span className="font-medium text-green-600">
                          {(inf.average_engagement_rate * 100).toFixed(2)}%
                        </span>
                      : <span className="text-gray-400">-</span>}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      {/* 🎯 ICONO PARA VER DETALLES */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(inf.id)}
                        className="h-8 w-8 p-0 hover:bg-transparent hover:text-blue-600"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {/* 🎯 DROPDOWN CON 3 PUNTITOS - Solo mostrar si NO es viewer */}
                      {(!roleLoading && isRoleCached() && !isViewer()) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-transparent hover:text-gray-600"
                              title="Más opciones"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 bg-white border border-gray-200 shadow-lg">
                            <DropdownMenuItem
                              onClick={() => handleRefreshData(inf)}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <RefreshCw className="h-4 w-4" />
                              Actualizar datos
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleAssignToCampaign(inf)}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <UserPlus className="h-4 w-4" />
                              Asignar a campaña
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleConnectPlatforms(inf)}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <Link className="h-4 w-4" />
                              Conectar plataformas
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(inf)}
                              className="flex items-center gap-2 cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* 🎯 ESTADO VACÍO CUANDO NO HAY DATOS */}
      {!loading && filtered.length === 0 && !searchQuery && (
        <div className="p-6 text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 mb-3">
            <Users className="h-5 w-5 text-gray-400" />
          </div>
          <h3 className="text-base font-medium text-gray-900 mb-1">No hay influencers</h3>
          <p className="text-gray-500 text-sm">Aún no has agregado ningún influencer a tu lista.</p>
        </div>
      )}

      {/* 🎯 PAGINACIÓN OPTIMIZADA */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center border-t border-gray-100 bg-white py-2">
          <div className="flex items-center gap-2">
            <OutlineButton
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="px-2 py-1 text-sm"
            >
              Anterior
            </OutlineButton>
            
            <span className="text-xs text-gray-600 px-2">
              {page} / {totalPages}
            </span>
            
            <OutlineButton
              onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
              className="px-2 py-1 text-sm"
            >
              Siguiente
            </OutlineButton>
          </div>
        </div>
      )}

      {/* 🎯 MODAL DE ASIGNACIÓN A CAMPAÑA */}
      {showAssignModal && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60]" 
            onClick={() => setShowAssignModal(false)}
          />
          
          {/* Modal Content */}
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div 
              className="max-w-2xl w-full bg-white shadow-2xl border-0 rounded-lg animate-in fade-in-0 zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
              style={{ overflow: 'visible' }}
            >
                             {/* Header */}
               <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg">
                 <div className="flex items-center justify-between">
                   <div>
                     <h2 className="text-lg font-semibold flex items-center gap-2">
                       <UserPlus className="h-5 w-5" />
                       Asignar a campaña
                     </h2>

                   </div>
                   <div className="flex items-center gap-2">
                     <LazyInfluencerAvatar 
                       influencer={{
                         name: selectedInfluencer?.name,
                         avatar: selectedInfluencer?.avatar || selectedInfluencer?.platform_info?.youtube?.avatar
                       }}
                       className="w-8 h-8"
                     />
                     <span className="font-medium text-white">{selectedInfluencer?.name}</span>
                   </div>
                 </div>
               </div>

              {/* Contenido */}
              <div className="p-6">
                                 {/* 🎯 BUSCADOR DE CAMPAÑAS */}
                 <div className="space-y-4">
                   <div className="relative">
                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                     <Input
                       placeholder="Buscar campañas..."
                       value={campaignSearch}
                       onChange={(e) => setCampaignSearch(e.target.value)}
                       className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                     />
                   </div>

                   {/* 🎯 LISTA DE CAMPAÑAS FILTRADAS */}
                   {(() => {
                     const filteredCampaigns = campaigns.filter(campaign =>
                       campaign.name.toLowerCase().includes(campaignSearch.toLowerCase())
                     );

                     return (
                       <div className={`${filteredCampaigns.length > 5 ? 'max-h-64 overflow-y-auto' : ''}`}>
                         {loadingCampaigns ? (
                           <div className="text-center py-8">
                             <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                             <p className="text-gray-500">Cargando campañas...</p>
                           </div>
                         ) : filteredCampaigns.length > 0 ? (
                           <div className="space-y-2">
                             {filteredCampaigns.map((campaign) => (
                               <div
                                 key={campaign.id}
                                 className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                                   selectedCampaigns.includes(campaign.id) 
                                     ? 'bg-blue-50 border-blue-200' 
                                     : 'border-gray-200 hover:bg-gray-50'
                                 }`}
                                 onClick={() => handleCampaignToggle(campaign.id)}
                               >
                                 <span className="font-medium text-gray-900">{campaign.name}</span>
                                 {selectedCampaigns.includes(campaign.id) && (
                                   <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                                     <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                       <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                     </svg>
                                   </div>
                                 )}
                               </div>
                             ))}
                           </div>
                         ) : campaignSearch.trim() ? (
                           <div className="text-center py-8">
                             <p className="text-gray-500">No se encontraron campañas que coincidan con "{campaignSearch}"</p>
                           </div>
                         ) : (
                           <div className="text-center py-8">
                             <p className="text-gray-500">No hay campañas disponibles</p>
                           </div>
                         )}
                       </div>
                     );
                   })()}
                 </div>

                {assignError && (
                  <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md mt-4">
                    {assignError}
                  </div>
                )}

                {assignSuccess && (
                  <div className="text-green-600 text-sm bg-green-50 p-3 rounded-md mt-4">
                    ¡Influencer asignado exitosamente!
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-500">

                    </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowAssignModal(false)}>
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleAssignToCampaigns}
                      disabled={selectedCampaigns.length === 0 || isAssigning}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isAssigning ? 'Asignando...' : `Asignar a ${selectedCampaigns.length} campaña${selectedCampaigns.length !== 1 ? 's' : ''}`}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 🎯 MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Confirmar eliminación
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar a <strong>{selectedInfluencer?.name}</strong>? 
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 🎯 MODAL DE CONECTAR PLATAFORMAS */}
      <ConnectPlatformsModal
        isOpen={showConnectPlatformsModal}
        onClose={() => setShowConnectPlatformsModal(false)}
        influencer={selectedInfluencer}
        onPlatformsUpdated={() => {
          // Recargar datos del influencer si es necesario
          if (selectedInfluencer) {
            refreshInfluencerData(selectedInfluencer.id);
          }
        }}
      />
    </>
  );
} 