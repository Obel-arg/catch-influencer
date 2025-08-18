"use client";

import { Campaign } from '@/types/campaign';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Edit, Trash2, Loader2 } from "lucide-react";
import { Loader } from "@/components/ui/loader";
import { useState, useCallback, memo, lazy, Suspense, useEffect } from 'react';
import { 
  CampaignAvatar, 
  CampaignStatus, 
  CampaignRealMetrics, 
  CampaignBudgetAndProgress 
} from './campaign-components';
import { useRoleCache } from '@/hooks/auth/useRoleCache';

// Lazy loading de modals para reducir bundle size inicial
const EditCampaignModal = lazy(() => import('./modals/EditCampaignModal').then(m => ({ default: m.EditCampaignModal })));
const DeleteCampaignModal = lazy(() => import('./modals/DeleteCampaignModal').then(m => ({ default: m.DeleteCampaignModal })));

// 🚀 DEBUGGING: Detectar entorno de desarrollo
const isDevelopment = process.env.NODE_ENV === 'development';

// 🚀 DEBUGGING: Script de diagnóstico avanzado
if (isDevelopment && typeof window !== 'undefined') {
  (window as any).debugNavigation = (campaignId?: string) => {
    
    const testCampaignId = campaignId || '8615f92e-cfb0-4a10-9dfb-26fea655e0d3';
    const testUrl = `/campaigns/${testCampaignId}`;
    
    
    // Test 1: Performance timing
    console.time('Navigation Test');
    
    // Test 2: Try navigation
    try {
      window.location.href = testUrl;
    } catch (error) {
      console.error('🚀 [DEBUG] Navigation failed:', error);
    }
    
    setTimeout(() => {
      console.timeEnd('Navigation Test');
    }, 1000);
  };
  
}

interface CampaignsListProps {
  campaigns: Campaign[];
  loading: boolean;
  onCampaignUpdated?: () => void;
  onCampaignUpdatedOptimistic?: (id: string, data: any) => void;
  onCampaignDeletedOptimistic?: (id: string) => void;
}

