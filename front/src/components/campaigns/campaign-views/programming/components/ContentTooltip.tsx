import { ContentItem } from "../types"
import { formatDate, formatLocalDate } from "../utils/helpers"
import { StatusBadge } from "./StatusBadge"
import { ObjectiveProgress } from "./ObjectiveProgress"

interface ContentTooltipProps {
  item: ContentItem
}

export const ContentTooltip = ({ item }: ContentTooltipProps) => (
  <div className="p-0 overflow-hidden">
    <div className="p-3 bg-white rounded-t-md border-b">
      <div className="font-medium">{item.title}</div>
      <div className="text-sm text-gray-500">{item.influencer.name}</div>
      <div className="text-xs text-gray-500 mt-1">
        <span className="font-medium">Fecha:</span> {formatLocalDate(item.startDate)}
      </div>
      <div className="text-xs text-gray-500">
        <span className="font-medium">Plataforma:</span> {item.platform} ({item.type})
      </div>
      <div className="flex items-center gap-1 mt-1">
        <StatusBadge status={item.status} />
      </div>
    </div>
    <div className="p-3 bg-gray-50">
      <div className="text-sm font-medium mb-2">Objetivos:</div>
      {item.objectives.length === 0 ? (
        <div className="text-sm text-gray-500 italic">Sin Objetivos</div>
      ) : (
        item.objectives.map((objective) => (
          <ObjectiveProgress key={objective.id} objective={objective} />
        ))
      )}
    </div>
  </div>
) 