import { ContentItem, TimelineColumn, ZoomLevel } from "../types"
import { ContentCard } from "./ContentCard"
import { CustomTooltip } from "./CustomTooltip"
import { LazyInfluencerAvatar } from "@/components/explorer/LazyInfluencerAvatar"

interface GanttRowProps {
  item: ContentItem
  position: { left: string; width: string }
  onCardClick: (item: ContentItem) => void
  timelineColumns: TimelineColumn[]
  zoomLevel: ZoomLevel
  campaignId: string
}

export const GanttRow = ({ item, position, onCardClick, timelineColumns, zoomLevel, campaignId }: GanttRowProps) => {
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
    <div className="flex hover:bg-blue-50 transition-colors border-b border-gray-100 gantt-row">
      <div className="p-2 gantt-column-border flex items-center gap-2 sticky left-0 z-10 overflow-hidden gantt-sticky-column bg-white pl-8">
        <LazyInfluencerAvatar 
          influencer={{
            name: item.influencer.name,
            avatar: item.influencer.image || ''
          }}
          className="h-6 w-6 border"
        />
        <div className="min-w-0 flex-1">
          <div className="font-medium text-sm text-gray-900 truncate">{item.title}</div>
          <div className="text-xs text-gray-500 truncate">{item.platform} • {item.type}</div>
        </div>
      </div>
      <div className="flex-1 relative h-16 pointer-events-auto">
        {/* Grid de columnas con bordes */}
        <div className="flex absolute inset-0">
          {timelineColumns.map((_, index) => (
            <div 
              key={index} 
              className={`gantt-column-border ${getColumnClass()}`}
            />
          ))}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-200" />
        <CustomTooltip item={item} campaignId={campaignId}>
          <ContentCard item={item} position={position} onCardClick={onCardClick} />
        </CustomTooltip>
      </div>
    </div>
  )
} 