const CampaignsListComponent = ({ campaigns, loading, onCampaignUpdated, onCampaignUpdatedOptimistic, onCampaignDeletedOptimistic }: CampaignsListProps) => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Optimización: Memoizar callbacks con dependencias estables
  const handleEditCampaign = useCallback((campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setEditModalOpen(true);
  }, []);

  const handleDeleteCampaign = useCallback((campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setDeleteModalOpen(true);
  }, []);

  const handleCampaignUpdated = useCallback(() => {
    onCampaignUpdated?.();
  }, [onCampaignUpdated]);

  const handleCampaignDeleted = useCallback(() => {
    onCampaignUpdated?.();
  }, [onCampaignUpdated]);

  const handleEditModalClose = useCallback(() => {
    setEditModalOpen(false);
    setSelectedCampaign(null);
  }, []);

  const handleDeleteModalClose = useCallback(() => {
    setDeleteModalOpen(false);
    setSelectedCampaign(null);
  }, []);

  // Marcar que ya hubo al menos una carga
  useEffect(() => {
    if (!loading) {
      setIsFirstLoad(false);
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="col-span-full">
        <div className="flex flex-col items-center justify-center pt-24 pb-16 space-y-4">
          <Loader 
            variant="primary"
            size="lg"
          />
          <div className="text-center space-y-2">
            <p className="text-lg font-medium text-gray-900">Cargando campañas</p>
            <p className="text-sm text-gray-500">Obteniendo la información más reciente...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!campaigns.length && !isFirstLoad) {
    return (
      <div className="col-span-full">
        <div className="flex flex-col items-center justify-center pt-24 pb-16">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">No hay campañas disponibles</h3>
              <p className="text-gray-500 mt-1">Comienza creando tu primera campaña usando el botón "Nueva Campaña"</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="col-span-full">
      <div className="divide-y divide-gray-200">
        {campaigns.map((campaign) => (
          <CampaignListItem
            key={campaign.id}
            campaign={campaign}
            onEdit={handleEditCampaign}
            onDelete={handleDeleteCampaign}
          />
        ))}
      </div>
      
      {/* Suspense para lazy loading de modals */}
      <Suspense fallback={null}>
        {editModalOpen && (
          <EditCampaignModal
            open={editModalOpen}
            onOpenChange={handleEditModalClose}
            campaign={selectedCampaign}
            onUpdated={() => {
              handleCampaignUpdated();
              if (onCampaignUpdatedOptimistic && selectedCampaign) {
                onCampaignUpdatedOptimistic(selectedCampaign.id, selectedCampaign);
              }
            }}
          />
        )}

        {deleteModalOpen && (
          <DeleteCampaignModal
            open={deleteModalOpen}
            onOpenChange={handleDeleteModalClose}
            campaign={selectedCampaign}
            onDeleted={() => {
              handleCampaignDeleted();
              if (onCampaignDeletedOptimistic && selectedCampaign) {
                onCampaignDeletedOptimistic(selectedCampaign.id);
              }
            }}
          />
        )}
      </Suspense>
    </div>
  );
};

// Optimización: Memoizar con React.memo y comparación profunda para campaign
const CampaignListItemComponent = ({ 
  campaign, 
  onEdit, 
  onDelete 
}: { 
  campaign: Campaign; 
  onEdit: (campaign: Campaign) => void; 
  onDelete: (campaign: Campaign) => void; 
}) => {
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationStatus, setNavigationStatus] = useState('');
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const { isViewer, loading: roleLoading, isRoleCached } = useRoleCache();

  // Optimización: Memoizar handlers con useCallback para evitar re-renders
  const handleEdit = useCallback(() => {
    onEdit(campaign);
  }, [campaign, onEdit]); // Incluir campaign completo

  const handleDelete = useCallback(() => {
    onDelete(campaign);
  }, [campaign, onDelete]); // Incluir campaign completo

  // 🚀 OPTIMIZACIÓN CRÍTICA: Navegación que NO triggea Fast Refresh
  const handleNavigateToCampaign = useCallback(async () => {
    // 🚀 DEBUGGING ESPECÍFICO DE DESARROLLO
    if (isDevelopment) {
      setShowDebugInfo(true);
    }
    
    // 🎯 FEEDBACK INSTANTÁNEO: Mostrar loading brevemente
    setIsNavigating(true);
    setNavigationStatus('🚀 Iniciando...');
    
    const targetPath = `/campaigns/${campaign.id}`;
    const fullUrl = `${window.location.origin}${targetPath}`;
    
    try {
      setNavigationStatus('⚡ Navegación directa...');
      
      // 🎯 NAVEGACIÓN INSTANTÁNEA: Sin delays que permitan Fast Refresh
      window.location.replace(fullUrl);
      
      // 🚀 NO VERIFICACIÓN: Para evitar triggear más Fast Refresh
      setIsNavigating(false);
      setNavigationStatus('✅ Navegado');
      
      // Limpiar debug info rápidamente
      setTimeout(() => {
        setShowDebugInfo(false);
      }, 1000);
      
    } catch (error) {
      console.error('❌ [Navigation] Fast Refresh bypass failed:', error);
      setNavigationStatus('❌ Error - usando fallback');
      
      // 🚀 FALLBACK: Si falla, usar navegación normal
      try {
        window.location.href = fullUrl;
      } catch (fallbackError) {
        console.error('❌ [Fallback] Standard navigation also failed:', fallbackError);
        
        if (isDevelopment) {
          alert(`Navigation failed completely. Please manually navigate to: ${fullUrl}`);
        }
      }
      
      setTimeout(() => {
        setIsNavigating(false);
        setNavigationStatus('');
        setShowDebugInfo(false);
      }, 2000);
    }
  }, [campaign.id]);

  // 🚀 CLEANUP: Reset navigation state on unmount SOLAMENTE
  useEffect(() => {
    return () => {
      setIsNavigating(false);
      setNavigationStatus('');
      setShowDebugInfo(false);
    };
  }, []);

  return (
    <div className="flex items-center gap-4 px-4 py-4 relative">
      
      
      <CampaignAvatar name={campaign.name} />

      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
          <CampaignStatus status={campaign.status} />
        </div>
        
        {/* 🚀 OPTIMIZACIÓN CRÍTICA: Pasar datos pre-calculados del backend optimizado */}
        <CampaignRealMetrics 
          campaignId={campaign.id}
          startDate={campaign.start_date} 
          endDate={campaign.end_date}
          influencersCount={campaign.influencers_count}
          postsCount={campaign.posts_count}
          avgEngagementRate={campaign.avg_engagement_rate}
        />
      </div>

      <CampaignBudgetAndProgress 
        budget={campaign.budget} 
        currency={campaign.currency} 
      />

      <div className="flex items-center gap-2">
        {/* Solo mostrar botones de editar y eliminar si NO es viewer */}
        {(!roleLoading && isRoleCached() && !isViewer()) && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="text-blue-500 hover:text-blue-700 hover:bg-blue-100"
              onClick={handleEdit}
            >
              <Edit className="h-4 w-4" />
              <span className="sr-only">Editar campaña</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="text-red-500 hover:text-red-700 hover:bg-red-100"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Eliminar campaña</span>
            </Button>
          </>
        )}

        {/* 🚀 NAVEGACIÓN SIMPLE Y DIRECTA: Un solo botón optimizado */}
        <Button
          variant="ghost"
          size="icon"
          className={`text-purple-500 hover:text-purple-700 hover:bg-purple-100 relative transition-all duration-200 ${
            isNavigating ? 'bg-purple-100 scale-95' : ''
          }`}
          onClick={handleNavigateToCampaign}
          disabled={isNavigating}
        >
          {isNavigating ? (
            <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
          ) : (
            <ExternalLink className="h-4 w-4" />
          )}
          
        </Button>
      </div>
    </div>
  );
};

// Optimización: Memoización con comparación de props específicas
const CampaignListItem = memo(CampaignListItemComponent, (prevProps, nextProps) => {
  // Solo re-renderizar si cambian las propiedades críticas de la campaña
  return (
    prevProps.campaign.id === nextProps.campaign.id &&
    prevProps.campaign.name === nextProps.campaign.name &&
    prevProps.campaign.status === nextProps.campaign.status &&
    prevProps.campaign.budget === nextProps.campaign.budget &&
    prevProps.campaign.start_date === nextProps.campaign.start_date &&
    prevProps.campaign.end_date === nextProps.campaign.end_date &&
    prevProps.onEdit === nextProps.onEdit &&
    prevProps.onDelete === nextProps.onDelete
  );
});

export const CampaignsList = memo(CampaignsListComponent); 