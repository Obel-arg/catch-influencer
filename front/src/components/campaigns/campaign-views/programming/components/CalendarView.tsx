import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react"
import { ContentItem } from "../types"
import { parseLocalDate, formatLocalDate } from "../utils/helpers"
import { LazyInfluencerAvatar } from "@/components/explorer/LazyInfluencerAvatar"

interface CalendarViewProps {
  filteredContent?: ContentItem[]
}

export const CalendarView = ({ filteredContent = [] }: CalendarViewProps) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [tempSelectedYear, setTempSelectedYear] = useState(new Date().getFullYear())
  const [tempSelectedMonth, setTempSelectedMonth] = useState(new Date().getMonth())

  // Función para obtener el primer día del mes
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1)
  }

  // Función para obtener el último día del mes
  const getLastDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0)
  }

  // Función para obtener el primer día de la semana (lunes)
  const getFirstDayOfWeek = (date: Date) => {
    const firstDay = getFirstDayOfMonth(date)
    const dayOfWeek = firstDay.getDay()
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Convertir domingo (0) a 6
    return new Date(firstDay.getTime() - daysToSubtract * 24 * 60 * 60 * 1000)
  }

  // Función para navegar al mes anterior
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  // Función para navegar al mes siguiente
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  // Función para ir al mes actual
  const goToCurrentMonth = () => {
    setCurrentDate(new Date())
  }

  // Función para aplicar la selección de fecha
  const applyDateSelection = () => {
    setCurrentDate(new Date(tempSelectedYear, tempSelectedMonth, 1))
    setSelectedYear(tempSelectedYear)
    setIsDatePickerOpen(false)
  }

  // Función para cancelar la selección
  const cancelDateSelection = () => {
    setTempSelectedYear(selectedYear)
    setTempSelectedMonth(currentDate.getMonth())
    setIsDatePickerOpen(false)
  }

  // Generar años para el selector (solo 2023-2027)
  const years = [2023, 2024, 2025, 2026, 2027]
  
  // Meses en español
  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ]

  // Generar las fechas del calendario
  const calendarDays = useMemo(() => {
    const firstDayOfWeek = getFirstDayOfWeek(currentDate)
    const lastDayOfMonth = getLastDayOfMonth(currentDate)
    const lastDayOfWeek = new Date(lastDayOfMonth)
    lastDayOfWeek.setDate(lastDayOfWeek.getDate() + (6 - lastDayOfMonth.getDay()))

    const days = []
    const currentDay = new Date(firstDayOfWeek)

    while (currentDay <= lastDayOfWeek) {
      days.push(new Date(currentDay))
      currentDay.setDate(currentDay.getDate() + 1)
    }

    return days
  }, [currentDate])

  // Filtrar contenido por fecha
  const getContentForDate = (date: Date) => {
    return filteredContent.filter(item => {
      const itemStartDate = parseLocalDate(item.startDate)
      const itemEndDate = parseLocalDate(item.endDate)
      
      // Normalizar fechas para comparación
      const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const normalizedStartDate = new Date(itemStartDate.getFullYear(), itemStartDate.getMonth(), itemStartDate.getDate())
      const normalizedEndDate = new Date(itemEndDate.getFullYear(), itemEndDate.getMonth(), itemEndDate.getDate())
      
      return normalizedDate >= normalizedStartDate && normalizedDate <= normalizedEndDate
    })
  }

  // Función para obtener el color del tipo de contenido
  const getContentTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "reel":
        return "bg-purple-500"
      case "video":
        return "bg-red-500"
      case "post":
      case "carrusel":
        return "bg-blue-500"
      case "stories":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  // Función para formatear el mes y año
  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString("es-ES", { 
      month: "long", 
      year: "numeric" 
    })
  }

  // Función para verificar si una fecha es del mes actual
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth() && 
           date.getFullYear() === currentDate.getFullYear()
  }

  // Función para verificar si una fecha es hoy
  const isToday = (date: Date) => {
    const today = new Date()
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear()
  }

  // Función para truncar texto
  const truncateText = (text: string, maxLength: number = 20) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  return (
    <div className="p-6">
      {/* Navegación del calendario */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousMonth}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 hover:bg-blue-50 px-3 py-2 rounded-lg"
              >
                <CalendarIcon className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900 capitalize cursor-pointer">
                  {formatMonthYear(currentDate)}
                </h2>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4 bg-white border border-gray-200 shadow-lg" align="start" side="bottom" sideOffset={5} avoidCollisions={false}>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Seleccionar fecha</h3>
                
                {/* Selector de año con navegación */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Año</label>
                  <div className="grid grid-cols-5 gap-2">
                    {years.map((year) => (
                      <Button
                        key={year}
                        variant={tempSelectedYear === year ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTempSelectedYear(year)}
                        className="text-sm"
                      >
                        {year}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Selector de mes */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Mes</label>
                  <div className="grid grid-cols-3 gap-2">
                    {months.map((month, index) => (
                      <Button
                        key={month}
                        variant={
                          tempSelectedMonth === index
                            ? "default" 
                            : "outline"
                        }
                        size="sm"
                        onClick={() => setTempSelectedMonth(index)}
                        className="text-sm"
                      >
                        {month}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={cancelDateSelection}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={applyDateSelection}
                    className="flex-1"
                  >
                    Aplicar
                  </Button>
                </div>

                {/* Botón para ir al mes actual */}
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentDate(new Date())
                    setSelectedYear(new Date().getFullYear())
                    setTempSelectedYear(new Date().getFullYear())
                    setTempSelectedMonth(new Date().getMonth())
                    setIsDatePickerOpen(false)
                  }}
                  className="w-full"
                >
                  Ir al mes actual
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextMonth}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={goToCurrentMonth}
          className="text-blue-600 border-blue-200 hover:bg-blue-50"
        >
          Hoy
        </Button>
    </div>

      {/* Calendario */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-visible">
        {/* Encabezados de días */}
        <div className="grid grid-cols-7 bg-gray-50 border-b">
      {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-700">
          {day}
        </div>
      ))}
        </div>

        {/* Días del calendario */}
        <div className="grid grid-cols-7">
          {calendarDays.map((date, index) => {
            const dayContent = getContentForDate(date)
            const isCurrentMonthDay = isCurrentMonth(date)
            const isTodayDate = isToday(date)

            return (
              <div
                key={index}
                className={`min-h-[120px] border-r border-b border-gray-200 p-2 ${
                  !isCurrentMonthDay ? "bg-gray-50" : "bg-white"
                } ${isTodayDate ? "bg-blue-50" : ""}`}
              >
                {/* Número del día */}
                <div className={`text-sm font-medium mb-1 ${
                  !isCurrentMonthDay 
                    ? "text-gray-400" 
                    : isTodayDate 
                      ? "text-blue-600" 
                      : "text-gray-900"
                }`}>
                  {date.getDate()}
                </div>

                {/* Contenido del día */}
                <div className="space-y-1">
                  {dayContent.slice(0, 3).map((item, itemIndex) => (
                    <div
                      key={item.id}
                      className={`text-xs p-1 rounded cursor-pointer transition-colors ${
                        getContentTypeColor(item.type)
                      } text-white group relative`}
                      title={item.title}
                    >
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-white opacity-80" />
                        <span className="truncate">{truncateText(item.title)}</span>
                      </div>
                      
                      {/* Tooltip personalizado con avatar, nombre, título, fecha y plataforma */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-[9999] opacity-0 group-hover:opacity-100 pointer-events-none">
                        <div className="bg-white/100 border border-gray-200 rounded-lg shadow-lg p-3 min-w-[260px] max-w-[320px]">
                          <div className="flex items-center gap-2 mb-2">
                            <LazyInfluencerAvatar 
                              influencer={{ name: item.influencer.name, avatar: item.influencer.image || '' }}
                              className="h-6 w-6 border"
                            />
                            <div className="text-xs font-medium text-gray-900 truncate">{item.influencer.name}</div>
                          </div>
                          <div className="text-xs text-gray-800 font-semibold mb-1 truncate">{item.title}</div>
                          <div className="text-[11px] text-gray-600">{formatLocalDate(item.startDate)}</div>
                          <div className="text-[11px] text-gray-600 capitalize">{item.platform} ({item.type})</div>
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-6 border-transparent border-t-white"></div>
                      </div>
        </div>
      ))}
                  
                  {dayContent.length > 3 && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="text-xs text-blue-600 text-center w-full underline underline-offset-2">
                          +{dayContent.length - 3} más
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-3 bg-white border border-gray-200 shadow-lg z-[9999]" side="top" align="center">
                        <div className="text-xs font-semibold text-gray-900 mb-2">Contenidos de este día</div>
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                          {dayContent.slice(3).map((moreItem) => (
                            <div key={moreItem.id} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
                              <div className="flex items-center gap-2 mb-1">
                                <LazyInfluencerAvatar influencer={{ name: moreItem.influencer.name, avatar: moreItem.influencer.image || '' }} className="h-5 w-5 border" />
                                <div className="text-[11px] font-medium text-gray-900 truncate">{moreItem.influencer.name}</div>
                              </div>
                              <div className="text-xs text-gray-800 font-semibold truncate">{moreItem.title}</div>
                              <div className="text-[11px] text-gray-600">{formatLocalDate(moreItem.startDate)}</div>
                              <div className="text-[11px] text-gray-600 capitalize">{moreItem.platform} ({moreItem.type})</div>
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
    </div>
  </div>
) 
          })}
        </div>
      </div>

      {/* Leyenda */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Leyenda de tipos de contenido:</h3>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-sm text-gray-700">Reel</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-sm text-gray-700">Video</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-sm text-gray-700">Post/Carrusel</span>
          </div>
        </div>
      </div>
    </div>
  )
} 