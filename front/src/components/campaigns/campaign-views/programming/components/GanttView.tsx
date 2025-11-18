import { useState, useMemo, useEffect } from "react"
import { ChevronDown, ChevronRight, Calendar, FileSpreadsheet } from "lucide-react"
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

  // Check if there's no content
  const hasNoContent = Object.keys(groupedContent).length === 0;

  return (
    <div className="gantt-container">
      <div className="gantt-content">
        <GanttHeader timelineColumns={timelineColumns} zoomLevel={zoomLevel} />
        {hasNoContent ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="flex items-center justify-center w-20 h-20 mb-6 bg-gray-100 rounded-full">
              <Calendar className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No hay contenido programado
            </h3>
            <p className="text-gray-500 text-center mb-6 max-w-md">
              Comienza a planificar tu campaña agregando contenido manualmente o importando desde Excel
            </p>
            <div className="flex gap-3">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Agregar Contenido
              </button>
              <button className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-300 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4" />
                Importar Excel
              </button>
            </div>
          </div>
        ) : (
          Object.entries(groupedContent).map(([influencerId, items]) => (
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
          ))
        )}
      </div>
    </div>
  )
} 