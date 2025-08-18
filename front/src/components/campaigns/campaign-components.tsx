import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Users, FileText, TrendingUp } from "lucide-react";
import { EMPTY_STATE_METRICS } from '@/constants/campaign';
import { formatDateRange, formatBudget, getStatusBadgeColor, formatStatus } from '@/utils/campaign';
import { useMemo, memo } from 'react';
import { useOptionalCampaignContext } from '@/contexts/CampaignContext';

// 🎯 FUNCIÓN UNIFICADA: SIEMPRE usar valor calculado (ignorar backend completamente)
const calculateEngagementLikeCampaignMetricsCards = (backendEngagement: number | undefined, calculatedEngagement: number | undefined): number => {
  const backend = backendEngagement || 0;
  const calculated = calculatedEngagement || 0;
  
  // ⚠️ FORZAR: Siempre usar el valor calculado, ignorar el backend
  const result = calculated;
  console.log("🔍 [UnifiedEngagement] Backend:", backend, "Calculated:", calculated, "Final:", result, "(backend ignored)");
  return result;
};

// Componentes auxiliares para campañas



export const CampaignAvatar = ({ name }: { name: string }) => (
  <Avatar className="h-12 w-12 rounded-md border border-gray-300 shadow-sm">
    <AvatarFallback className="rounded-md bg-purple-100 text-purple-700 font-semibold">
      {name.substring(0, 2).toUpperCase()}
    </AvatarFallback>
  </Avatar>
);

