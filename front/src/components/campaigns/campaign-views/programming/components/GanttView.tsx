import { useState, useMemo, useEffect } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { ContentItem, TimelineColumn, ZoomLevel } from "../types"
import { GanttHeader } from "./GanttHeader"
import { GanttRow } from "./GanttRow"
import { GanttGroup } from "./GanttGroup"

interface GanttViewProps {
  filteredContent: ContentItem[]
  timelineColumns: TimelineColumn[]
  calculateCardPosition: (item: ContentItem) => { left: string; width: string }
  onCardClick: (item: ContentItem) => void
  zoomLevel: ZoomLevel
  campaignId: string
}

export const GanttView = ({ 
  filteredContent, 
  timelineColumns, 
  calculateCardPosition, 
  onCardClick,
  zoomLevel,
  campaignId
}: GanttViewProps) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Group content by influencer
  const groupedContent = useMemo(() => {
    const groups: { [key: string]: ContentItem[] } = {}
    
    
    filteredContent.forEach((item, index) => {
      const influencerId = item.influencer.id
      
      
      if (!groups[influencerId]) {
        groups[influencerId] = []
      }
      groups[influencerId].push(item)
    })
    
    return groups
  }, [filteredContent])

  // Initialize groups as expanded on first load
  useEffect(() => {
    if (!isInitialized && Object.keys(groupedContent).length > 0) {
      const allGroupIds = Object.keys(groupedContent)
      setExpandedGroups(new Set(allGroupIds))
      setIsInitialized(true)
    }
  }, [groupedContent, isInitialized])

  // Toggle individual group
  const toggleGroup = (influencerId: string) => {
    
    
    setExpandedGroups(prev => {
      const newExpanded = new Set(prev)
      if (newExpanded.has(influencerId)) {
        newExpanded.delete(influencerId)
      } else {
        newExpanded.add(influencerId)
      }
      
      return newExpanded
    })
  }

  return (
    <div className="gantt-container">
      <div className="gantt-content">
        <GanttHeader timelineColumns={timelineColumns} zoomLevel={zoomLevel} />
        {Object.entries(groupedContent).map(([influencerId, items]) => (
          <GanttGroup
            key={influencerId}
            influencerId={influencerId}
            items={items}
            timelineColumns={timelineColumns}
            calculateCardPosition={calculateCardPosition}
            onCardClick={onCardClick}
            zoomLevel={zoomLevel}
            isExpanded={expandedGroups.has(influencerId)}
            onToggleExpanded={() => toggleGroup(influencerId)}
            campaignId={campaignId}
          />
        ))}
      </div>
    </div>
  )
} 