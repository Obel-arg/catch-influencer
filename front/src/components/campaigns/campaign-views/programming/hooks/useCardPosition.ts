import { ContentItem, TimelineColumn, ZoomLevel } from "../types"
import { GANTT_CONFIG } from "../constants/data"
import { normalizeDate, parseLocalDate } from "../utils/helpers"

export const useCardPosition = (timelineColumns: TimelineColumn[], zoomLevel: ZoomLevel) => {
  const getColumnWidth = () => {
    switch (zoomLevel) {
      case "week":
        return 120 // gantt-week-column-width
      case "month":
        return 200 // gantt-month-column-width
      default:
        return GANTT_CONFIG.columnWidth
    }
  }

  return (item: ContentItem): { left: string; width: string; display?: string } => {
    const itemDate = parseLocalDate(item.startDate)
    const columnWidth = getColumnWidth()
    
    let targetColumnIndex = -1
    
    if (zoomLevel === "day") {
      // Para días, buscar coincidencia exacta
      timelineColumns.forEach((column, index) => {
        const columnDate = new Date(column.date)
        const normalizedColumnDate = normalizeDate(columnDate)
        const normalizedItemDate = normalizeDate(itemDate)
        
        if (normalizedItemDate.getTime() === normalizedColumnDate.getTime()) {
          targetColumnIndex = index
        }
      })
    } else if (zoomLevel === "week") {
      // Para semanas, verificar si la fecha está dentro del rango de la semana
      timelineColumns.forEach((column, index) => {
        const weekStart = new Date(column.date)
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekEnd.getDate() + 6)
        
        // Normalizar las fechas para comparación
        const normalizedItemDate = normalizeDate(itemDate)
        const normalizedWeekStart = normalizeDate(weekStart)
        const normalizedWeekEnd = normalizeDate(weekEnd)
        
        if (normalizedItemDate >= normalizedWeekStart && normalizedItemDate <= normalizedWeekEnd) {
          targetColumnIndex = index
        }
      })
    } else if (zoomLevel === "month") {
      // Para meses, verificar si la fecha está en el mismo mes y año
      timelineColumns.forEach((column, index) => {
        const columnDate = new Date(column.date)
        
        if (itemDate.getMonth() === columnDate.getMonth() && 
            itemDate.getFullYear() === columnDate.getFullYear()) {
          targetColumnIndex = index
        }
      })
    }

    // Si no se encontró coincidencia, no mostrar la card
    if (targetColumnIndex === -1) {
      return {
        left: "-9999px", // Posición fuera de la vista
        width: "0px",
        display: "none"
      }
    }

    const leftPosition = targetColumnIndex * columnWidth

    return {
      left: `${leftPosition}px`,
      width: `${columnWidth}px`,
    }
  }
} 