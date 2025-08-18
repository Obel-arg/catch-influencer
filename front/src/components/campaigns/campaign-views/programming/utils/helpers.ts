import { ContentStatus, ObjectiveStatus } from "../types"

export const getStatusColor = (status: ContentStatus): string => {
  const statusColors = {
    completed: "bg-green-500 hover:bg-green-600 text-white",
    "in-progress": "bg-amber-500 hover:bg-amber-600 text-white",
    pending: "bg-gray-500 hover:bg-gray-600 text-white",
  }
  return statusColors[status] || statusColors.pending
}

export const getStatusIconClass = (status: ContentStatus | ObjectiveStatus): string => {
  const statusIconClasses = {
    completed: "h-4 w-4 text-green-500",
    "in-progress": "h-4 w-4 text-amber-500",
    pending: "h-4 w-4 text-gray-500",
    "not-started": "h-4 w-4 text-gray-500",
  }
  return statusIconClasses[status] || statusIconClasses.pending
}

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString("es-ES", { 
    day: "numeric", 
    month: "short", 
    year: "numeric" 
  })
}

// Función para formatear fechas locales sin problemas de zona horaria
export const formatLocalDate = (dateString: string): string => {
  const date = parseLocalDate(dateString)
  return date.toLocaleDateString("es-ES", { 
    day: "numeric", 
    month: "short", 
    year: "numeric" 
  })
}

export const truncateText = (text: string, maxLength: number = 6): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - 3) + "..."
}

export const normalizeDate = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

// Función para crear fechas locales desde strings sin problemas de zona horaria
export const parseLocalDate = (dateString: string): Date => {
  // Si la fecha viene en formato YYYY-MM-DD, parsearla como fecha local
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day); // month - 1 porque Date usa 0-indexado
  }
  
  // Para otros formatos, usar el constructor normal
  return new Date(dateString);
} 