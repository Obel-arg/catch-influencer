import { useEffect, useState } from 'react';
import { ChevronDown, User, Users, Calendar, DollarSign } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Estilos CSS para line-clamp
const lineClampStyles = {
  lineClamp2: {
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
    wordBreak: 'break-word' as const,
  }
};

interface AssignmentResult {
  successes: string[];
  alreadyAssigned: string[];
  failed: string[];
}

interface ExplorerAssignModalProps {
  open: boolean;
  onClose: () => void;
  onCloseSuccess?: () => void; // 🎯 NUEVO: Callback para cuando se cierra exitosamente
  influencers: string[];
  influencersData?: any[]; // Datos completos de los influencers seleccionados
  campaigns: any[];
  loadingCampaigns?: boolean; // 🎯 NUEVA PROP: Estado de carga de campañas
  onAssign: (campaignIds: string[]) => void; // 🎯 CAMBIO: Ahora recibe array de IDs
  isAssigning: boolean;
  assignError: string | null;
  assignSuccess: boolean;
  assignmentResult?: AssignmentResult | null;
  onRemoveInfluencer?: (influencerId: string) => void; // 🎯 NUEVA PROP: Para remover influencers
}

// Función para procesar avatares (igual que en otros componentes del Explorer)
const getProcessedAvatar = (influencer: any) => {
  const avatarUrl = influencer.avatar || influencer.image || influencer.avatar_url || influencer.profilePicture || influencer.profile_picture;
  
  if (!avatarUrl) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(influencer.name?.charAt(0) || 'U')}&background=6366f1&color=fff&size=128`;
  }

  // ✨ INSTAGRAM: Usar proxy para evitar CORS
  if (avatarUrl.includes('fbcdn.net') || avatarUrl.includes('cdninstagram.com') || avatarUrl.includes('instagram')) {
    return `https://images.weserv.nl/?url=${encodeURIComponent(avatarUrl)}&w=128&h=128&fit=cover&a=smart`;
  } 
  // ✨ YOUTUBE/TIKTOK: Usar directamente
  else if (avatarUrl.includes('ytimg.com') || avatarUrl.includes('ggpht.com') || avatarUrl.includes('googleusercontent.com') || 
           avatarUrl.includes('tiktokcdn.com') || avatarUrl.includes('muscdn.com')) {
    return avatarUrl;
  }
  // ✨ OTROS: Usar proxy
  else {
    return `https://images.weserv.nl/?url=${encodeURIComponent(avatarUrl)}&w=128&h=128&fit=cover&a=smart`;
  }
};

// Componente Avatar usando shadcn/ui (igual que en Explorer principal)
function InfluencerAvatar({ influencer, index }: { influencer: any; index: number }) {
  const processedAvatarUrl = getProcessedAvatar(influencer);
  
  return (
    <Avatar className="h-8 w-8 ring-1 ring-gray-200">
      <AvatarImage src={processedAvatarUrl} alt={influencer.name || 'Avatar'} />
      <AvatarFallback className="bg-blue-100 text-blue-600 text-xs font-medium">
        {influencer.name?.charAt(0)?.toUpperCase() || 'U'}
      </AvatarFallback>
    </Avatar>
  );
}

// 🎯 Íconos de plataformas (misma ruta que el Explorer)
const getPlatformIcon = (platform: string) => {
  let iconSrc = "";
  let iconClass = "h-4 w-4";
  switch (platform) {
    case "Instagram":
      iconSrc = "/icons/instagram.svg";
      break;
    case "TikTok":
      iconSrc = "/icons/tiktok.svg";
      iconClass = "h-3.5 w-3.5";
      break;
    case "YouTube":
      iconSrc = "/icons/youtube.svg";
      break;
    case "Facebook":
      iconSrc = "/icons/facebook.svg";
      break;
    case "Threads":
      iconSrc = "/icons/threads.svg";
      break;
    default:
      return null;
  }
  return <img src={iconSrc} alt={`${platform} icon`} className={iconClass} />;
};

// ✨ Detección de plataformas disponibles del influencer
const detectAvailablePlatforms = (influencer: any): string[] => {
  const platforms: string[] = [];
  const info = influencer?.platformInfo || {};

  if (info.youtube) platforms.push("YouTube");
  if (info.instagram) platforms.push("Instagram");
  if (info.tiktok) platforms.push("TikTok");
  if (info.facebook) platforms.push("Facebook");
  if (info.threads) platforms.push("Threads");

  if (platforms.length === 0 && Array.isArray(influencer?.socialPlatforms)) {
    influencer.socialPlatforms.forEach((p: any) => {
      const name = typeof p === 'string' ? p : p.platform;
      if (name) platforms.push(String(name).charAt(0).toUpperCase() + String(name).slice(1));
    });
  }

  return Array.from(new Set(platforms));
};

