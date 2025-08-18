import { useInfluencersContext } from '@/contexts/InfluencersContext';

/**
 * Hook legacy que actúa como wrapper del contexto InfluencersContext
 * Mantiene la compatibilidad hacia atrás para componentes existentes
 */
export const useInfluencers = () => {
  return useInfluencersContext();
}; 