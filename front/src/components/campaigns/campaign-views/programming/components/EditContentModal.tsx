"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Search, Edit, Calendar, User, Monitor, Type, Target, Trash2 } from "lucide-react"
import { ContentItem, ContentStatus } from "../types"

interface CampaignInfluencer {
  id: string;
  campaign_id: string;
  influencer_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  payment_status: 'pending' | 'paid' | 'cancelled';
  assigned_budget: number;
  actual_cost: number;
  start_date: string;
  end_date: string;
  content_requirements: string;
  deliverables: string;
  notes: string;
  created_at: string;
  updated_at: string;
  influencers: {
    id: string;
    name: string;
    location: string;
    categories: string[];
    status: string;
    created_by: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    metadata: any;
    creator_id: string;
    main_social_platform: string;
    followers_count: number;
    average_engagement_rate: number;
    content_niches: string[];
    social_platforms: any;
    platform_info: any;
    avatar: string;
    is_verified: boolean;
    language: string;
  };
}

interface EditContentModalProps {
  isOpen: boolean
  onClose: () => void
  contentItems: ContentItem[]
  onSave: (updatedItem: ContentItem) => void
  onDelete: (itemId: string) => void
  campaignInfluencers: CampaignInfluencer[]
}

interface FilterState {
  status: string
  platform: string
  type: string
  influencer: string
}

