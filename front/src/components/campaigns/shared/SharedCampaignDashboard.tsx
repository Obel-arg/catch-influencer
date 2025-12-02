"use client"

import React from "react"
import { CampaignDashboard } from "@/components/campaigns/campaign-views/dashboard"
import { useCampaignContext } from "@/contexts/CampaignContext"
import { Loader2, Share2 } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export const SharedCampaignDashboard = () => {
  const { campaign, loading, error } = useCampaignContext()

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-500" />
          <p className="text-gray-500 font-medium">Cargando campaña compartida...</p>
        </div>
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Campaña no encontrada'}</p>
          <p className="text-sm text-gray-500">El enlace puede ser inválido o la campaña ha sido eliminada.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-gradient-to-b from-blue-50 to-white">
      {/* Header with campaign name */}
      <header className="sticky top-0 z-10 border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="flex h-16 items-center gap-3 px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Avatar className="h-9 w-9 rounded-md">
              <AvatarFallback className="rounded-md bg-purple-100 text-purple-700 text-sm">
                {campaign.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-semibold text-base text-gray-800">{campaign.name}</h1>
              {campaign.description && (
                <p className="text-xs text-gray-500 line-clamp-1">{campaign.description}</p>
              )}
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 rounded-full">
              <Share2 className="h-3.5 w-3.5 text-blue-600" />
              <span className="text-xs text-blue-600 font-medium">Vista compartida</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col p-4 md:p-6">
        <CampaignDashboard campaign={campaign} />
      </main>

      <footer className="border-t border-gray-200 bg-white py-4">
        <div className="px-4 md:px-6 text-center">
          <p className="text-xs text-gray-500">
            Powered by Catch Influencer • Vista de solo lectura
          </p>
        </div>
      </footer>
    </div>
  )
}
