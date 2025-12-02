"use client"

import React, { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { SharedCampaignDashboard } from "@/components/campaigns/shared/SharedCampaignDashboard"
import { CampaignProvider } from "@/contexts/CampaignContext"
import { Loader2 } from "lucide-react"

export default function SharedCampaignPage() {
  const params = useParams()
  const token = params.token as string
  const [campaignId, setCampaignId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCampaignId = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'
        const response = await fetch(`${apiUrl}/campaigns/share/${token}`)

        if (!response.ok) {
          throw new Error('Invalid share link')
        }

        const data = await response.json()
        setCampaignId(data.campaign.id)
      } catch (err) {
        console.error('Error fetching campaign:', err)
        setError('Enlace inválido o campaña no encontrada')
      }
    }

    fetchCampaignId()
  }, [token])

  if (error) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <p className="text-sm text-gray-500">El enlace puede ser inválido o la campaña ha sido eliminada.</p>
        </div>
      </div>
    )
  }

  if (!campaignId) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-500" />
          <p className="text-gray-500 font-medium">Cargando campaña compartida...</p>
        </div>
      </div>
    )
  }

  return (
    <CampaignProvider campaignId={campaignId}>
      <SharedCampaignDashboard />
    </CampaignProvider>
  )
}
