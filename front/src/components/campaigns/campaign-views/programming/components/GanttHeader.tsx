import { TimelineColumn, ZoomLevel } from "../types"

interface GanttHeaderProps {
  timelineColumns: TimelineColumn[]
  zoomLevel: ZoomLevel
}

export const GanttHeader = ({ timelineColumns, zoomLevel }: GanttHeaderProps) => {
  const getColumnClass = () => {
    switch (zoomLevel) {
      case "week":
        return "gantt-week-column"
      case "month":
        return "gantt-month-column"
      default:
        return "gantt-timeline-column"
    }
  }

  return (
    <div className="flex border-b gantt-border">
      <div className="p-3 gantt-column-border sticky left-0 gantt-sticky-column bg-blue-50">
        <div className="font-medium text-blue-900">Contenido / Influencer</div>
      </div>
      <div className="flex-1 flex">
        {timelineColumns.map((column, index) => (
          <div 
            key={index} 
            className={`p-2 text-center gantt-column-border ${getColumnClass()}`}
          >
            <div className="font-medium text-blue-900">{column.label}</div>
            <div className="text-xs text-blue-700">{column.subLabel}</div>
          </div>
        ))}
      </div>
    </div>
  )
} 