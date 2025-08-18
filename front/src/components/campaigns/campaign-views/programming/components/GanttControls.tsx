import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { ZoomLevel } from "../types"

interface GanttControlsProps {
  zoomLevel: ZoomLevel
  setZoomLevel: (level: ZoomLevel) => void
  startDate: Date
  endDate: Date
  onNavigateBackward: () => void
  onNavigateForward: () => void
}

export const GanttControls = ({ 
  zoomLevel, 
  setZoomLevel, 
  startDate, 
  endDate,
  onNavigateBackward,
  onNavigateForward
}: GanttControlsProps) => (
  <div className="p-4 border-b">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 border-blue-300 text-blue-700 hover:bg-blue-100"
          onClick={onNavigateBackward}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 border-blue-300 text-blue-700 hover:bg-blue-100"
          onClick={onNavigateForward}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium text-blue-900">
          {startDate.toLocaleDateString("es-ES", { month: "long", year: "numeric" })} - {endDate.toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {(["day", "week", "month"] as const).map((level) => (
          <Button
            key={level}
            variant={zoomLevel === level ? "default" : "outline"}
            size="sm"
            className={`h-8 ${zoomLevel === level ? "bg-blue-600 text-white" : "border-blue-300 text-blue-700 hover:bg-blue-100"}`}
            onClick={() => setZoomLevel(level)}
          >
            {level === "day" ? "Día" : level === "week" ? "Semana" : "Mes"}
          </Button>
        ))}
      </div>
    </div>
  </div>
) 