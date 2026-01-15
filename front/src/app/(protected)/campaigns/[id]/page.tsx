"use client"

import React, { useState, Suspense, useMemo, useEffect } from "react"
import { useParams, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  Calendar,
  Download,
  LayoutDashboard,
  Image,
  Users,
  CalendarDays,
  Loader2,
  Share2,
  ChevronDown,
  FileSpreadsheet,
  FileText,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CampaignProvider, useCampaignContext } from "@/contexts/CampaignContext"
import { CampaignStatus } from "@/components/campaigns/campaign-components"
import { CampaignDashboard } from "@/components/campaigns/campaign-views/dashboard"
import { CampaignPosts } from "@/components/campaigns/campaign-views/posts"
import { CampaignInfluencers } from "@/components/campaigns/campaign-views/influencers"
import { CampaignProgramming } from "@/components/campaigns/campaign-views/programming"
import { formatDateRange } from "@/utils/campaign"
import { useCampaignExport, ExportFormat } from "@/hooks/campaign/useCampaignExport"
import { useCampaignPosts } from "@/hooks/campaign/useCampaignPosts"
import { toast } from "sonner"
import { generateShareLink } from "@/services/campaign-share.service"

type ViewType = "dashboard" | "posts" | "influencers" | "programming"

// 🚀 OPTIMIZACIÓN CRÍTICA: Skeleton/Loading component para feedback instantáneo
const CampaignLoadingSkeleton = () => {
  const searchParams = useSearchParams()
  
  // 🎯 Lógica de redirect: determinar URL de vuelta
  const getBackUrl = () => {
    const redirect = searchParams.get('redirect')
    const brandId = searchParams.get('brandId')
    const tab = searchParams.get('tab')
    
    if (redirect === 'brands' && brandId) {
      return `/brands/${brandId}${tab ? `?tab=${tab}` : ''}`
    }
    return '/campaigns'
  }
  
  const getBackLabel = () => {
    const redirect = searchParams.get('redirect')
    return redirect === 'brands' ? 'Volver a marca' : 'Volver a campañas'
  }

  return (
  <div className="flex min-h-screen w-full flex-col bg-gradient-to-b from-blue-50 to-white">
    <header className="sticky top-0 z-10 flex flex-col border-b border-gray-100 bg-white/80 backdrop-blur-sm">
      <div className="flex h-12 items-center gap-3 px-4 md:px-6">
                  <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700 hover:bg-gray-50" asChild>
            <Link href={getBackUrl()}>
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="sr-only">{getBackLabel()}</span>
            </Link>
          </Button>

        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7 rounded-md">
            <AvatarFallback className="rounded-md bg-purple-100 text-purple-700 text-xs animate-pulse">
              <div className="w-full h-full bg-gray-200 rounded"></div>
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="animate-pulse bg-gray-200 rounded h-4 w-32"></div>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="animate-pulse bg-gray-200 rounded h-3 w-24"></div>
          <div className="animate-pulse bg-gray-200 rounded h-5 w-16"></div>
          <Button variant="ghost" size="sm" className="h-7 gap-1 text-gray-500" disabled>
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline text-xs">Exportar</span>
          </Button>

        </div>
      </div>

      <nav className="flex px-4 md:px-6">
        <div className="flex space-x-1 border-b border-transparent">
          {["Dashboard", "Posts", "Influencers", "Programación"].map((label, index) => (
            <div
              key={index}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-400"
            >
              <div className="animate-pulse bg-gray-200 rounded w-4 h-4"></div>
              {label}
            </div>
          ))}
        </div>
      </nav>
    </header>

    <main className="flex flex-1 flex-col p-4 md:p-6">
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-500" />
          <p className="text-gray-500 font-medium">Cargando campaña...</p>
          <p className="text-sm text-gray-400 mt-1">Obteniendo la información más reciente</p>
        </div>
      </div>
    </main>
  </div>
  );
};