export default function ExplorerAssignModal({ 
  open, 
  onClose, 
  onCloseSuccess,
  influencers, 
  influencersData = [],
  campaigns, 
  loadingCampaigns = false,
  onAssign, 
  isAssigning, 
  assignError, 
  assignSuccess,
  assignmentResult,
  onRemoveInfluencer
}: ExplorerAssignModalProps) {
  

  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showClosingMessage, setShowClosingMessage] = useState<boolean>(false);

  // Resetear selección cuando se abre el modal
  useEffect(() => {
    if (open) {
      setSelectedCampaigns([]);
      setLocalError(null);
      setSearchTerm('');
    }
  }, [open]);

  // 🎯 NUEVO: Cerrar modal automáticamente cuando no quedan influencers
  useEffect(() => {
    // 🎯 ARREGLO: No cerrar automáticamente si hay una asignación exitosa en proceso
    if (open && influencers.length === 0 && !assignSuccess && !isAssigning) {
      // Mostrar mensaje informativo
      setShowClosingMessage(true);
      
      // Cerrar modal después de mostrar el mensaje
      const timer = setTimeout(() => {
        setShowClosingMessage(false);
        onClose();
      }, 1000);
      
      return () => {
        clearTimeout(timer);
        setShowClosingMessage(false);
      };
    } else {
      setShowClosingMessage(false);
    }
  }, [influencers.length, open, onClose, assignSuccess, isAssigning]);

  // Filtrar campañas por búsqueda
  const filteredCampaigns = campaigns.filter(campaign => 
    campaign.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.id?.toString().includes(searchTerm)
  );

  // Cerrar modal automáticamente cuando se guarde exitosamente
  useEffect(() => {
    if (assignSuccess && open) {
      // 🎯 MEJORA: Cerrar inmediatamente después del éxito, sin esperar 3 segundos
      const timer = setTimeout(() => {
        // 🎯 NUEVO: Llamar callback de éxito antes de cerrar
        if (onCloseSuccess) {
          onCloseSuccess();
        }
        onClose();
      }, 2000); // Reducido de 3000 a 2000ms para mejor UX
      return () => clearTimeout(timer);
    }
  }, [assignSuccess, open, onClose, onCloseSuccess]);

  // Toggle de selección de campaña
  const handleToggleCampaign = (campaignId: string) => {
    setSelectedCampaigns(prev => {
      if (prev.includes(campaignId)) {
        return prev.filter(id => id !== campaignId);
      } else {
        return [...prev, campaignId];
      }
    });
  };

  const handleAssign = () => {
    if (selectedCampaigns.length === 0) {
      setLocalError('Selecciona al menos una campaña');
      return;
    }
    setLocalError(null);
    onAssign(selectedCampaigns);
  };

  // Formatear fechas de campaña
  const formatCampaignDate = (dateString: string) => {
    if (!dateString) return 'Sin fecha';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'short',
      year: 'numeric'
    });
  };

  // Obtener color de estado de campaña
  const getCampaignStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'activa':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'planned':
      case 'planificada':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'draft':
      case 'borrador':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'completed':
      case 'completada':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60]" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div 
          className="max-w-3xl w-full bg-white shadow-2xl border-0 rounded-lg animate-in fade-in-0 zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
          style={{ overflow: 'visible' }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5" />
                Asignar influencers a campañas
              </h2>
              <p className="text-blue-100 mt-1 text-sm">
                Selecciona las campañas a las que quieres asignar {influencers.length} influencer{influencers.length !== 1 ? 's' : ''}.
                {selectedCampaigns.length > 0 && (
                  <span className="font-medium"> • {selectedCampaigns.length} campaña{selectedCampaigns.length !== 1 ? 's' : ''} seleccionada{selectedCampaigns.length !== 1 ? 's' : ''}.</span>
                )}
              </p>
            </div>
          </div>

          {/* Contenido con diseño de dos columnas */}
          <div className="flex h-[500px]" style={{ overflow: 'visible' }}>
                         {/* Columna izquierda - Lista de influencers (SIEMPRE VISIBLE) */}
             <div className="w-2/5 bg-gray-50 border-r border-gray-200 p-4 flex flex-col">
               <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center gap-2">
                 <User className="h-4 w-4" />
                 Influencers ({influencers.length})
               </h3>
               <div className="space-y-2 overflow-y-auto flex-1 pr-2">
                {influencersData.length > 0 ? (
                  influencersData.map((influencer, index) => (
                                         <div key={influencer.id || index} className="bg-white rounded-md p-3 pr-10 shadow-sm border border-gray-200 relative">
                       {/* Botón X en la esquina superior derecha - SIEMPRE VISIBLE */}
                                               <button
                          onClick={() => onRemoveInfluencer ? onRemoveInfluencer(influencer.creatorId || influencer.id) : console.log('Remover influencer:', influencer.creatorId || influencer.id)}
                          className="absolute top-1.5 right-1.5 w-5 h-5 bg-gray-400 hover:bg-gray-500 text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg z-50"
                          title="Remover influencer"
                        >
                         <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                         </svg>
                       </button>
                      <div className="flex items-center gap-3">
                        <InfluencerAvatar influencer={influencer} index={index} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm leading-tight">
                            {influencer.name || `Influencer ${index + 1}`}
                          </p>
                          {(influencer.socialPlatforms && influencer.socialPlatforms.length > 0 && influencer.socialPlatforms[0].followers) ? (
                            <p className="text-xs text-gray-500 leading-tight">
                              {influencer.socialPlatforms[0].followers.toLocaleString()} seguidores
                            </p>
                          ) : influencer.followersCount ? (
                            <p className="text-xs text-gray-500 leading-tight">
                              {influencer.followersCount.toLocaleString()} seguidores
                            </p>
                                                      ) : null}
                          {/* Íconos de plataformas */}
                          {(() => {
                            const platforms = detectAvailablePlatforms(influencer);
                            return platforms.length > 0 ? (
                              <div className="flex items-center gap-1.5 mt-1">
                                {platforms.map((p) => (
                                  <span key={p} className="inline-flex" title={p}>
                                    {getPlatformIcon(p)}
                                  </span>
                                ))}
                              </div>
                            ) : null;
                          })()}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  // Fallback si no hay datos completos
                  influencers.map((id, index) => (
                                         <div key={id} className="bg-white rounded-md p-3 pr-10 shadow-sm border border-gray-200 relative">
                       {/* Botón X en la esquina superior derecha - SIEMPRE VISIBLE */}
                       <button
                         onClick={() => onRemoveInfluencer ? onRemoveInfluencer(id) : console.log('Remover influencer:', id)}
                         className="absolute top-1.5 right-1.5 w-5 h-5 bg-gray-400 hover:bg-gray-500 text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg z-50"
                         title="Remover influencer"
                       >
                         <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                         </svg>
                       </button>
                      <div className="flex items-center gap-3">
                        <InfluencerAvatar influencer={{ id, name: `Influencer ${index + 1}` }} index={index} />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm leading-tight">
                            Influencer {index + 1}
                          </p>
                          <p className="text-xs text-gray-500 leading-tight">
                            ID: {id.substring(0, 8)}...
                          </p>
                          {/* En fallback no conocemos plataformas */}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Columna derecha - Selección de campañas o estados */}
            <div className="flex-1 p-2 relative flex flex-col">
              <div className="h-full flex flex-col">
                                 {/* Condición: Mostrar lista de campañas solo si no está asignando, no hay resultados, y no se está cerrando */}
                 {!isAssigning && !assignSuccess && !assignError && !showClosingMessage ? (
                   <>
                     <label className="block text-sm font-medium text-gray-800 mb-3 mt-2">
                       Seleccionar Campañas ({selectedCampaigns.length}/{campaigns.length})
                     </label>
                     
                     {/* Search Input */}
                     <div className="mb-3">
                       <div className="relative">
                         <input
                           type="text"
                           placeholder="Buscar campañas..."
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                           className="w-full px-3 py-2 pl-9 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                         />
                         <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                         </svg>
                       </div>
                     </div>
                     
                     {/* Lista de campañas */}
                     <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                       {loadingCampaigns ? (
                         <div className="text-center py-8 w-full">
                           <div className="text-gray-400 mb-2">
                             <svg className="animate-spin h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24">
                               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                             </svg>
                           </div>
                           <p className="text-gray-500">Cargando campañas...</p>
                         </div>
                       ) : filteredCampaigns.length > 0 ? (
                         filteredCampaigns.map((campaign) => {
                           const isSelected = selectedCampaigns.includes(campaign.id);
                           return (
                             <div
                               key={campaign.id}
                               onClick={() => handleToggleCampaign(campaign.id)}
                               className={`
                                 relative p-3.5 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md w-full
                                 ${isSelected 
                                   ? 'border-blue-500 bg-blue-50 shadow-lg' 
                                   : 'border-gray-200 bg-white hover:border-gray-300'
                                 }
                               `}
                             >
                               {/* Indicador de selección */}
                               {isSelected && (
                                 <div className="absolute top-2 right-2 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                                   <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                   </svg>
                                 </div>
                               )}
                               
                               {/* Contenido de la card */}
                               <div className="flex flex-col gap-2.5 pr-7">
                                 {/* Fila superior: Nombre y Estado */}
                                 <div className="flex items-start justify-between gap-3 min-w-0">
                                   <div className="min-w-0 flex-1">
                                     <h4 
                                       className={`font-semibold text-sm leading-snug ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}
                                       style={lineClampStyles.lineClamp2}
                                     >
                                       {campaign.name || 'Campaña sin nombre'}
                                     </h4>
                                   </div>
                                   
                                   {/* Estado */}
                                   {campaign.status && (
                                     <span className={`text-xs px-2 py-1 rounded-full border whitespace-nowrap flex-shrink-0 mt-0.5 ${getCampaignStatusColor(campaign.status)}`}>
                                       {campaign.status}
                                     </span>
                                   )}
                                 </div>
                                 
                                 {/* Fila inferior: Información adicional */}
                                 {(campaign.start_date || campaign.budget) && (
                                   <div className="flex items-center gap-4 text-xs text-gray-600">
                                     {campaign.start_date && (
                                       <div className="flex items-center gap-1 whitespace-nowrap">
                                         <Calendar className="h-3 w-3 flex-shrink-0" />
                                         <span className="truncate">{formatCampaignDate(campaign.start_date)}</span>
                                       </div>
                                     )}
                                     
                                     {campaign.budget && (
                                       <div className="flex items-center gap-1 whitespace-nowrap">
                                         <DollarSign className="h-3 w-3 flex-shrink-0" />
                                         <span className="truncate">{campaign.budget.toLocaleString()}</span>
                                       </div>
                                     )}
                                   </div>
                                 )}
                               </div>
                             </div>
                           );
                         })
                       ) : (
                         <div className="text-center py-8 w-full">
                           <div className="text-gray-400 mb-2">
                             <Users className="h-12 w-12 mx-auto" />
                           </div>
                           <p className="text-gray-500">
                             {searchTerm ? 'No se encontraron campañas con ese nombre' : 'No hay campañas disponibles'}
                           </p>
                         </div>
                       )}
                     </div>
                   </>
                 ) : (
                   /* Mensajes de estado con mejor estética - SOLO EN LA COLUMNA DERECHA */
                   <div className="flex-1 flex flex-col justify-center items-center p-6">
                     
                                           {/* Estado de asignación en proceso */}
                      {isAssigning && (
                        <div className="text-center w-full max-w-md">
                          <div className="mb-6">
                            <div className="animate-spin h-16 w-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Asignando influencers...</h3>
                            <p className="text-gray-600 mb-3">Estamos procesando la asignación a {selectedCampaigns.length} campaña{selectedCampaigns.length !== 1 ? 's' : ''}:</p>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 max-h-32 overflow-y-auto">
                              {selectedCampaigns.map((campaignId) => {
                                const campaign = campaigns.find(c => c.id === campaignId);
                                return (
                                  <div key={campaignId} className="text-sm text-blue-800 font-medium text-left">
                                    • {campaign?.name || `Campaña ${campaignId}`}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}

                     {/* Mensaje de error mejorado */}
                     {assignError && (
                       <div className="w-full max-w-md">
                         <div className="bg-red-100 border-l-4 border-red-500 p-6 rounded-lg shadow-lg">
                           <div className="flex items-center mb-4">
                             <div className="flex-shrink-0">
                               <svg className="h-8 w-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                 <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                               </svg>
                             </div>
                             <div className="ml-3">
                               <h3 className="text-lg font-semibold text-red-800">Error en la asignación</h3>
                             </div>
                           </div>
                           <div className="text-red-700">
                             <p className="text-sm">{assignError}</p>
                           </div>
                         </div>
                       </div>
                     )}

                     {/* Mensaje de éxito simple mejorado */}
                     {assignSuccess && !assignmentResult && (
                       <div className="w-full max-w-md">
                         <div className="bg-green-100 border-l-4 border-green-500 p-6 rounded-lg shadow-lg">
                           <div className="flex items-center mb-4">
                             <div className="flex-shrink-0">
                               <svg className="h-8 w-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                 <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                               </svg>
                             </div>
                             <div className="ml-3">
                               <h3 className="text-lg font-semibold text-green-800">¡Asignación exitosa!</h3>
                             </div>
                           </div>
                           <div className="text-green-700">
                             <p className="text-sm">Los influencers han sido asignados correctamente a las campañas seleccionadas.</p>
                           </div>
                         </div>
                       </div>
                     )}

                     {/* Resultados detallados mejorados */}
                     {assignSuccess && assignmentResult && (
                       <div className="w-full max-w-lg space-y-4">
                         
                                                   {/* Éxitos - Fondo verde completo */}
                          {assignmentResult.successes.length > 0 && (
                            <div className="bg-green-100 border-l-4 border-green-500 p-4 rounded-lg shadow-lg">
                              <div className="flex items-center mb-3">
                                <svg className="h-6 w-6 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="font-semibold text-green-800 text-sm">
                                  ✓ Asignados correctamente ({assignmentResult.successes.length})
                                </span>
                              </div>
                              <div className="space-y-1">
                                {assignmentResult.successes.map((influencerName, index) => (
                                  <div key={index} className="text-green-700 text-sm font-medium">
                                    • {influencerName}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Ya asignados - Fondo ámbar completo */}
                          {assignmentResult.alreadyAssigned.length > 0 && (
                            <div className="bg-amber-100 border-l-4 border-amber-500 p-4 rounded-lg shadow-lg">
                              <div className="flex items-center mb-3">
                                <svg className="h-6 w-6 text-amber-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <span className="font-semibold text-amber-800 text-sm">
                                  ⚠ Ya estaban asignados ({assignmentResult.alreadyAssigned.length})
                                </span>
                              </div>
                              <div className="space-y-1">
                                {assignmentResult.alreadyAssigned.map((influencerName, index) => (
                                  <div key={index} className="text-amber-700 text-sm font-medium">
                                    • {influencerName}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Errores - Fondo rojo completo */}
                          {assignmentResult.failed.length > 0 && (
                            <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded-lg shadow-lg">
                              <div className="flex items-center mb-3">
                                <svg className="h-6 w-6 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <span className="font-semibold text-red-800 text-sm">
                                  ✗ Con errores ({assignmentResult.failed.length})
                                </span>
                              </div>
                              <div className="space-y-1">
                                {assignmentResult.failed.map((influencerName, index) => (
                                  <div key={index} className="text-red-700 text-sm font-medium">
                                    • {influencerName}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                       </div>
                     )}

                     {/* 🎯 NUEVO: Mensaje de cierre automático */}
                     {showClosingMessage && (
                       <div className="w-full max-w-md">
                         <div className="bg-blue-100 border-l-4 border-blue-500 p-6 rounded-lg shadow-lg">
                           <div className="text-blue-700">
                             <p className="text-sm">No hay influencers para asignar. El modal se cerrará automáticamente.</p>
                           </div>
                         </div>
                       </div>
                     )}
                   </div>
                 )}
              </div>
              
              {/* Mensaje de error local */}
              {localError && (
                <div className="text-red-700 text-xs mb-3 bg-red-50 border border-red-200 p-2.5 rounded-md flex items-center gap-2">
                  <svg className="h-3.5 w-3.5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {localError}
                </div>
              )}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-2 p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <button
              className={`px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 ${
                isAssigning 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={onClose}
              disabled={isAssigning}
              type="button"
            >
              {assignSuccess ? 'Cerrar' : 'Cancelar'}
            </button>
            {!assignSuccess && (
              <button
                className={`px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 flex items-center gap-1.5 ${
                  isAssigning 
                    ? 'bg-blue-400 text-white cursor-not-allowed' 
                    : selectedCampaigns.length === 0 || influencers.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
                }`}
                onClick={handleAssign}
                disabled={selectedCampaigns.length === 0 || isAssigning || influencers.length === 0}
                type="button"
              >
                {isAssigning ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Asignando...
                  </>
                ) : (
                  <>
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {influencers.length === 0 
                      ? 'Sin influencers' 
                      : `Asignar a ${selectedCampaigns.length} campaña${selectedCampaigns.length !== 1 ? 's' : ''}`
                    }
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}