import { Card, CardContent } from "@/components/ui/card";
import { Campaign } from "@/types/campaign";
import { formatDateRange } from "@/utils/campaign";

interface CampaignProgressSectionProps {
  campaign: Campaign;
}

export const CampaignProgressSection = ({ campaign }: CampaignProgressSectionProps) => {
  // Calcular el progreso basado en las fechas
  const calculateProgress = () => {
    // Parsear las fechas como locales para evitar problemas de zona horaria
    const [startYear, startMonth, startDay] = campaign.start_date.split('-').map(Number);
    const [endYear, endMonth, endDay] = campaign.end_date.split('-').map(Number);
    
    const startDate = new Date(startYear, startMonth - 1, startDay);
    const endDate = new Date(endYear, endMonth - 1, endDay);
    const currentDate = new Date();

    // Si la campaña no ha comenzado
    if (currentDate < startDate) {
      return 0;
    }

    // Si la campaña ya terminó
    if (currentDate > endDate) {
      return 100;
    }

    // Calcular el progreso entre las fechas
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsed = currentDate.getTime() - startDate.getTime();
    const progress = (elapsed / totalDuration) * 100;

    return Math.max(0, Math.min(100, Math.round(progress)));
  };

  // Formatear fechas para mostrar
  const formatDate = (dateString: string) => {
    // Parsear la fecha como local para evitar problemas de zona horaria
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month - 1 porque los meses en JS van de 0-11
    return date.toLocaleDateString('es-AR', { 
      day: 'numeric', 
      month: 'short'
    });
  };

  const progress = calculateProgress();
  const startDateFormatted = formatDate(campaign.start_date);
  const endDateFormatted = formatDate(campaign.end_date);
  const currentDateFormatted = new Date().toLocaleDateString('es-AR', { 
    day: 'numeric', 
    month: 'short'
  });

  return (
    <div className="bg-transparent">
      <div>
        <div className="flex items-center justify-between mb-6">
            <div>
            <h3 className="text-sm font-semibold text-gray-800">Progreso de la campaña</h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-lg font-bold text-gray-800">
                {progress}%
              </div>
              <div className="text-xs text-gray-500 font-medium">Completado</div>
            </div>
          </div>
        </div>
        
        {/* Barra de progreso personalizada */}
        <div className="relative">
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className="relative h-full">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full"></div>
                <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white/30 to-transparent rounded-r-full"></div>
              </div>
            </div>
          </div>
          
          {/* Indicadores de progreso */}
          <div className="flex justify-between mt-3 text-[10px] text-gray-500">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span>Inicio: {startDateFormatted}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              <span>Actual: {currentDateFormatted}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
              <span>Fin: {endDateFormatted}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 