function CampaignDetailContent() {
  const { campaign, loading, error, influencersLoading, postsLoading, influencers, posts: contextPosts } = useCampaignContext()
  const searchParams = useSearchParams()
  const { exportCampaign, isExporting, exportError } = useCampaignExport()
  const { posts, loading: postsLoadingFromHook } = useCampaignPosts(campaign?.id || '')

  // 🎯 NUEVO: Determinar tab inicial basado en parámetros de URL
  const getInitialView = (): ViewType => {
    const tab = searchParams.get('tab')
    if (tab === 'influencers') return 'influencers'
    if (tab === 'posts') return 'posts'
    if (tab === 'programming') return 'programming'
    return 'dashboard'
  }

  const [activeView, setActiveView] = useState<ViewType>(getInitialView())
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [isGeneratingLink, setIsGeneratingLink] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  
  // 🎯 Verificar si TODOS los datos están completamente cargados
  const isAllDataLoaded = useMemo(() => {
    // Verificar que la campaña esté cargada y tenga datos esenciales
    if (!campaign || loading) return false
    
    // Verificar que los influencers estén cargados (puede ser array vacío, pero debe estar cargado)
    if (influencersLoading) return false
    
    // Verificar que los posts del contexto estén cargados
    if (postsLoading) return false
    
    // Verificar que los posts del hook estén cargados
    if (postsLoadingFromHook) return false
    
    // Verificar que tengamos posts disponibles (puede ser array vacío, pero debe estar definido)
    if (!posts || posts === undefined) return false
    
    // Pequeño delay adicional para asegurar que los componentes hijos hayan terminado de renderizar
    // Esto se maneja con un estado adicional
    return true
  }, [campaign, loading, influencersLoading, postsLoading, postsLoadingFromHook, posts])
  
  // Estado para rastrear si hemos esperado el tiempo suficiente después de que los datos se cargaron
  const [dataReadyDelay, setDataReadyDelay] = useState(false)
  
  useEffect(() => {
    if (isAllDataLoaded) {
      // Esperar 5 segundos adicionales para asegurar que todos los componentes hijos hayan terminado de cargar
      const timer = setTimeout(() => {
        setDataReadyDelay(true)
      }, 6000)
      
      return () => clearTimeout(timer)
    } else {
      setDataReadyDelay(false)
    }
  }, [isAllDataLoaded])
  
  // 🎯 Lógica de redirect: determinar URL de vuelta
  const getBackUrl = () => {
    const redirect = searchParams.get('redirect')
    const brandId = searchParams.get('brandId')
    const tab = searchParams.get('tab')
    
    if (redirect === 'brands' && brandId) {
      return `/brands/${brandId}${tab ? `?tab=${tab}` : ''}`
    }
    return '/campaigns'
  }
  
  const getBackLabel = () => {
    const redirect = searchParams.get('redirect')
    return redirect === 'brands' ? 'Volver a marca' : 'Volver a campañas'
  }

  const handleGenerateShareLink = async () => {
    if (!campaign) return

    try {
      setIsGeneratingLink(true)
      const result = await generateShareLink(campaign.id)
      setShareUrl(result.shareUrl)
      setShowShareModal(true)
    } catch (error) {
      console.error('Error generating share link:', error)
      toast.error('Error al generar enlace de compartir')
    } finally {
      setIsGeneratingLink(false)
    }
  }

  const handleCopyUrl = () => {
    if (!shareUrl) return

    const textArea = document.createElement('textarea')
    textArea.value = shareUrl
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    textArea.remove()
    toast.success('Enlace copiado')
  }

  const handleExport = async (format: ExportFormat) => {
    if (campaign && posts) {
      try {
        await exportCampaign(campaign, posts, format);
        toast.success(`${format === 'pdf' ? 'PDF' : 'Excel'} exportado exitosamente`);
      } catch (error) {
        toast.error(`Error al exportar el ${format === 'pdf' ? 'PDF' : 'Excel'}`);
      }
    } else {
      toast.error('No hay datos para exportar');
    }
  }

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: "posts", label: "Posts", icon: <Image className="h-4 w-4" /> },
    { id: "influencers", label: "Influencers", icon: <Users className="h-4 w-4" /> },
    { id: "programming", label: "Programación", icon: <CalendarDays className="h-4 w-4" /> },
  ]

  // 🚀 OPTIMIZACIÓN CRÍTICA: Solo mostrar error real si no hay datos y hay error
  if (error && !campaign && !loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button asChild>
            <Link href={getBackUrl()}>{getBackLabel()}</Link>
          </Button>
        </div>
      </div>
    )
  }

  // 🚀 OPTIMIZACIÓN CRÍTICA: Si no hay campaña, mostrar skeleton instantáneo
  if (!campaign) {
    return <CampaignLoadingSkeleton />;
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-gradient-to-b from-blue-50 to-white">
      {/* Header compacto con navegación integrada */}
      <header className="sticky top-0 z-10 flex flex-col border-b border-gray-100 bg-white/80 backdrop-blur-sm rounded-lg">
        {/* Barra superior con información de campaña y acciones */}
        <div className="flex h-12 items-center gap-3 px-4 md:px-6">
                  <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700 hover:bg-gray-50" asChild>
          <Link href={getBackUrl()}>
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="sr-only">{getBackLabel()}</span>
          </Link>
        </Button>

          <div className="flex items-center gap-2">
            <Avatar className="h-7 w-7 rounded-md">
              <AvatarFallback className="rounded-md bg-purple-100 text-purple-700 text-xs">
                {campaign.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-medium text-sm text-gray-700">{campaign.name}</h1>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {campaign.start_date && campaign.end_date && (
              <span className="text-xs text-gray-400 flex items-center gap-1 mr-2">
                <Calendar className="h-3 w-3" />
                {formatDateRange(campaign.start_date, campaign.end_date)}
              </span>
            )}
            
            <CampaignStatus status={campaign.status} />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  disabled={
                    isExporting || 
                    !isAllDataLoaded || 
                    !dataReadyDelay ||
                    !campaign || 
                    !posts
                  }
                  title={
                    !isAllDataLoaded || !dataReadyDelay
                      ? 'Cargando datos de la campaña...'
                      : 'Exportar campaña'
                  }
                >
                  {isExporting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Download className="h-3.5 w-3.5" />
                  )}
                  <span className="hidden sm:inline text-xs">
                    {isExporting ? 'Exportando...' : 'Exportar'}
                  </span>
                  {!isExporting && <ChevronDown className="h-3 w-3 ml-0.5" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 bg-white">
                <DropdownMenuItem
                  onClick={() => handleExport('excel')}
                  className="cursor-pointer"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
                  <span>Exportar Excel</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleExport('pdf')}
                  className="cursor-pointer"
                >
                  <FileText className="h-4 w-4 mr-2 text-red-600" />
                  <span>Exportar PDF</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              onClick={handleGenerateShareLink}
              disabled={isGeneratingLink}
            >
              {isGeneratingLink ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Share2 className="h-3.5 w-3.5" />
              )}
              <span className="hidden sm:inline text-xs">
                {isGeneratingLink ? 'Generando...' : 'Compartir'}
              </span>
            </Button>

          </div>
        </div>

        {/* Navegación más sutil */}
        <nav className="flex px-4 md:px-6 border-b border-gray-200">
          <div className="flex mt-2">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as ViewType)}
                className={`
                  flex items-center gap-1.5 px-4 py-4 text-xs font-medium transition-colors
                  ${
                    activeView === item.id
                      ? "border-b-2 border-gray-800 text-gray-800 relative -mb-[2px]"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50/50"
                  }
                `}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </nav>
      </header>

      {/* Contenido principal */}
      <main className="flex flex-1 flex-col p-4 md:p-6">
        {/* 🚀 OPTIMIZACIÓN: Siempre mostrar componentes, ellos manejan su loading */}
        {activeView === "dashboard" && <CampaignDashboard campaign={campaign} />}
        {activeView === "posts" && <CampaignPosts campaign={campaign} />}
        {activeView === "influencers" && <CampaignInfluencers campaign={campaign} />}
        {activeView === "programming" && <CampaignProgramming campaign={campaign} />}
      </main>

      {/* Share Modal */}
      {showShareModal && shareUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowShareModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Enlace de Compartir</h3>
            <div className="bg-gray-50 p-3 rounded border border-gray-200 mb-4">
              <p className="text-sm text-gray-700 break-all">{shareUrl}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCopyUrl} className="flex-1">
                Copiar Enlace
              </Button>
              <Button variant="outline" onClick={() => setShowShareModal(false)}>
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function CampaignDetailPage() {
  const params = useParams()
  const campaignId = params.id as string

  return (
    <Suspense fallback={<CampaignLoadingSkeleton />}>
      <CampaignProvider campaignId={campaignId}>
        <CampaignDetailContent />
      </CampaignProvider>
    </Suspense>
  )
} 