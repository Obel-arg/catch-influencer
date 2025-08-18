import { useState } from "react"
import { ChevronDown, ChevronRight, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ContentItem, TimelineColumn, ZoomLevel } from "../types"
import { GanttRow } from "./GanttRow"
import { LazyInfluencerAvatar } from "@/components/explorer/LazyInfluencerAvatar"

interface GanttGroupProps {
  influencerId: string
  items: ContentItem[]
  timelineColumns: TimelineColumn[]
  calculateCardPosition: (item: ContentItem) => { left: string; width: string }
  onCardClick: (item: ContentItem) => void
  zoomLevel: ZoomLevel
  isExpanded: boolean
  onToggleExpanded: () => void
  campaignId: string
}

export const GanttGroup = ({ 
  influencerId, 
  items, 
  timelineColumns, 
  calculateCardPosition, 
  onCardClick,
  zoomLevel,
  isExpanded,
  onToggleExpanded,
  campaignId
}: GanttGroupProps) => {
  // Get influencer info from the first item (all items in group have same influencer)
  const influencer = items[0]?.influencer
  const contentCount = items.length
    
  // Calculate status summary
  const statusCounts = items.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800"
      case "in-progress": return "bg-amber-100 text-amber-800"
      case "pending": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="gantt-group">
      {/* Group Header */}
      <div className="flex hover:bg-gray-50 transition-colors border-b border-gray-200 gantt-group-header cursor-pointer" onClick={onToggleExpanded}>
        <div className="p-2 flex items-center gap-3 sticky left-0 z-10 overflow-hidden gantt-sticky-column bg-gray-50 min-w-[350px]">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onToggleExpanded()
            }}
            className="h-6 w-6 p-0 hover:bg-gray-200 transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
          
          <LazyInfluencerAvatar 
            influencer={{
              name: influencer?.name || 'Influencer',
              avatar: influencer?.image || ''
            }}
            className="h-6 w-6 border"
          />
          
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 truncate text-sm">
              {influencer?.name || 'Influencer'}
            </div>
          </div>
        </div>
        
        <div className="flex-1 relative h-10 pointer-events-none bg-gray-50">
          {/* Completely smooth area - no borders */}
        </div>
      </div>
      
      {/* Group Content - Only show if expanded */}
      {isExpanded && (
        <div className="gantt-group-content">
          {items.map((item) => (
            <GanttRow
              key={item.id}
              item={item}
              position={calculateCardPosition(item)}
              onCardClick={onCardClick}
              timelineColumns={timelineColumns}
              zoomLevel={zoomLevel}
              campaignId={campaignId}
            />
          ))}
        </div>
      )}
    </div>
  )
} 