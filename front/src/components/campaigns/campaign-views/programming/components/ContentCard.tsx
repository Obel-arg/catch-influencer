import { ContentItem } from "../types"
import { truncateText } from "../utils/helpers"

interface ContentCardProps {
  item: ContentItem
  position: { left: string; width: string; display?: string }
  onCardClick: (item: ContentItem) => void
}

export const ContentCard = ({ item, position, onCardClick }: ContentCardProps) => (
  <div
    className={`absolute top-0 bottom-0 rounded-md shadow-sm border z-1 pointer-events-auto gantt-card ${
      item.status === "completed"
        ? "bg-gradient-to-r from-green-500 to-green-600 border-green-600"
        : item.status === "in-progress"
          ? "bg-gradient-to-r from-amber-500 to-amber-600 border-amber-600"
          : "bg-gradient-to-r from-gray-400 to-gray-500 border-gray-500"
    } text-white flex items-center justify-center text-xs font-medium cursor-pointer hover:opacity-90 transition-all duration-200 hover:scale-105`}
    style={position}
    onClick={() => onCardClick(item)}
  >
    <div className="flex items-center justify-center px-2 w-full h-full">
      <span className="font-semibold text-xs">{truncateText(item.type)}</span>
    </div>
  </div>
) 