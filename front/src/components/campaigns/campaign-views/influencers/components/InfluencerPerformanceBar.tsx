import { Star, Info } from "lucide-react";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface InfluencerPerformanceBarProps {
  score: number;
  isActive: boolean;
}

export const InfluencerPerformanceBar = ({ score, isActive }: InfluencerPerformanceBarProps) => {
  if (!isActive) return null;

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
        <span>Performance</span>
        <div className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
          <span className="font-medium text-gray-700">{score}/100</span>
          <TooltipProvider delayDuration={0}>
            <UITooltip>
              <TooltipTrigger asChild>
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                  <Info className="h-3 w-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs bg-white text-gray-900 border border-gray-200 shadow-lg">
                <div className="space-y-2">
                  <p className="font-medium text-gray-900 flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    Puntaje de Performance
                  </p>
                  <div className="text-sm space-y-1 text-gray-700">
                    <p><strong>Engagement (0-50 pts):</strong></p>
                    <ul className="ml-2 space-y-1">
                      <li>• +8%: 50 pts</li>
                      <li>• +5%: 40 pts</li>
                      <li>• +3%: 30 pts</li>
                      <li>• +1%: 20 pts</li>
                      <li>• &lt;1%: 10 pts</li>
                    </ul>
                    <p><strong>Seguidores (0-30 pts):</strong></p>
                    <ul className="ml-2 space-y-1">
                      <li>• +1M: 30 pts</li>
                      <li>• +500K: 25 pts</li>
                      <li>• +100K: 20 pts</li>
                      <li>• +50K: 15 pts</li>
                      <li>• &lt;50K: 10 pts</li>
                    </ul>
                    <p><strong>Estado (0-20 pts):</strong></p>
                    <ul className="ml-2 space-y-1">
                      <li>• Activo: 20 pts</li>
                      <li>• Verificado: 15 pts</li>
                      <li>• Pendiente: 10 pts</li>
                    </ul>
                  </div>
                </div>
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        </div>
      </div>
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full transition-all ${
            score >= 90
              ? "bg-green-500"
              : score >= 70
                ? "bg-blue-500"
                : "bg-amber-500"
          }`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}; 