import { CAMPAIGN_STATUS_COLORS, CAMPAIGN_STATUS_LABELS, type CampaignStatusKey } from '@/constants/campaign';

// Utilidades de normalización
export const normalizeStatus = (status: string): string => {
  return status?.toLowerCase().trim() || '';
};

// Utilidades de formateo
export const formatDateRange = (startDate: string, endDate: string): string => {
  const formatOptions: Intl.DateTimeFormatOptions = { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  };
  
  // Crear fechas locales para evitar problemas de zona horaria
  const createLocalDate = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day); // month - 1 porque Date usa 0-indexado para meses
  };
  
  const start = createLocalDate(startDate).toLocaleDateString('es-ES', formatOptions);
  const end = createLocalDate(endDate).toLocaleDateString('es-ES', formatOptions);
  
  return `${start} - ${end}`;
};

export const formatBudget = (budget: number, currency: string): string => {
  return `$ ${budget.toLocaleString()} ${currency}`;
};

// Utilidades de estado
export const getStatusBadgeColor = (status: string): string => {
  if (!status) return CAMPAIGN_STATUS_COLORS.default;
  
  const normalizedStatus = normalizeStatus(status);
  
  // Mapear estados en inglés y español
  const statusMap: Record<string, CampaignStatusKey> = {
    'active': 'active',
    'activa': 'active',
    'planned': 'planned', 
    'planificada': 'planned',
    'completed': 'completed',
    'completada': 'completed',
    'paused': 'paused',
    'pausada': 'paused',
    'draft': 'draft',
    'borrador': 'draft'
  };
  
  const mappedStatus = statusMap[normalizedStatus];
  return CAMPAIGN_STATUS_COLORS[mappedStatus] || CAMPAIGN_STATUS_COLORS.default;
};

export const formatStatus = (status: string): string => {
  if (!status) return 'Sin estado';
  
  const normalizedStatus = normalizeStatus(status);
  
  // Mapear estados a sus etiquetas en español
  const statusMap: Record<string, keyof typeof CAMPAIGN_STATUS_LABELS> = {
    'active': 'active',
    'planned': 'planned',
    'completed': 'completed', 
    'paused': 'paused',
    'draft': 'draft',
    'borrador': 'draft'
  };
  
  const mappedStatus = statusMap[normalizedStatus];
  return CAMPAIGN_STATUS_LABELS[mappedStatus] || 
         status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}; 