"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
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

interface AddContentModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (newItem: ContentItem) => void
  campaignInfluencers: CampaignInfluencer[]
}

export function AddContentModal({ isOpen, onClose, onSave, campaignInfluencers }: AddContentModalProps) {
  const [formData, setFormData] = useState<Partial<ContentItem>>({
    title: "",
    platform: "",
    type: "",
    status: "pending",
    startDate: "",
    endDate: "",
    description: "",
    influencer: {
      id: "",
      name: "",
      handle: "",
      image: ""
    },
    objectives: []
  })

  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    // Validar que todos los campos requeridos estén completos
    if (!formData.title || !formData.platform || !formData.type || !formData.startDate || !formData.endDate || !formData.influencer?.name || !formData.description) {
      setError("Por favor completa todos los campos requeridos");
      return;
    }

    try {
      setIsSaving(true)
      setError(null)
      
      // Crear objetivos basados en los inputs (ahora siempre vacío ya que removimos los inputs)
      const objectives: any[] = []

      const newItem: ContentItem = {
        id: `content-${Date.now()}`, // Generate a temporary ID
        title: formData.title,
        platform: formData.platform,
        type: formData.type,
        status: "pending" as ContentStatus, // Siempre crear en estado "Pendiente"
        startDate: formData.startDate,
        endDate: formData.endDate,
        description: formData.description,
        influencer: {
          id: formData.influencer.id || `influencer-${Date.now()}`,
          name: formData.influencer.name,
          handle: formData.influencer.handle || "",
          image: formData.influencer.image || ""
        },
        objectives: objectives
      }
      
      await onSave(newItem)
      handleCancel()
    } catch (error) {
      console.error('🔍 AddContentModal: Error saving content:', error);
      setError(error instanceof Error ? error.message : 'Error al guardar el contenido');
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      title: "",
      platform: "",
      type: "",
      status: "pending",
      startDate: "",
      endDate: "",
      description: "",
      influencer: {
        id: "",
        name: "",
        handle: "",
        image: ""
      },
      objectives: []
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl flex flex-col max-h-[80vh] text-[15px]">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl font-bold">
            Agregar Nuevo Contenido
          </DialogTitle>
        </DialogHeader>

          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-6 pt-0 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                    <Label htmlFor="title" className="text-[13px] font-medium text-gray-700 mb-2 block">Título del contenido</Label>
                  <Input
                    id="title"
                    value={formData.title || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Título del contenido"
                      className="!border-gray-300 focus:!border-blue-500 focus:!ring-blue-500 h-10"
                  />
                </div>

                <div>
                    <Label htmlFor="influencerName" className="text-[13px] font-medium text-gray-700 mb-2 block">Seleccionar influencer</Label>
                  <Select 
                    value={formData.influencer?.name || ""} 
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      influencer: { ...prev.influencer!, name: value }
                    }))}
                  >
                      <SelectTrigger className="!border-gray-300 focus:!border-blue-500 focus:!ring-blue-500 h-10">
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
                    <Label htmlFor="type" className="text-[13px] font-medium text-gray-700 mb-2 block">Tipo de contenido</Label>
                  <Select 
                    value={formData.type || ""} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                    disabled={!formData.platform}
                  >
                      <SelectTrigger className={`!border-gray-300 focus:!border-blue-500 focus:!ring-blue-500 h-10 ${!formData.platform ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}`}>
                      <SelectValue placeholder={!formData.platform ? "Seleccionar tipo" : "Seleccionar tipo"} />
                    </SelectTrigger>
                    <SelectContent className="!border-gray-300">
                      {formData.platform === "Instagram" && (
                        <>
                          <SelectItem value="Post">Post</SelectItem>
                          <SelectItem value="Reel">Reel</SelectItem>
                          <SelectItem value="Story">Story</SelectItem>
                          <SelectItem value="Carrusel">Carrusel</SelectItem>
                        </>
                      )}
                      {formData.platform === "YouTube" && (
                        <>
                          <SelectItem value="Video">Video</SelectItem>
                          <SelectItem value="Short">Short</SelectItem>
                        </>
                      )}
                      {formData.platform === "TikTok" && (
                        <SelectItem value="Video">Video</SelectItem>
                      )}
                      {formData.platform === "Twitter" && (
                        <SelectItem value="Post">Post</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>


              </div>

              <div className="space-y-4">
                <div>
                    <Label htmlFor="date" className="text-[13px] font-medium text-gray-700 mb-2 block">Fecha</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.startDate || ""}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      startDate: e.target.value,
                      endDate: e.target.value
                    }))}
                      className="!border-gray-300 focus:!border-blue-500 focus:!ring-blue-500 h-10"
                  />
                </div>

                <div>
                    <Label htmlFor="platform" className="text-[13px] font-medium text-gray-700 mb-2 block">Plataforma</Label>
                  <Select 
                    value={formData.platform || ""} 
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      platform: value,
                      type: "" // Limpiar el tipo cuando cambie la plataforma
                    }))}
                  >
                      <SelectTrigger className="!border-gray-300 focus:!border-blue-500 focus:!ring-blue-500 h-10">
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
                <Label htmlFor="description" className="text-[13px] font-medium text-gray-700 mb-2 block">Descripción</Label>
                <Input
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción del contenido..."
                  className="!border-gray-300 focus:!border-blue-500 focus:!ring-blue-500 h-10"
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
              disabled={isSaving || !formData.title || !formData.platform || !formData.type || !formData.startDate || !formData.endDate || !formData.influencer?.name || !formData.description}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isSaving ? "Guardando..." : "Agregar contenido"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 