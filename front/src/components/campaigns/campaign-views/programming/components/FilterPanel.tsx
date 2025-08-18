import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Filter } from "lucide-react"

interface FilterPanelProps {
  onApplyFilters: (filters: FilterState) => void
  onResetFilters: () => void
  currentFilters: FilterState
  campaignInfluencers?: Array<{
    id: string
    influencers: {
      id: string
      name: string
      avatar?: string
    }
  }>
}

export interface FilterState {
  estado: string
  plataforma: string
  tipoContenido: string
  influencer: string
}

export const FilterPanel = ({ onApplyFilters, onResetFilters, currentFilters, campaignInfluencers = [] }: FilterPanelProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [tempFilters, setTempFilters] = useState<FilterState>(currentFilters)

  const handleApply = () => {
    onApplyFilters(tempFilters)
    setIsOpen(false)
  }

  const handleReset = () => {
    const resetFilters = {
      estado: "all",
      plataforma: "all",
      tipoContenido: "all",
      influencer: "all"
    }
    setTempFilters(resetFilters)
    onResetFilters()
    setIsOpen(false)
  }

  const handleFilterChange = (filterType: keyof FilterState, value: string) => {
    setTempFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="w-[140px] border-black text-blue-700 hover:bg-blue-50"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtros
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-6 bg-white border border-gray-200 shadow-lg filter-panel-popover" 
        align="end"
        style={{ 
          zIndex: 1,
          position: 'relative'
        }}
      >
        <div className="space-y-6">          
          {/* Estado */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">Estado</label>
            <Select value={tempFilters.estado} onValueChange={(value) => handleFilterChange('estado', value)}>
              <SelectTrigger className="w-full border-gray-300">
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="completed">Completados</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Plataforma */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">Plataforma</label>
            <Select value={tempFilters.plataforma} onValueChange={(value) => handleFilterChange('plataforma', value)}>
              <SelectTrigger className="w-full border-gray-300">
                <SelectValue placeholder="Seleccionar plataforma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="twitter">Twitter</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tipo de contenido */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">Tipo de contenido</label>
            <Select value={tempFilters.tipoContenido} onValueChange={(value) => handleFilterChange('tipoContenido', value)}>
              <SelectTrigger className="w-full border-gray-300">
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="reel">Reel</SelectItem>
                <SelectItem value="post">Post</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Influencer */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">Influencer</label>
            <Select value={tempFilters.influencer} onValueChange={(value) => handleFilterChange('influencer', value)}>
              <SelectTrigger className="w-full border-gray-300">
                <SelectValue placeholder="Seleccionar influencer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {campaignInfluencers.map((influencer) => (
                  <SelectItem key={influencer.id} value={influencer.influencers.id}>
                    {influencer.influencers.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Restablecer
            </Button>
            <Button
              onClick={handleApply}
              className="flex-1 bg-gray-900 text-white hover:bg-gray-800"
            >
              Aplicar filtros
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
} 