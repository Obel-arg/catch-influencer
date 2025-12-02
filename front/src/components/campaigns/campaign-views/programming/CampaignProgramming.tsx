"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/cardsp"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FileSpreadsheet, Download } from "lucide-react"
import { useToast } from "@/hooks/common/useToast"

// Types
import { CampaignProgrammingProps, ZoomLevel, ViewType, ContentItem } from "./types"

// Constants
import { GANTT_CONFIG } from "./constants/data"

// Hooks
import { useTimelineColumns } from "./hooks/useTimelineColumns"
import { useCardPosition } from "./hooks/useCardPosition"
import { useCampaignInfluencers } from "@/hooks/campaign/useCampaignInfluencers"
import { useCampaignSchedule } from "@/hooks/campaign/useCampaignSchedule"

// Utils
import { normalizeDate, parseLocalDate } from "./utils/helpers"
import { exportCampaignScheduleToExcel } from "@/utils/excel-export"

// Components
import {
  GanttView,
  ListView,
  CalendarView,
  GanttControls,
  FilterPanel,
  EditContentModal,
  AddContentModal
} from "./components"
import { BulkUploadModal } from "./components/BulkUploadModal"
import { FilterState } from "./components/FilterPanel"

export function CampaignProgramming({ campaign }: CampaignProgrammingProps) {
  // State
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>("week")
  const [currentView, setCurrentView] = useState<ViewType>("gantt")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [filters, setFilters] = useState<FilterState>({
    estado: "all",
    plataforma: "all",
    tipoContenido: "all",
    influencer: "all"
  })
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false)

  // Hooks
  const { showToast } = useToast()

  // Get campaign influencers
  const { influencers: campaignInfluencers = [] } = useCampaignInfluencers(campaign.id)
  
  // Get campaign schedules from database
  const { 
    schedules: dbSchedules, 
    loading: schedulesLoading, 
    error: schedulesError,
    loadSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule
  } = useCampaignSchedule(campaign.id)

  // Convert database schedules to ContentItem format for compatibility
  const contentItems: ContentItem[] = Array.isArray(dbSchedules) 
    ? dbSchedules.map(schedule => {
        const transformedItem = {
          id: schedule.id,
          title: schedule.title,
          platform: schedule.platform,
          type: schedule.content_type,
          status: schedule.status === 'cancelled' || schedule.status === 'overdue' ? 'pending' : schedule.status,
          startDate: schedule.start_date,
          endDate: schedule.end_date,
          description: schedule.description || "",
          content_url: schedule.content_url || "",
          influencer: {
            id: schedule.influencer_id,
            name: schedule.influencer_name,
            handle: schedule.influencer_handle || "",
            image: schedule.influencer_avatar || ""
          },
          objectives: schedule.objectives || []
        };
        return transformedItem;
      })
    : []

  // Helper function to get the first day of a month
  const getFirstDayOfMonth = (date: Date): Date => {
    return new Date(date.getFullYear(), date.getMonth(), 1)
  }

  // Helper function to get the last day of a month
  const getLastDayOfMonth = (date: Date): Date => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0)
  }

  // Helper function to calculate a 3-month range
  const calculateThreeMonthRange = (baseDate: Date, direction: 'forward' | 'backward') => {
    const newDate = new Date(baseDate)
    if (direction === 'forward') {
      newDate.setMonth(newDate.getMonth() + 3)
    } else {
      newDate.setMonth(newDate.getMonth() - 3)
    }
    
    const startDate = getFirstDayOfMonth(newDate)
    const endDate = getLastDayOfMonth(new Date(newDate.getFullYear(), newDate.getMonth() + 2, 1))
    
    return { startDate, endDate }
  }

  // Initialize Gantt dates with current month and next 3 months
  const getCurrentMonthStart = () => {
    const now = new Date();
    return getFirstDayOfMonth(now);
  }
  
  const getThreeMonthsLater = () => {
    const now = new Date();
    const threeMonthsLater = new Date(now.getFullYear(), now.getMonth() + 3, 0); // Last day of 3rd month
    return getLastDayOfMonth(threeMonthsLater);
  }
  
  const initialStartDate = getCurrentMonthStart();
  const initialEndDate = getThreeMonthsLater();
  
  // Gantt date state
  const [ganttStartDate, setGanttStartDate] = useState(initialStartDate)
  const [ganttEndDate, setGanttEndDate] = useState(initialEndDate)
  const [hasAutoScrolled, setHasAutoScrolled] = useState(false)

  // Auto-scroll to earliest content when switching to Gantt view
  useEffect(() => {
    if (currentView === 'gantt' && !hasAutoScrolled && contentItems.length > 0) {
      // Find the earliest content date
      const earliestDate = contentItems.reduce((earliest, item) => {
        const itemDate = parseLocalDate(item.startDate);
        return !earliest || itemDate < earliest ? itemDate : earliest;
      }, null as Date | null);

      if (earliestDate) {
        // Check if earliest date is outside current visible range
        const ganttStart = new Date(ganttStartDate);
        const ganttEnd = new Date(ganttEndDate);

        if (earliestDate < ganttStart || earliestDate > ganttEnd) {
          // Set gantt range to start from the month of the earliest content
          const newStartDate = getFirstDayOfMonth(earliestDate);
          const newEndDate = getLastDayOfMonth(
            new Date(earliestDate.getFullYear(), earliestDate.getMonth() + 2, 1)
          );

          setGanttStartDate(newStartDate);
          setGanttEndDate(newEndDate);
        }
      }

      setHasAutoScrolled(true);
    }

    // Reset auto-scroll flag when leaving gantt view
    if (currentView !== 'gantt') {
      setHasAutoScrolled(false);
    }
  }, [currentView, contentItems, hasAutoScrolled, ganttStartDate, ganttEndDate]);

  // Derived state
  const timelineColumns = useTimelineColumns(zoomLevel, ganttStartDate, ganttEndDate)
  const calculateCardPosition = useCardPosition(timelineColumns, zoomLevel)
  
  // Filter content by search query and all filter types
  const filteredContent = contentItems.filter((item) => {
    
    // Date range filter - only apply for Gantt view, Lista and Calendario show ALL cards
    if (currentView === "gantt") {
      const itemStartDate = parseLocalDate(item.startDate);
      const itemEndDate = parseLocalDate(item.endDate);
      const ganttStart = new Date(ganttStartDate);
      const ganttEnd = new Date(ganttEndDate);
      
      // Validate dates before using them
      const isValidItemStart = !isNaN(itemStartDate.getTime());
      const isValidItemEnd = !isNaN(itemEndDate.getTime());
      const isValidGanttStart = !isNaN(ganttStart.getTime());
      const isValidGanttEnd = !isNaN(ganttEnd.getTime());
      
      // If any date is invalid, skip this item
      if (!isValidItemStart || !isValidItemEnd || !isValidGanttStart || !isValidGanttEnd) {
        return false;
      }
      
      // Check if item overlaps with the visible date range
      const matchesDateRange = (
        (itemStartDate <= ganttEnd && itemEndDate >= ganttStart) || // Item overlaps with visible range
        (itemStartDate >= ganttStart && itemStartDate <= ganttEnd) || // Item starts within visible range
        (itemEndDate >= ganttStart && itemEndDate <= ganttEnd) // Item ends within visible range
      );
      
      if (!matchesDateRange) {
        return false;
      }
    }
    
    // Search filter
    const matchesSearch = searchQuery === "" || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Status filter
    const matchesStatus = filters.estado === "all" || item.status === filters.estado
    
    // Platform filter (assuming we need to add platform to ContentItem type)
    const matchesPlatform = filters.plataforma === "all" || 
      item.platform.toLowerCase() === filters.plataforma.toLowerCase()
    
    // Content type filter
    const matchesType = filters.tipoContenido === "all" || 
      item.type.toLowerCase() === filters.tipoContenido.toLowerCase()
    
    // Influencer filter
    const matchesInfluencer = filters.influencer === "all" || 
      item.influencer.id === filters.influencer
    
    const matches = matchesSearch && matchesStatus && matchesPlatform && matchesType && matchesInfluencer;
    

    
    return matches;
  })

  // Navigation functions
  const navigateBackward = () => {
    const { startDate, endDate } = calculateThreeMonthRange(ganttStartDate, 'backward')
    setGanttStartDate(startDate)
    setGanttEndDate(endDate)
  }

  const navigateForward = () => {

    const { startDate, endDate } = calculateThreeMonthRange(ganttStartDate, 'forward')

    setGanttStartDate(startDate)
    setGanttEndDate(endDate)
  }

  // Filter handlers
  const handleApplyFilters = (newFilters: FilterState) => {
    setFilters(newFilters)
  }

  const handleResetFilters = () => {
    setFilters({
      estado: "all",
      plataforma: "all",
      tipoContenido: "all",
      influencer: "all"
    })
    setSearchQuery("")
  }

  // Content handlers
  const handleCardClick = (item: ContentItem) => {
    // Handle card click - could open a detail modal or navigate to edit
    
  }

  const handleSaveContent = async (updatedItem: ContentItem) => {
    try {
      
      
      // Convert ContentItem back to database format
      const updateData = {
        title: updatedItem.title,
        description: updatedItem.description,
        start_date: updatedItem.startDate,
        end_date: updatedItem.endDate,
        platform: updatedItem.platform as 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'facebook',
        content_type: updatedItem.type as 'post' | 'story' | 'reel' | 'video' | 'carrusel' | 'live' | 'tweet',
        status: updatedItem.status,
        objectives: updatedItem.objectives
      }
      
      
      const result = await updateSchedule(updatedItem.id, updateData)
            
      if (result) {
        // Recargar los datos después de una actualización exitosa
        await loadSchedules();
      } else {
        console.error('🔍 CampaignProgramming: Update failed - no result returned');
        throw new Error('Update failed - no result returned');
      }
    } catch (error) {
      console.error("🔍 CampaignProgramming: Error updating content:", error)
      throw error; // Re-throw to let the modal handle it
    }
  }

  const handleAddContent = async (newItem: ContentItem) => {
    try {
      
      
      // Find the influencer data from campaign influencers
      const campaignInfluencer = (campaignInfluencers || []).find(ci => 
        ci.influencers.name === newItem.influencer.name
      )
      
      if (!campaignInfluencer) {
        throw new Error("Influencer not found in campaign")
      }
      
      // Convert ContentItem to database format
      const createData = {
        campaign_id: campaign.id,
        influencer_id: campaignInfluencer.influencer_id,
        title: newItem.title,
        description: newItem.description,
        start_date: newItem.startDate,
        end_date: newItem.endDate,
        platform: newItem.platform.toLowerCase() as 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'facebook',
        content_type: newItem.type.toLowerCase() as 'post' | 'story' | 'reel' | 'video' | 'carrusel' | 'live' | 'tweet',
        status: newItem.status,
        influencer_name: newItem.influencer.name,
        influencer_handle: newItem.influencer.handle,
        influencer_avatar: newItem.influencer.image,
        objectives: newItem.objectives
      }
      
      
      const result = await createSchedule(createData)
            
      if (result) {
        // Recargar los datos después de una creación exitosa
        await loadSchedules();
      } else {
        console.error('🔍 CampaignProgramming: Creation failed - no result returned');
        throw new Error('Creation failed - no result returned');
      }
    } catch (error) {
      console.error("🔍 CampaignProgramming: Error adding content:", error)
      throw error; // Re-throw to let the modal handle it
    }
  }

  const handleDeleteContent = async (itemId: string) => {
    try {
      
      
      const result = await deleteSchedule(itemId)
      
      
      if (result) {
        
        // Recargar los datos después de una eliminación exitosa
        await loadSchedules();
      } else {
        console.error('🔍 CampaignProgramming: Deletion failed - no result returned');
        throw new Error('Deletion failed - no result returned');
      }
    } catch (error) {
      console.error("🔍 CampaignProgramming: Error deleting content:", error)
      throw error; // Re-throw to let the modal handle it
    }
  }

  // Handle export to Excel
  const handleExportToExcel = async () => {
    try {
      await exportCampaignScheduleToExcel(campaign.name, filteredContent)
      showToast({
        title: "Éxito",
        description: "Programación exportada correctamente",
      })
    } catch (error) {
      console.error('Error exporting schedule:', error)
      showToast({
        title: "Error",
        description: "No se pudo exportar la programación",
        variant: "destructive",
      })
    }
  }

  // Handle tab changes
  const handleTabChange = (value: string) => {
    setCurrentView(value as ViewType)
  }

  return (
    <Tabs value={currentView} onValueChange={handleTabChange}>
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Programación de Contenidos
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Gestiona y visualiza el contenido programado para esta campaña
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <Input
                  placeholder="Buscar contenido"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-[200px] !border-gray-300 text-black placeholder:text-gray-500 bg-white"
                />
                <FilterPanel
                  onApplyFilters={handleApplyFilters}
                  onResetFilters={handleResetFilters}
                  currentFilters={filters}
                  campaignInfluencers={campaignInfluencers}
                />
                <Button
                  onClick={() => setIsEditModalOpen(true)}
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Editar
                </Button>
                <Button
                  onClick={() => setIsAddModalOpen(true)}
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Agregar
                </Button>
                <Button
                  onClick={() => setIsBulkUploadModalOpen(true)}
                  variant="outline"
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Importar Excel
                </Button>
                <Button
                  onClick={handleExportToExcel}
                  variant="outline"
                  className="border-green-300 text-green-700 hover:bg-green-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
            
            {/* Botones de navegación en la segunda fila, alineados a la izquierda */}
            <div className="flex justify-start">
              <TabsList className="bg-blue-100 p-1 border border-blue-200 shadow-sm rounded-lg">
                <TabsTrigger
                  value="gantt"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white px-3 h-8"
                >
                  Gantt
                </TabsTrigger>
                <TabsTrigger
                  value="list"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white px-3 h-8"
                >
                  Lista
                </TabsTrigger>
                <TabsTrigger
                  value="calendar"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white px-3 h-8"
                >
                  Calendario
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <TabsContent value="gantt" className="m-0">
            <GanttControls
              zoomLevel={zoomLevel}
              setZoomLevel={setZoomLevel}
              startDate={ganttStartDate}
              endDate={ganttEndDate}
              onNavigateBackward={navigateBackward}
              onNavigateForward={navigateForward}
            />
            <GanttView
              filteredContent={filteredContent}
              timelineColumns={timelineColumns}
              calculateCardPosition={calculateCardPosition}
              onCardClick={handleCardClick}
              zoomLevel={zoomLevel}
              campaignId={campaign.id}
            />
          </TabsContent>

          <TabsContent value="list" className="m-0">
            <ListView filteredContent={filteredContent} campaignId={campaign.id} />
          </TabsContent>

          <TabsContent value="calendar" className="m-0">
            <CalendarView filteredContent={filteredContent} />
          </TabsContent>
        </CardContent>
        
        {/* Leyenda de estados - Solo visible en vista Gantt */}
        {currentView === "gantt" && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-6 text-sm text-gray-700">
              <span className="font-medium">Leyenda:</span>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Completado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                <span>Pendiente</span>
              </div>
            </div>
          </div>
        )}
      </Card>
      
      {/* Edit Content Modal */}
      <EditContentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        contentItems={contentItems}
        onSave={handleSaveContent}
        onDelete={handleDeleteContent}
        campaignInfluencers={campaignInfluencers}
      />
      <AddContentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddContent}
        campaignInfluencers={campaignInfluencers}
      />
      <BulkUploadModal
        isOpen={isBulkUploadModalOpen}
        onClose={() => setIsBulkUploadModalOpen(false)}
        campaignId={campaign.id}
        onSuccess={() => {
          loadSchedules();
          setIsBulkUploadModalOpen(false);
        }}
      />
    </Tabs>
  )
} 