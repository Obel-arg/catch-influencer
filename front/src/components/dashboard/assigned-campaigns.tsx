"use client";

import { cn } from "@/lib/utils"
import Link from "next/link"
import { Calendar, ArrowRight, Inbox } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// Tipo para las campañas asignadas
type AssignedCampaign = {
  id: string
  name: string
  brand: {
    id: string
    name: string
    logo: string
  }
  status: string
  startDate: string
  endDate: string
  metrics: {
    reach: string
    engagement: string
    conversion: string
  }
}

interface AssignedCampaignsProps {
  campaigns?: AssignedCampaign[]
  loading?: boolean
}

export function AssignedCampaigns({ campaigns = [], loading = false }: AssignedCampaignsProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Tus campañas asignadas</h2>
          <Button variant="ghost" size="sm" className="gap-1 text-blue-600" asChild>
            <Link href="/campaigns">
              Ver todas
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="rounded-md bg-gray-50 p-2">
                      <div className="h-3 w-full bg-gray-200 rounded animate-pulse mb-1"></div>
                      <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (campaigns.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Tus campañas asignadas</h2>
          <Button variant="ghost" size="sm" className="gap-1 text-blue-600" asChild>
            <Link href="/campaigns">
              Ver todas
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        <Card className="flex flex-col items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="rounded-full bg-gray-100 p-4">
              <Inbox className="h-8 w-8 text-gray-400" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-medium text-gray-900">No tienes campañas asignadas</h3>
              <p className="text-sm text-gray-500 max-w-sm">
                Cuando se te asignen campañas, aparecerán aquí para que puedas gestionarlas y ver su progreso.
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/campaigns">
                Explorar campañas disponibles
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Tus campañas asignadas</h2>
        <Button variant="ghost" size="sm" className="gap-1 text-blue-600" asChild>
          <Link href="/campaigns">
            Ver todas
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {campaigns.map((campaign) => (
          <Card key={campaign.id} className="overflow-hidden transition-all hover:shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Badge
                  className={cn(
                    campaign.status === "Activa" && "bg-green-100 text-green-800 border-green-200",
                    campaign.status === "Planificada" && "bg-blue-100 text-blue-800 border-blue-200",
                    campaign.status === "Finalizada" && "bg-gray-100 text-gray-800 border-gray-200",
                  )}
                >
                  {campaign.status}
                </Badge>
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="h-3 w-3 mr-1" />
                  {campaign.startDate} - {campaign.endDate}
                </div>
              </div>
              <CardTitle className="text-lg">{campaign.name}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <img
                  src={campaign.brand.logo || "/placeholder.svg"}
                  alt={campaign.brand.name}
                  className="h-4 w-4 rounded-full"
                />
                {campaign.brand.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-md bg-gray-50 p-2">
                  <p className="text-xs text-gray-500">Alcance</p>
                  <p className="font-medium">{campaign.metrics.reach}</p>
                </div>
                <div className="rounded-md bg-gray-50 p-2">
                  <p className="text-xs text-gray-500">Engagement</p>
                  <p className="font-medium">{campaign.metrics.engagement}</p>
                </div>
                <div className="rounded-md bg-gray-50 p-2">
                  <p className="text-xs text-gray-500">Conversión</p>
                  <p className="font-medium">{campaign.metrics.conversion}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full gap-1 text-blue-600" asChild>
                <Link href={`/campaigns/${campaign.id}`}>
                  Ver detalles
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
} 