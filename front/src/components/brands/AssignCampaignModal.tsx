"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, Target, Users, Plus, Loader2, Building2, Search } from 'lucide-react';
import { brandService } from '@/lib/services/brands';
import { useCampaigns } from '@/hooks/campaign/useCampaigns';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/common/useToast';

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

interface AssignCampaignModalProps {
  brandId: string;
  brandName: string;
  onCampaignAssigned?: () => void;
}

export const AssignCampaignModal: React.FC<AssignCampaignModalProps> = ({
  brandId,
  brandName,
  onCampaignAssigned
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [availableCampaigns, setAvailableCampaigns] = useState<any[]>([]);
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [role, setRole] = useState('sponsor');
  const [searchQuery, setSearchQuery] = useState('');
  const { getCampaigns } = useCampaigns();
  const { showToast } = useToast();

  // Obtener campañas disponibles cuando se abre el modal
  useEffect(() => {
    if (open) {
      fetchAvailableCampaigns();
      setSelectedCampaigns([]);
      setAssignError(null);
    }
  }, [open]);

  const fetchAvailableCampaigns = async () => {
    try {
      setLoading(true);
      const [allCampaigns, assignedCampaigns] = await Promise.all([
        getCampaigns(),
        brandService.getBrandCampaigns(brandId)
      ]);
      
      // Extraer IDs de campañas ya asignadas, manejando diferentes estructuras de respuesta
      const assignedCampaignIds = assignedCampaigns.map(bc => 
        bc.campaign_id || bc.campaigns?.id || bc.id
      ).filter(Boolean);
      
      console.log('Campañas asignadas:', assignedCampaignIds);
      console.log('Todas las campañas:', allCampaigns.length);
      
      const availableCampaigns = allCampaigns.filter(campaign => 
        !assignedCampaignIds.includes(campaign.id)
      );
      
      console.log('Campañas disponibles:', availableCampaigns.length);
      
      setAvailableCampaigns(availableCampaigns);
    } catch (error) {
      console.error('Error fetching available campaigns:', error);
      setAssignError('Error al cargar las campañas disponibles. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Función para toggle de selección de campaña
  const handleToggleCampaign = (campaignId: string) => {
    setSelectedCampaigns(prev => {
      if (prev.includes(campaignId)) {
        return prev.filter(id => id !== campaignId);
      } else {
        return [...prev, campaignId];
      }
    });
  };

  const handleAssignCampaigns = async () => {
    if (selectedCampaigns.length === 0) {
      setAssignError('Selecciona al menos una campaña');
      return;
    }

    try {
      setAssigning(true);
      setAssignError(null);
      
      // Verificar que las campañas seleccionadas aún estén disponibles
      const campaignsToAssign = selectedCampaigns.filter(campaignId => 
        availableCampaigns.some(c => c.id === campaignId)
      );
      
      if (campaignsToAssign.length === 0) {
        setAssignError('Las campañas seleccionadas ya no están disponibles. Por favor, recarga la lista.');
        return;
      }
      
      // Asignar campañas una por una para manejar errores individuales
      const results = [];
      const errors = [];
      
      for (const campaignId of campaignsToAssign) {
        try {
          const campaign = availableCampaigns.find(c => c.id === campaignId);
          const result = await brandService.assignCampaignToBrand(brandId, campaignId, {
            role: role,
            budget_allocated: campaign?.budget || null,
            currency: campaign?.currency || 'USD',
            status: 'active'
          });
          results.push(result);
        } catch (error: any) {
          console.error(`Error assigning campaign ${campaignId}:`, error);
          const campaignName = availableCampaigns.find(c => c.id === campaignId)?.name || campaignId;
          
          if (error.response?.data?.code === '23505') {
            errors.push(`La campaña "${campaignName}" ya está asignada a esta marca.`);
          } else {
            errors.push(`Error al asignar "${campaignName}": ${error.response?.data?.message || error.message}`);
          }
        }
      }
      
      // Mostrar resultados
      if (results.length > 0) {
        // Remover las campañas asignadas exitosamente de la lista
        const successfulIds = results.map(r => r.campaign_id || r.id);
        setAvailableCampaigns(prev => prev.filter(c => !successfulIds.includes(c.id)));
        setSelectedCampaigns([]);
        
        // Mostrar toast de éxito
        showToast({
          title: "¡Asignación parcialmente exitosa!",
          description: `${results.length} de ${campaignsToAssign.length} campañas asignadas correctamente.`,
          status: "success",
        });
        
        // Cerrar modal si todas fueron exitosas
        if (results.length === campaignsToAssign.length) {
          setOpen(false);
          if (onCampaignAssigned) {
            onCampaignAssigned();
          }
        }
      }
      
      // Mostrar errores si los hay
      if (errors.length > 0) {
        setAssignError(errors.join('\n'));
      }
      
    } catch (error: any) {
      console.error('Error assigning campaigns:', error);
      setAssignError('Error al asignar las campañas. Inténtalo de nuevo.');
    } finally {
      setAssigning(false);
    }
  };

  const getCampaignStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'activa':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'draft':
      case 'borrador':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'paused':
      case 'pausada':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
      case 'completada':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCampaignDate = (dateString: string) => {
    if (!dateString) return 'Sin fecha';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'short',
      year: 'numeric'
    });
  };

  // Filtrar campañas basado en la búsqueda
  const filteredCampaigns = availableCampaigns.filter((campaign) => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    const campaignName = campaign.name?.toLowerCase() || '';
    const campaignStatus = campaign.status?.toLowerCase() || '';
    
    return campaignName.includes(query) || campaignStatus.includes(query);
  });

  return (
    <>
             {/* Trigger Button - siempre visible */}
       <button
         onClick={() => setOpen(true)}
         className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-all duration-200"
       >
         <Plus className="h-4 w-4" />
         Asignar Campaña
       </button>

      {/* MODAL - solo cuando está abierto */}
      {open && (
        <>
          {/* OVERLAY PERSONALIZADO CON MENOR OPACIDAD */}
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60]" 
            onClick={() => setOpen(false)}
          />
      
      {/* MODAL CONTENT */}
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div 
          className="max-w-4xl w-full max-h-[90vh] bg-white shadow-2xl border-0 rounded-lg animate-in fade-in-0 zoom-in-95 duration-200 flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* HEADER MEJORADO */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Asignar campaña a {brandName}
              </h2>
              <p className="text-blue-100 mt-1 text-sm">
                Selecciona una campaña disponible para asignarla a esta marca.
                {availableCampaigns.length > 0 && (
                  <span className="font-medium"> • {availableCampaigns.length} campaña{availableCampaigns.length !== 1 ? 's' : ''} disponible{availableCampaigns.length !== 1 ? 's' : ''}.</span>
                )}
              </p>
            </div>
          </div>

                     {/* CONTENIDO */}
           <div className="p-6 flex-1 overflow-y-auto">
            {/* Campos de configuración */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Configuración de Asignación</h3>
              

              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 {/* Rol */}
                 <div className="space-y-2 relative">
                  <Label htmlFor="role" className="text-xs font-medium text-gray-700">Rol de la Marca</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger className="h-9 w-full border-gray-200 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                                         <SelectContent className="z-[80]">
                      <SelectItem value="sponsor">Sponsor</SelectItem>
                      <SelectItem value="partner">Partner</SelectItem>
                      <SelectItem value="collaborator">Colaborador</SelectItem>
                      <SelectItem value="client">Cliente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-800 mb-3">
                Seleccionar Campañas ({selectedCampaigns.length}/{filteredCampaigns.length})
              </label>
              
              {/* Barra de búsqueda */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar campañas..."
                    className="pl-10 pr-4 h-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              {/* LISTA DE CAMPAÑAS */}
              <div className="space-y-3">
                {loading ? (
                  <div className="text-center py-12 w-full">
                    <div className="text-gray-400 mb-2">
                      <svg className="animate-spin h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                    <p className="text-gray-500">Cargando campañas disponibles...</p>
                  </div>
                                 ) : filteredCampaigns.length > 0 ? (
                   filteredCampaigns.map((campaign) => {
                     const isSelected = selectedCampaigns.includes(campaign.id);
                     return (
                       <div
                         key={campaign.id}
                         onClick={() => handleToggleCampaign(campaign.id)}
                         className={`
                           relative p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md w-full
                           ${isSelected 
                             ? 'border-blue-500 bg-blue-50 shadow-lg' 
                             : 'border-gray-200 bg-white hover:border-gray-300'
                           }
                         `}
                       >
                         {/* INDICADOR DE SELECCIÓN */}
                         {isSelected && (
                           <div className="absolute top-2 right-2 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                             <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                             </svg>
                           </div>
                         )}
                         
                         {/* CONTENIDO DE LA CARD MEJORADO */}
                         <div className="flex items-start gap-3 pr-6">
                           {/* Nombre de la campaña */}
                           <div className="min-w-0 flex-1">
                             <h4 
                               className={`font-semibold text-base leading-snug ${isSelected ? 'text-blue-900' : 'text-gray-900'} mb-1`}
                               style={lineClampStyles.lineClamp2}
                             >
                               {campaign.name || 'Campaña sin nombre'}
                             </h4>
                             
                             {/* Información adicional */}
                             <div className="flex items-center gap-4 text-xs text-gray-600">
                               {/* Presupuesto */}
                               {campaign.budget && (
                                 <div className="flex items-center gap-1">
                                   <DollarSign className="h-3 w-3" />
                                   <span className="font-medium">
                                     ${Number(campaign.budget).toLocaleString()} {campaign.currency}
                                   </span>
                                 </div>
                               )}
                               
                               {/* Fechas */}
                               {campaign.start_date && campaign.end_date && (
                                 <div className="flex items-center gap-1">
                                   <Calendar className="h-3 w-3" />
                                   <span>
                                     {formatCampaignDate(campaign.start_date)} - {formatCampaignDate(campaign.end_date)}
                                   </span>
                                 </div>
                               )}
                               
                               {/* Estado */}
                               {campaign.status && (
                                 <div className="flex items-center gap-1">
                                   <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCampaignStatusColor(campaign.status)}`}>
                                     {campaign.status}
                                   </span>
                                 </div>
                               )}
                             </div>
                           </div>
                         </div>
                                                </div>
                       );
                     })
                 ) : searchQuery.trim() ? (
                  <div className="text-center py-12 w-full">
                    <div className="text-gray-400 mb-2">
                      <Search className="h-12 w-12 mx-auto" />
                    </div>
                    <p className="text-lg font-medium text-gray-700 mb-2">No se encontraron campañas</p>
                    <p className="text-sm text-gray-500">No hay campañas que coincidan con "{searchQuery}"</p>
                  </div>
                ) : (
                  <div className="text-center py-12 w-full">
                    <div className="text-gray-400 mb-2">
                      <Target className="h-12 w-12 mx-auto" />
                    </div>
                    <p className="text-lg font-medium text-gray-700 mb-2">No hay campañas disponibles</p>
                    <p className="text-sm text-gray-500">Todas las campañas ya están asignadas a marcas</p>
                  </div>
                )}
              </div>
            </div>
            
                         {/* MENSAJES DE ESTADO */}
             {assignError && (
               <div className="text-red-700 text-sm mb-3 bg-red-50 border border-red-200 p-3 rounded-md">
                 <div className="flex items-center gap-2 mb-2">
                   <svg className="h-4 w-4 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                     <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                   </svg>
                   <span className="font-medium">Error</span>
                 </div>
                 <div className="whitespace-pre-line text-sm">{assignError}</div>
                 {assignError.includes('recarga') && (
                   <button
                     onClick={fetchAvailableCampaigns}
                     className="mt-2 text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded transition-colors"
                   >
                     Recargar campañas
                   </button>
                 )}
               </div>
             )}
            
            
          </div>

                     {/* BOTONES DE ACCIÓN */}
           <div className="flex justify-end gap-2 p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                           <button
                className={`px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 ${
                  assigning 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                                 onClick={() => setOpen(false)}
                 disabled={assigning}
                 type="button"
               >
                 Cancelar
               </button>
                <button
                  className={`px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 flex items-center gap-1.5 ${
                    assigning 
                      ? 'bg-blue-400 text-white cursor-not-allowed' 
                      : selectedCampaigns.length === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                  onClick={handleAssignCampaigns}
                  disabled={selectedCampaigns.length === 0 || assigning}
                  type="button"
                >
                  {assigning ? (
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
                     Asignar {selectedCampaigns.length} campaña{selectedCampaigns.length !== 1 ? 's' : ''}
                   </>
                 )}
               </button>
           </div>
         </div>
       </div>
       </>
     )}
   </>
 );
}; 