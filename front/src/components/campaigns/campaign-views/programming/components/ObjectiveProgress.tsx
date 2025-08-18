import { CheckCircle2, Clock, AlertCircle, TrendingUp, Eye, Heart, MessageCircle, Share } from "lucide-react"
import { Objective, ObjectiveStatus } from "../types"
import { getStatusIconClass } from "../utils/helpers"

interface ObjectiveProgressProps {
  objective: Objective
  showRealMetrics?: boolean
  isRealData?: boolean
}

export const ObjectiveProgress = ({ objective, showRealMetrics = false, isRealData = false }: ObjectiveProgressProps) => {
  const getStatusIcon = (status: ObjectiveStatus) => {
    const iconClass = getStatusIconClass(status)
    switch (status) {
      case "completed":
        return <CheckCircle2 className={iconClass} />
      case "in-progress":
        return <Clock className={iconClass} />
      default:
        return <AlertCircle className={iconClass} />
    }
  }

  const getObjectiveIcon = (title: string) => {
    const titleLower = title.toLowerCase()
    if (titleLower.includes('alcance') || titleLower.includes('reach') || titleLower.includes('vistas')) {
      return <Eye className="h-3 w-3 text-blue-500" />
    }
    if (titleLower.includes('engagement') || titleLower.includes('interacción') || titleLower.includes('engage')) {
      return <TrendingUp className="h-3 w-3 text-green-500" />
    }
    if (titleLower.includes('likes') || titleLower.includes('me gusta')) {
      return <Heart className="h-3 w-3 text-red-500" />
    }
    if (titleLower.includes('comentarios') || titleLower.includes('comments')) {
      return <MessageCircle className="h-3 w-3 text-blue-500" />
    }
    if (titleLower.includes('compartidos') || titleLower.includes('shares')) {
      return <Share className="h-3 w-3 text-green-500" />
    }
    return null
  }

  const formatValue = (value: string, target: string) => {
    if (value.includes('%')) {
      return value
    }
    
    const numValue = parseInt(value.replace(/[^\d]/g, ''))
    if (isNaN(numValue)) return value
    
    if (numValue >= 1000000) {
      return `${(numValue / 1000000).toFixed(1)}M`
    } else if (numValue >= 1000) {
      return `${(numValue / 1000).toFixed(1)}K`
    }
    
    return numValue.toLocaleString()
  }

  const calculateRealProgress = (current: string, target: string) => {
    // Función para convertir valores con sufijos (K, M) a números
    const parseFormattedValue = (value: string) => {
      const cleanValue = value.replace(/[^\d.]/g, '')
      const numValue = parseFloat(cleanValue)
      
      if (isNaN(numValue)) return 0
      
      // Multiplicar por el sufijo si existe
      if (value.toLowerCase().includes('k')) {
        return numValue * 1000
      } else if (value.toLowerCase().includes('m')) {
        return numValue * 1000000
      }
      
      return numValue
    }
    
    const currentNum = parseFormattedValue(current)
    const targetNum = parseFormattedValue(target)
    
    if (currentNum === 0 || targetNum === 0) return 0
    
    // Calcular porcentaje real
    const progress = Math.min(100, (currentNum / targetNum) * 100)
    return Math.round(progress)
  }

  const realProgress = calculateRealProgress(objective.current, objective.target)

  return (
    <div className="mb-2 last:mb-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {getObjectiveIcon(objective.title)}
          <div className="text-sm">{objective.title}</div>
        </div>
        <div className="flex items-center gap-1">
          <span className={`text-xs font-medium ${isRealData ? 'text-green-700' : ''}`}>
            {formatValue(objective.current, objective.target)}
          </span>
          <span className="text-xs text-gray-500">/ {objective.target}</span>
          {getStatusIcon(objective.status)}
        </div>
      </div>
      <div className="w-full h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            realProgress >= 100 ? 'bg-green-500' : 
            realProgress >= 50 ? 'bg-amber-500' : 
            'bg-blue-500'
          } ${isRealData ? 'ring-1 ring-green-300' : ''}`}
          style={{ width: `${realProgress}%` }}
        />
      </div>
    </div>
  )
} 