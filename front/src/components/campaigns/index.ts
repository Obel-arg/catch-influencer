// Optimización: Exportaciones principales con lazy loading
export { CampaignsList } from './campaigns-list';
export { CampaignsView } from './CampaignsView';
export { 
  CampaignAvatar, 
  CampaignStatus, 
  CampaignMetrics,
  CampaignRealMetrics,
  CampaignBudgetAndProgress,
  clearCampaignMetricsCache,
  getCampaignMetricsCacheStats
} from './campaign-components';

// Lazy loading de modals pesados para mejor rendimiento inicial
export const EditCampaignModal = lazy(() => 
  import('./modals/EditCampaignModal').then(m => ({ default: m.EditCampaignModal }))
);

export const CreateCampaignModal = lazy(() => 
  import('./modals/CreateCampaignModal').then(m => ({ default: m.CreateCampaignModal }))
);

export const DeleteCampaignModal = lazy(() => 
  import('./modals/DeleteCampaignModal').then(m => ({ default: m.DeleteCampaignModal }))
);

export const AddPostModal = lazy(() => 
  import('./modals/AddPostModal').then(m => ({ default: m.AddPostModal }))
);

// Utilidades de cache para debugging y optimización
if (typeof window !== 'undefined') {
  // Funciones globales de debug para desarrollo
  (window as any).__campaignOptimization = {
    clearCache: clearCampaignMetricsCache,
    getCacheStats: getCampaignMetricsCacheStats,
    version: '2.0.0'
  };
}

import { lazy } from 'react';
import { clearCampaignMetricsCache, getCampaignMetricsCacheStats } from './campaign-components'; 