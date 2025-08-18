import { ZoomLevel, TimelineColumn } from "../types"

export const useTimelineColumns = (zoomLevel: ZoomLevel, startDate: Date, endDate: Date): TimelineColumn[] => {
  const generateColumns = (): TimelineColumn[] => {
    const columns: TimelineColumn[] = []
    const currentDate = new Date(startDate)

    if (zoomLevel === "day") {
      while (currentDate <= endDate) {
        columns.push({
          date: new Date(currentDate),
          dateKey: currentDate.toISOString().split('T')[0],
          label: currentDate.getDate().toString(),
          subLabel: currentDate.toLocaleDateString("es-ES", { weekday: "short" }),
        })
        currentDate.setDate(currentDate.getDate() + 1)
      }
    } else if (zoomLevel === "week") {
      while (currentDate <= endDate) {
        const weekStart = new Date(currentDate)
        const weekEnd = new Date(currentDate)
        weekEnd.setDate(weekEnd.getDate() + 6)
        
        columns.push({
          date: new Date(weekStart),
          dateKey: weekStart.toISOString().split('T')[0],
          label: `Sem ${Math.ceil(weekStart.getDate() / 7)}`,
          subLabel: `${weekStart.getDate()} - ${weekEnd.getDate()} ${weekStart.toLocaleDateString("es-ES", { month: "short" })}`,
        })
        
        currentDate.setDate(currentDate.getDate() + 7)
      }
    } else if (zoomLevel === "month") {
      while (currentDate <= endDate) {
        columns.push({
          date: new Date(currentDate),
          dateKey: currentDate.toISOString().split('T')[0],
          label: currentDate.toLocaleDateString("es-ES", { month: "short" }),
          subLabel: currentDate.getFullYear().toString(),
        })
        currentDate.setMonth(currentDate.getMonth() + 1)
      }
    }

    return columns
  }

  return generateColumns()
} 