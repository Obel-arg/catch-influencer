import { ContentStatus } from "../types"

interface StatusBadgeProps {
  status: ContentStatus
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const getStatusText = (status: ContentStatus) => {
    switch (status) {
      case "completed":
        return "Completado"
      case "in-progress":
        return "En progreso"
      case "pending":
        return "Pendiente"
      default:
        return "Pendiente"
    }
  }

  const getStatusStyles = (status: ContentStatus) => {
    switch (status) {
      case "completed":
        return "bg-green-500 text-white"
      case "in-progress":
        return "bg-amber-500 text-white"
      case "pending":
        return "bg-gray-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium whitespace-nowrap ${getStatusStyles(status)}`}>
      {getStatusText(status)}
    </span>
  )
} 