export function EditContentModal({ isOpen, onClose, contentItems, onSave, onDelete, campaignInfluencers }: EditContentModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<FilterState>({
    status: "all",
    platform: "all",
    type: "all",
    influencer: "all"
  })
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<Partial<ContentItem>>({})
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<ContentItem | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset modal state when opening
  useEffect(() => {
    if (isOpen) {
      setIsEditing(false)
      setSelectedItem(null)
      setEditForm({})
      setError(null)
      setSearchQuery("")
      setFilters({
        status: "all",
        platform: "all",
        type: "all",
        influencer: "all"
      })
    }
  }, [isOpen])

  // Función para normalizar plataforma de minúsculas a formato UI
  const normalizePlatformForUI = (platform?: string): string => {
    if (!platform) return 'Sin plataforma'
    
    const platformMap: { [key: string]: string } = {
      'instagram': 'Instagram',
      'youtube': 'YouTube',
      'tiktok': 'TikTok',
      'twitter': 'Twitter',
      'facebook': 'Facebook'
    }
    return platformMap[platform.toLowerCase()] || platform
  }

  // Función para normalizar tipo de contenido de minúsculas a formato UI
  const normalizeTypeForUI = (type?: string): string => {
    if (!type) return 'Sin tipo'
    
    const typeMap: { [key: string]: string } = {
      'post': 'Post',
      'reel': 'Reel',
      'story': 'Story',
      'stories': 'Stories',
      'video': 'Video',
      'carrusel': 'Carrusel',
      'live': 'Live'
    }
    return typeMap[type.toLowerCase()] || type
  }

  // Función para convertir formato UI a minúsculas para la base de datos
  const normalizePlatformForDB = (platform?: string): string => {
    if (!platform || platform === 'Sin plataforma') return ''
    
    const platformMap: { [key: string]: string } = {
      'Instagram': 'instagram',
      'YouTube': 'youtube',
      'TikTok': 'tiktok',
      'Twitter': 'twitter',
      'Facebook': 'facebook'
    }
    return platformMap[platform] || platform.toLowerCase()
  }

  // Función para convertir formato UI a minúsculas para la base de datos
  const normalizeTypeForDB = (type?: string): string => {
    if (!type || type === 'Sin tipo') return ''
    
    const typeMap: { [key: string]: string } = {
      'Post': 'post',
      'Reel': 'reel',
      'Story': 'story',
      'Stories': 'stories',
      'Video': 'video',
      'Carrusel': 'carrusel',
      'Live': 'live'
    }
    return typeMap[type] || type.toLowerCase()
  }

  // Filter content items
  const filteredItems = contentItems.filter((item) => {
    const matchesSearch = searchQuery === "" || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.influencer.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = filters.status === "all" || item.status === filters.status
    
    const normalizedPlatform = normalizePlatformForUI(item.platform)
    const matchesPlatform = filters.platform === "all" || 
      (normalizedPlatform !== 'Sin plataforma' && normalizedPlatform === filters.platform)
    
    const normalizedType = normalizeTypeForUI(item.type)
    const matchesType = filters.type === "all" || 
      (normalizedType !== 'Sin tipo' && normalizedType === filters.type)
    
    const matchesInfluencer = filters.influencer === "all" || item.influencer.id === filters.influencer
    
    return matchesSearch && matchesStatus && matchesPlatform && matchesType && matchesInfluencer
  })

  // Get unique values for filters
  const platforms = [...new Set(contentItems.map(item => normalizePlatformForUI(item.platform)))].filter(p => p !== 'Sin plataforma')
  const types = [...new Set(contentItems.map(item => normalizeTypeForUI(item.type)))].filter(t => t !== 'Sin tipo')
  const influencers = [...new Set(contentItems.map(item => item.influencer.id))]

  const handleEdit = (item: ContentItem) => {
    setSelectedItem(item)
    
    setEditForm({
      title: item.title,
      platform: normalizePlatformForUI(item.platform),
      type: normalizeTypeForUI(item.type),
      status: item.status,
      startDate: item.startDate,
      endDate: item.endDate,
      description: item.description || "",
      influencer: item.influencer,
      objectives: item.objectives
    })
    
    setIsEditing(true)
  }

  // Función para abrir el modal en modo lista
  const handleOpenModal = () => {
    setIsEditing(false)
    setSelectedItem(null)
    setEditForm({})
    setError(null)
  }

  const handleSave = async () => {
    // Validar que todos los campos requeridos estén completos
    if (!editForm.title || !editForm.platform || !editForm.type || !editForm.startDate || !editForm.endDate || !editForm.influencer?.name || !editForm.description) {
      setError("Por favor completa todos los campos requeridos");
      return;
    }

    try {
      setIsSaving(true)
      setError(null)
      
      // Crear objetivos basados en los inputs (ahora siempre vacío ya que removimos los inputs)
      const objectives: any[] = []

      // Normalizar los datos para la base de datos
      const updatedItem: ContentItem = {
        ...selectedItem!,
        title: editForm.title,
        platform: normalizePlatformForDB(editForm.platform),
        type: normalizeTypeForDB(editForm.type),
        status: editForm.status as ContentStatus,
        startDate: editForm.startDate,
        endDate: editForm.endDate,
        description: editForm.description || "",
        influencer: {
          id: editForm.influencer?.id || selectedItem!.influencer.id,
          name: editForm.influencer?.name || selectedItem!.influencer.name,
          handle: editForm.influencer?.handle || selectedItem!.influencer.handle,
          image: editForm.influencer?.image || selectedItem!.influencer.image
        },
        objectives: objectives
      }
      
      await onSave(updatedItem)
      // Volver a la vista de lista después de guardar
      setSelectedItem(null)
      setIsEditing(false)
      setEditForm({})
      setError(null)
    } catch (error) {
      console.error('🔍 EditContentModal: Error saving content:', error);
      setError(error instanceof Error ? error.message : 'Error al guardar el contenido');
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (isEditing) {
      // Si estamos en modo edición, volver a la lista
      setSelectedItem(null)
      setIsEditing(false)
      setEditForm({})
      setError(null)
    } else {
      // Si estamos en la lista, cerrar el modal
      onClose()
    }
  }

  const handleDeleteClick = (item: ContentItem) => {
    setItemToDelete(item)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      onDelete(itemToDelete.id)
      setIsDeleteModalOpen(false)
      setItemToDelete(null)
    }
  }

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false)
    setItemToDelete(null)
  }

  const getStatusColor = (status: ContentStatus) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800"
      case "in-progress": return "bg-amber-100 text-amber-800"
      case "pending": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: ContentStatus) => {
    switch (status) {
      case "completed": return "Completado"
      case "in-progress": return "En progreso"
      case "pending": return "Pendiente"
      default: return status
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
       <DialogContent className={`max-w-4xl max-h-[80vh] flex flex-col text-[15px] ${isEditing ? '' : ''}`}>
         <DialogHeader className="flex-shrink-0">
           <DialogTitle className="text-xl font-bold">
             {isEditing ? "Editar Contenido" : "Gestionar Contenidos"}
           </DialogTitle>
         </DialogHeader>

                 {!isEditing ? (
           <div className="flex flex-col flex-1 min-h-0">
             {/* Search and Filters - Moved to top */}
             <div className="flex flex-col gap-3 mb-4 flex-shrink-0">
              {/* Search box at the very top */}
               <div className="flex items-center gap-4">
                <div className="relative flex-1">
                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar por título o influencer..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                     className="pl-10 !border-gray-300 h-10"
                  />
                </div>
              </div>
              
              {/* Filters below search */}
              <div className="flex gap-4">
                 <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                   <SelectTrigger className="w-40 text-left justify-start !border-gray-300 h-10">
                     <SelectValue placeholder="Estado" />
                   </SelectTrigger>
                                       <SelectContent className="!border-gray-300">
                      <SelectItem value="all">Estados</SelectItem>
                      <SelectItem value="completed">Completado</SelectItem>
                      <SelectItem value="in-progress">En progreso</SelectItem>
                      <SelectItem value="pending">Pendiente</SelectItem>
                    </SelectContent>
                 </Select>

                 <Select value={filters.platform} onValueChange={(value) => setFilters(prev => ({ ...prev, platform: value }))}>
                   <SelectTrigger className="w-40 text-left justify-start !border-gray-300 h-10">
                     <SelectValue placeholder="Plataforma" />
                   </SelectTrigger>
                                       <SelectContent className="!border-gray-300">
                      <SelectItem value="all">Plataformas</SelectItem>
                      {platforms.map(platform => (
                        <SelectItem key={platform} value={platform}>{platform}</SelectItem>
                      ))}
                    </SelectContent>
                 </Select>

                 <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
                   <SelectTrigger className="w-40 text-left justify-start !border-gray-300 h-10">
                     <SelectValue placeholder="Tipo" />
                   </SelectTrigger>
                                       <SelectContent className="!border-gray-300">
                      <SelectItem value="all">Tipos</SelectItem>
                      {types.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                 </Select>
               </div>
            </div>

                                                   {/* Content Items List */}
                           <div className="flex-1 overflow-y-auto max-h-[50vh]">
                <div className="space-y-2 pr-2">
                 {filteredItems.map((item) => (
                    <Card key={item.id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="min-h-[80px] px-4 py-2 flex items-center">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <h3 className="font-medium text-sm truncate">{item.title}</h3>
                            <p className="text-xs text-gray-500 truncate">{item.influencer.name}</p>
                          </div>
                         <div className="flex items-center gap-3">
                           <Badge className={getStatusColor(item.status)}>
                             {getStatusText(item.status)}
                           </Badge>
                           <Button
                             size="sm"
                             variant="ghost"
                             onClick={() => handleEdit(item)}
                             className="h-8 w-8 p-0"
                           >
                             <Edit className="h-4 w-4" />
                           </Button>
                           <Button
                             size="sm"
                             variant="ghost"
                             onClick={() => handleDeleteClick(item)}
                             className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                           >
                             <Trash2 className="h-4 w-4" />
                           </Button>
                         </div>
                       </div>
                     </CardContent>
                   </Card>
                 ))}
               </div>
              
              {filteredItems.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No se encontraron contenidos con los filtros aplicados
                </div>
              )}
            </div>
          </div>
                                   ) : (
            /* Edit Form */
            <div className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-6 pt-0 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title" className="text-sm font-medium text-gray-700 mb-2 block">Título del contenido</Label>
                      <Input
                        id="title"
                        value={editForm.title || ""}
                        onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Título del contenido"
                        className="!border-gray-300 focus:!border-blue-500 focus:!ring-blue-500"
                      />
                    </div>

                    <div>
                      <Label htmlFor="influencerName" className="text-sm font-medium text-gray-700 mb-2 block">Seleccionar influencer</Label>
                      <Select 
                        value={editForm.influencer?.name || ""} 
                        onValueChange={(value) => setEditForm(prev => ({ 
                          ...prev, 
                          influencer: { ...prev.influencer!, name: value }
                        }))}
                      >
                        <SelectTrigger className="!border-gray-300 focus:!border-blue-500 focus:!ring-blue-500">
                          <SelectValue placeholder="Seleccionar influencer" />
                        </SelectTrigger>
                        <SelectContent className="!border-gray-300">
                          {campaignInfluencers.map(campaignInfluencer => (
                            <SelectItem key={campaignInfluencer.influencer_id} value={campaignInfluencer.influencers.name}>
                              {campaignInfluencer.influencers.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="type" className="text-sm font-medium text-gray-700 mb-2 block">Tipo de contenido</Label>
                      <Select 
                        value={editForm.type || ""} 
                        onValueChange={(value) => setEditForm(prev => ({ ...prev, type: value }))}
                        disabled={!editForm.platform}
                      >
                        <SelectTrigger className={`!border-gray-300 focus:!border-blue-500 focus:!ring-blue-500 ${!editForm.platform ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}`}>
                          <SelectValue placeholder={!editForm.platform ? "Seleccionar tipo" : "Seleccionar tipo"} />
                        </SelectTrigger>
                        <SelectContent className="!border-gray-300">
                          {editForm.platform === "Instagram" && (
                            <>
                              <SelectItem value="Post">Post</SelectItem>
                              <SelectItem value="Reel">Reel</SelectItem>
                              <SelectItem value="Story">Story</SelectItem>
                              <SelectItem value="Carrusel">Carrusel</SelectItem>
                            </>
                          )}
                          {editForm.platform === "YouTube" && (
                            <>
                              <SelectItem value="Video">Video</SelectItem>
                              <SelectItem value="Short">Short</SelectItem>
                            </>
                          )}
                          {editForm.platform === "TikTok" && (
                            <SelectItem value="Video">Video</SelectItem>
                          )}
                          {editForm.platform === "Twitter" && (
                            <SelectItem value="Post">Post</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="date" className="text-sm font-medium text-gray-700 mb-2 block">Fecha</Label>
                      <Input
                        id="date"
                        type="date"
                        value={editForm.startDate || ""}
                        onChange={(e) => setEditForm(prev => ({ 
                          ...prev, 
                          startDate: e.target.value,
                          endDate: e.target.value
                        }))}
                        className="!border-gray-300 focus:!border-blue-500 focus:!ring-blue-500"
                      />
                    </div>

                    <div>
                      <Label htmlFor="platform" className="text-sm font-medium text-gray-700 mb-2 block">Plataforma</Label>
                      <Select 
                        value={editForm.platform || ""} 
                        onValueChange={(value) => setEditForm(prev => ({ 
                          ...prev, 
                          platform: value,
                          type: "" // Limpiar el tipo cuando cambie la plataforma
                        }))}
                      >
                        <SelectTrigger className="!border-gray-300 focus:!border-blue-500 focus:!ring-blue-500">
                          <SelectValue placeholder="Seleccionar plataforma" />
                        </SelectTrigger>
                        <SelectContent className="!border-gray-300">
                          <SelectItem value="Instagram">Instagram</SelectItem>
                          <SelectItem value="YouTube">YouTube</SelectItem>
                          <SelectItem value="TikTok">TikTok</SelectItem>
                          <SelectItem value="Twitter">Twitter</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700 mb-2 block">Descripción *</Label>
                  <Input
                    id="description"
                    value={editForm.description || ""}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descripción del contenido..."
                    className="!border-gray-300 focus:!border-blue-500 focus:!ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 pb-4">
                {error && (
                  <div className="flex-1 text-red-600 text-sm">
                    {error}
                  </div>
                )}
                <Button 
                  variant="outline" 
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={isSaving || !editForm.title || !editForm.platform || !editForm.type || !editForm.startDate || !editForm.endDate || !editForm.influencer?.name || !editForm.description}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isSaving ? "Guardando..." : "Guardar cambios"}
                </Button>
              </div>
            </div>
         )}
      </DialogContent>
    </Dialog>

    {/* Delete Confirmation Modal */}
    <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Confirmar eliminación
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-gray-600">
            ¿Estás seguro de que quieres eliminar el contenido "{itemToDelete?.title}"?
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Esta acción no se puede deshacer.
          </p>
        </div>
        <div className="flex justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={handleCancelDelete}
            className="px-4 py-2 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirmDelete}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white"
          >
            Eliminar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  )
} 