export const CampaignStatus = ({ status }: { status: string }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${getStatusBadgeColor(status)}`}>
    {formatStatus(status)}
  </span>
);

// Componente original con métricas estáticas
export const CampaignMetrics = ({ startDate, endDate }: { startDate: string; endDate: string }) => (
  <div className="flex items-center gap-8 text-sm text-gray-500">
    <div className="flex items-center gap-1 w-[240px]">
      <Calendar className="h-4 w-4 flex-shrink-0" />
      <span>{formatDateRange(startDate, endDate)}</span>
    </div>
    <div className="flex items-center gap-1 w-[120px]">
      <Users className="h-4 w-4 flex-shrink-0" />
      <span>{EMPTY_STATE_METRICS.influencers} influencers</span>
    </div>
    <div className="flex items-center gap-1 w-[80px]">
      <FileText className="h-4 w-4 flex-shrink-0" />
      <span>{EMPTY_STATE_METRICS.posts} posts</span>
    </div>
  </div>
);

// Optimización: Cache global mejorado con TTL y manejo de errores
const metricsCache = new Map<string, {
  data: { influencers: number; posts: number; engagement: number };
  timestamp: number;
  loading: boolean;
  error?: string;
}>();

const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

// Optimización: Pool de requests en progreso para evitar duplicados
const pendingRequests = new Map<string, Promise<any>>();

// Funciones utility para gestionar el cache
export const clearCampaignMetricsCache = (campaignId?: string) => {
  if (campaignId) {
    metricsCache.delete(campaignId);
    pendingRequests.delete(campaignId);
  } else {
    metricsCache.clear();
    pendingRequests.clear();
  }
};

export const getCampaignMetricsCacheStats = () => {
  return {
    size: metricsCache.size,
    campaigns: Array.from(metricsCache.keys()),
    pendingRequests: Array.from(pendingRequests.keys()),
    details: Array.from(metricsCache.entries()).map(([id, data]) => ({
      campaignId: id,
      loading: data.loading,
      error: data.error,
      age: Date.now() - data.timestamp,
      expired: Date.now() - data.timestamp > CACHE_TTL
    }))
  };
};

// Funciones de debug para consola del navegador
declare global {
  interface Window {
    debugCampaignMetrics: () => void;
    clearCampaignCache: (campaignId?: string) => void;
  }
}

// 🚀 OPTIMIZACIÓN: Exponer funciones de debug mejoradas
if (typeof window !== 'undefined') {
  window.debugCampaignMetrics = () => {
    const stats = getCampaignMetricsCacheStats();
    console.table(stats.details);
    if (stats.pendingRequests.length > 0) {
      console.warn('⚠️ Pending requests detected:', stats.pendingRequests);
    }
  };

  window.clearCampaignCache = clearCampaignMetricsCache;
  
  // 🚀 Nueva función de debug para detectar peticiones innecesarias
  (window as any).debugCampaignOptimization = () => {
  
    
    const pendingCount = Array.from(pendingRequests.keys()).length;
    if (pendingCount > 0) {
      console.warn(`⚠️ ${pendingCount} unnecessary requests detected!`);
      console.warn('Campaigns making individual requests:', Array.from(pendingRequests.keys()));
    } else {
    }
  };
}

// 🚀 OPTIMIZACIÓN CRÍTICA: CampaignRealMetrics SIN duplicación de peticiones
const CampaignRealMetricsComponent = ({ 
  campaignId,
  startDate, 
  endDate,
  influencersCount,
  postsCount,
  avgEngagementRate
}: { 
  campaignId: string; 
  startDate: string; 
  endDate: string;
  influencersCount?: number;
  postsCount?: number;
  avgEngagementRate?: number;
}) => {
  // 🎯 HOOK CRÍTICO: Siempre llamar el hook de forma incondicional (React rules)
  const contextData = useOptionalCampaignContext();

  // 🚀 OPTIMIZACIÓN CRÍTICA: Si tenemos datos pre-calculados, usarlos directamente
  const hasPreCalculatedData = influencersCount !== undefined && 
                               postsCount !== undefined && 
                               avgEngagementRate !== undefined;

  // 🚀 CALCULAR MÉTRICAS: Prioridad: pre-calculated > contexto > loading
  const metrics = useMemo(() => {
    // 1. Si hay datos pre-calculados, calcular engagement desde contexto si está disponible
    if (hasPreCalculatedData) {
      // Calcular engagement desde contexto opcional (como CampaignMetricsCards)
      let contextCalculatedEngagement = 0;
      if (contextData && !contextData.loading && contextData.posts?.length > 0) {
        const validRates = contextData.posts
          .map(post => {
            const rate = post.post_metrics?.engagement_rate;
            if (rate && typeof rate === 'number' && rate > 0) {
              return rate < 1 ? rate * 100 : rate;
            }
            
            const likes = post.post_metrics?.likes_count || 0;
            const comments = post.post_metrics?.comments_count || 0;
            const views = post.post_metrics?.views_count || 0;
            
            if (views > 0 && (likes > 0 || comments > 0)) {
              const calculated = ((likes + comments) / views) * 100;
              return calculated <= 100 ? calculated : 0;
            }
            
            return 0;
          })
          .filter(rate => rate > 0);

        if (validRates.length > 0) {
          contextCalculatedEngagement = validRates.reduce((sum, rate) => sum + rate, 0) / validRates.length;
        }
      }
      
      // 🎯 USAR función unificada - SIEMPRE ignorar backend, usar solo calculado
      const finalEngagement = calculateEngagementLikeCampaignMetricsCards(avgEngagementRate, contextCalculatedEngagement);
      
      console.log("🔍 [CampaignRealMetrics] Campaign:", campaignId, "Final engagement:", finalEngagement, "Source: pre-calculated with context calc");
      return {
        influencers: influencersCount!,
        posts: postsCount!,
        engagement: finalEngagement,
        loading: false,
        source: 'pre-calculated'
      };
    }

    // 2. Si tenemos contexto con datos, calcular desde ahí
    if (!hasPreCalculatedData && contextData && !contextData.loading) {
      const contextInfluencers = contextData.influencers?.length || 0;
      const contextPosts = contextData.posts?.length || 0;
      
      // Calcular engagement promedio desde posts del contexto
      let calculatedEngagement = 0;
      if (contextData.posts?.length > 0) {
        const validRates = contextData.posts
          .map(post => {
            const rate = post.post_metrics?.engagement_rate;
            if (rate && typeof rate === 'number' && rate > 0) {
              return rate < 1 ? rate * 100 : rate;
            }
            
            const likes = post.post_metrics?.likes_count || 0;
            const comments = post.post_metrics?.comments_count || 0;
            const views = post.post_metrics?.views_count || 0;
            
            if (views > 0 && (likes > 0 || comments > 0)) {
              const calculated = ((likes + comments) / views) * 100;
              return calculated <= 100 ? calculated : 0;
            }
            
            return 0;
          })
          .filter(rate => rate > 0);

        if (validRates.length > 0) {
          calculatedEngagement = validRates.reduce((sum, rate) => sum + rate, 0) / validRates.length;
        }
      }

      // Usar EXACTAMENTE la misma función que CampaignMetricsCards también para el contexto
      const finalEngagement = calculateEngagementLikeCampaignMetricsCards(avgEngagementRate, Math.round(calculatedEngagement * 100) / 100);
      
      return {
        influencers: contextInfluencers,
        posts: contextPosts,
        engagement: finalEngagement,
        loading: false,
        source: 'context'
      };
    }

    // 3. Si el contexto está cargando, mostrar loading
    if (!hasPreCalculatedData && contextData?.loading) {
      return {
        influencers: 0,
        posts: 0,
        engagement: 0,
        loading: true,
        source: 'context-loading'
      };
    }

    // 4. Fallback: datos vacíos (no hacer fetch para evitar duplicación)
    return {
      influencers: 0,
      posts: 0,
      engagement: 0,
      loading: false,
      source: 'fallback'
    };
  }, [
    hasPreCalculatedData, 
    influencersCount, 
    postsCount, 
    avgEngagementRate,
    contextData
  ]);

    // 🎯 RENDERIZADO UNIFICADO: Sin duplicación de lógica
  return (
    <div className="flex items-center gap-8 text-sm text-gray-500">
      <div className="flex items-center gap-1 w-[240px]">
        <Calendar className="h-4 w-4 flex-shrink-0" />
        <span>{formatDateRange(startDate, endDate)}</span>
      </div>
      <div className="flex items-center gap-1 w-[120px]">
        <Users className="h-4 w-4 flex-shrink-0" />
        <span>
          {metrics.loading ? '...' : metrics.influencers} influencer{metrics.influencers !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="flex items-center gap-1 w-[80px]">
        <FileText className="h-4 w-4 flex-shrink-0" />
        <span>
          {metrics.loading ? '...' : metrics.posts} post{metrics.posts !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
};

// Optimización: Memoización con comparación específica
export const CampaignRealMetrics = memo(CampaignRealMetricsComponent, (prevProps, nextProps) => {
  return (
    prevProps.campaignId === nextProps.campaignId &&
    prevProps.startDate === nextProps.startDate &&
    prevProps.endDate === nextProps.endDate &&
    prevProps.influencersCount === nextProps.influencersCount &&
    prevProps.postsCount === nextProps.postsCount &&
    prevProps.avgEngagementRate === nextProps.avgEngagementRate
  );
});

export const CampaignBudgetAndProgress = ({ budget, currency }: { budget: number; currency: string }) => (
  <div className="text-right min-w-[140px]">
    <div>
      <div className="text-sm font-bold text-gray-900">
        {formatBudget(budget, currency)}
      </div>
      <div className="text-xs text-gray-500">Presupuesto</div>
    </div>
  </div>
);