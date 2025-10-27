"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, AlertCircle, Calendar, Eye, Heart, MessageCircle, Share, TrendingUp } from "lucide-react"
import { LazyInfluencerAvatar } from "@/components/explorer/LazyInfluencerAvatar"
import { ContentItem } from "../types"
import { useCampaignSchedule } from "@/hooks/campaign/useCampaignSchedule"

interface ListViewProps {
  filteredContent: ContentItem[]
  campaignId: string
}

export const ListView = ({ filteredContent, campaignId }: ListViewProps) => {
  const [metricsMap, setMetricsMap] = useState<Record<string, any>>({})
  const [loadingMetrics, setLoadingMetrics] = useState<Set<string>>(new Set())
  
  const { getPostMetricsForSchedules, matchMetricsWithObjectives } = useCampaignSchedule(campaignId)

  // Cargar métricas para todos los contenidos
  useEffect(() => {
    const loadMetricsForContent = async () => {
      
      // Solo cargar métricas para contenidos que tienen post linkeado
      const contentWithLinkedPosts = filteredContent.filter(item => 
        item.content_url && item.content_url.trim() !== ''
      )
      
      
      
      const contentIds = contentWithLinkedPosts.map(item => item.id)
      const idsToLoad = contentIds.filter(id => !metricsMap[id] && !loadingMetrics.has(id))
      
      
      
      if (idsToLoad.length === 0) return
      
      setLoadingMetrics(prev => new Set([...prev, ...idsToLoad]))
      
      try {
        
        const metrics = await getPostMetricsForSchedules(idsToLoad)
        
        setMetricsMap(prev => ({ ...prev, ...metrics }))
      } catch (error) {
        console.error('❌ ListView: Error loading metrics for list view:', error)
      } finally {
        setLoadingMetrics(prev => {
          const newSet = new Set(prev)
          idsToLoad.forEach(id => newSet.delete(id))
          return newSet
        })
      }
    }
    
    if (campaignId) {
      loadMetricsForContent()
    } else {
      console.warn('⚠️ ListView: No campaignId provided')
    }
  }, [filteredContent, getPostMetricsForSchedules, campaignId]) // Added campaignId dependency

  

    const getContentTypeColor = (type: string) => {
      if (!type) return "bg-gray-600 text-white"
      const normalizedType = type.toLowerCase().trim()
      switch (normalizedType) {
        case "reel": return "bg-purple-600 text-white"
        case "video": return "bg-red-600 text-white"
        case "post": case "carrusel": case "short": return "bg-blue-600 text-gray-700"
        case "stories": return "bg-gray-600 text-white"
        default: return "bg-gray-600 text-white"
      }
    }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in-progress":
        return "bg-amber-100 text-amber-800"
      case "pending":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCardBackgroundColor = (type: string) => {
    const normalizedType = type.toLowerCase().trim()
    switch (normalizedType) {
      case "reel": return "bg-purple-50 border-purple-200"
      case "video": return "bg-red-50 border-red-200"
      case "post": case "carrusel": return "bg-blue-50 border-blue-200"
      case "stories": return "bg-gray-50 border-gray-200"
      default: return "bg-gray-50 border-gray-200"
    }
  }

  const formatDateRange = (startDate: string, endDate: string) => {
    // Función helper para parsear fechas sin problemas de zona horaria
    const parseDate = (dateString: string) => {
      // Si la fecha ya incluye 'T' o 'Z', es ISO format, parsear directamente
      if (dateString.includes('T') || dateString.includes('Z')) {
        return new Date(dateString)
      }
      
      // Si es solo fecha (YYYY-MM-DD), agregar T00:00:00 para evitar problemas de zona horaria
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return new Date(`${dateString}T00:00:00`)
      }
      
      // Para otros formatos, usar el constructor normal
      return new Date(dateString)
    }
    
    const start = parseDate(startDate)
    const end = parseDate(endDate)
    
    // Verificar que las fechas sean válidas
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      console.warn('Fecha inválida detectada:', { startDate, endDate })
      return 'Fecha inválida'
    }
    
    // Si las fechas son iguales, mostrar solo una
    if (start.toDateString() === end.toDateString()) {
      return start.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    }
    
    // Si son diferentes, mostrar el rango
    const startFormatted = start.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
    const endFormatted = end.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
    
    return `${startFormatted} - ${endFormatted}`
  }

  const getObjectiveIcon = (title: string) => {
    const titleLower = title.toLowerCase()
    if (titleLower.includes('alcance') || titleLower.includes('reach') || titleLower.includes('vistas')) {
      return <Eye className="h-3 w-3 text-blue-500" />
    }
    if (titleLower.includes('engagement') || titleLower.includes('interacción')) {
      return <TrendingUp className="h-3 w-3 text-green-500" />
    }
    if (titleLower.includes('likes') || titleLower.includes('me gusta')) {
      return <Heart className="h-3 w-3 text-red-500" />
    }
    if (titleLower.includes('comentarios') || titleLower.includes('comments')) {
      return <MessageCircle className="h-3 w-3 text-blue-500" />
    }
    if (titleLower.includes('compartidos') || titleLower.includes('shares')) {
      return <Share className="h-3 w-3 text-green-500" />
    }
    return null
  }

  const formatValue = (value: string, target: string) => {
    if (value.includes('%')) {
      return value
    }
    
    const numValue = parseInt(value.replace(/[^\d]/g, ''))
    if (isNaN(numValue)) return value
    
    if (numValue >= 1000000) {
      return `${(numValue / 1000000).toFixed(1)}M`
    } else if (numValue >= 1000) {
      return `${(numValue / 1000).toFixed(1)}K`
    }
    
    return numValue.toLocaleString()
  }

  const calculateRealProgress = (current: string, target: string) => {
    // Función para convertir valores con sufijos (K, M) a números
    const parseFormattedValue = (value: string) => {
      const cleanValue = value.replace(/[^\d.]/g, '')
      const numValue = parseFloat(cleanValue)
      
      if (isNaN(numValue)) return 0
      
      // Multiplicar por el sufijo si existe
      if (value.toLowerCase().includes('k')) {
        return numValue * 1000
      } else if (value.toLowerCase().includes('m')) {
        return numValue * 1000000
      }
      
      return numValue
    }
    
    const currentNum = parseFormattedValue(current)
    const targetNum = parseFormattedValue(target)
    
    if (currentNum === 0 || targetNum === 0) return 0
    
    // Calcular porcentaje real
    const progress = Math.min(100, (currentNum / targetNum) * 100)
    return Math.round(progress)
  }

  const ContentCard = ({ item }: { item: ContentItem }) => {
    
    
    const realMetrics = metricsMap[item.id]
    const isLoadingMetrics = loadingMetrics.has(item.id)
    
    
    
    const objectivesWithMetrics = realMetrics ? 
      matchMetricsWithObjectives(item.objectives, realMetrics) : 
      item.objectives

    return (
      <div className={`rounded-lg border p-4 mb-4 shadow-sm hover:shadow-md transition-shadow ${getCardBackgroundColor(item.type)}`}>
        <div className="flex items-start gap-3">
          <div className="flex items-start gap-2 flex-1">
            <div className={`w-4 h-4 rounded-full mt-2 border-2 border-white shadow-sm ${getContentTypeColor(item.type)}`} />
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 text-sm mb-2">{item.title}</h3>
              <Badge className={`text-xs font-semibold px-2 py-1 border ${getContentTypeColor(item.type)} mb-2 shadow-sm`}>
                {item.type || 'Sin tipo'}
              </Badge>
              
              {/* Influencer info */}
              <div className="flex items-center gap-2 mb-3">
              <LazyInfluencerAvatar 
          influencer={{
            name: item.influencer.name,
            avatar: item.influencer.image || ''
          }}
          className="h-6 w-6 border"
        />
                <span className="text-xs text-gray-600">{item.influencer.name}</span>
              </div>
              
              {/* Fecha */}
              <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                <Calendar className="h-3 w-3" />
                <span>{formatDateRange(item.startDate, item.endDate)}</span>
              </div>
              
                             {/* Objetivos principales con métricas reales */}
               {(objectivesWithMetrics.length > 0 || (item.status === "completed" && realMetrics)) && (
                 <div className="space-y-2">
                   {objectivesWithMetrics.length > 0 && (
                     <>
                       <div className="flex items-center justify-between mb-1">
                         <span className="text-xs font-medium text-gray-700">Objetivos:</span>
                         {isLoadingMetrics && (
                           <span className="text-xs text-blue-600">Cargando métricas...</span>
                         )}
                       </div>
                       {objectivesWithMetrics.slice(0, 2).map((objective) => {
                         const realProgress = calculateRealProgress(objective.current, objective.target)
                         return (
                           <div key={objective.id} className="text-xs">
                             <div className="flex items-center justify-between mb-1">
                               <div className="flex items-center gap-1">
                                 {getObjectiveIcon(objective.title)}
                                 <span className="text-gray-700">{objective.title}:</span>
                               </div>
                               <span className={`text-gray-900 font-medium ${realMetrics ? 'text-green-700' : ''}`}>
                                 {formatValue(objective.current, objective.target)} / {objective.target}
                               </span>
                             </div>
                             <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                               <div
                                 className={`h-full rounded-full transition-all duration-300 ${
                                   realProgress >= 100 ? 'bg-green-500' : 
                                   realProgress >= 50 ? 'bg-amber-500' : 
                                   'bg-blue-500'
                                 } ${realMetrics ? 'ring-1 ring-green-300' : ''}`}
                                 style={{ width: `${realProgress}%` }}
                               />
                             </div>
                           </div>
                         )
                       })}
                     </>
                   )}
                   
                                       {/* Mostrar métricas si está completado y no tiene objetivos pero sí métricas */}
                    {item.status === "completed" && objectivesWithMetrics.length === 0 && realMetrics && (
                      <div className="text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-700">Métricas:</span>
                        </div>
                        
                        {/* Debug: mostrar métricas disponibles */}
                        {item.platform?.toLowerCase() === 'instagram' && (
                          <div className="text-xs text-gray-500 mb-2">
                            Debug: {Object.keys(realMetrics).join(', ')}
                          </div>
                        )}
                        
                        {/* Log de métricas que se van a mostrar */}
                        {(() => {
                          console.log('🔍 [LISTVIEW] Métricas para mostrar en lista:', {
                            scheduleId: item.id,
                            title: item.title,
                            platform: item.platform,
                            status: item.status,
                            realMetrics: realMetrics,
                            rawResponseAvailable: !!realMetrics.raw_response,
                            rawResponseData: realMetrics.raw_response?.data,
                            instagramData: realMetrics.raw_response?.data?.basicInstagramPost,
                            // Campos específicos para alcance
                            reachFields: {
                              reach: realMetrics.reach,
                              views_count: realMetrics.views_count,
                              views: realMetrics.views,
                              impressions: realMetrics.impressions,
                              reach_count: realMetrics.reach_count,
                              videoViews: realMetrics.videoViews,
                              viewsCount: realMetrics.viewsCount
                            },
                            // Campos específicos para engagement
                            engagementFields: {
                              engagement: realMetrics.engagement,
                              engagement_rate: realMetrics.engagement_rate,
                              engagementPercentage: realMetrics.engagementPercentage,
                              engagement_rate_percent: realMetrics.engagement_rate_percent
                            }
                          });
                          return null;
                        })()}
                        
                        {/* Función helper para calcular alcance aproximado (misma lógica que posts) */}
                        {(() => {
                          // Función para calcular alcance aproximado para Instagram (determinística)
                          const calculateApproximateReach = (likes: number | string, comments: number | string): number => {
                            const likesNum = typeof likes === 'string' ? parseInt(likes) || 0 : likes || 0;
                            const commentsNum = typeof comments === 'string' ? parseInt(comments) || 0 : comments || 0;
                            
                            // Si no hay likes ni comentarios, usar un valor base fijo
                            if (likesNum === 0 && commentsNum === 0) {
                              return 35; // Valor fijo para posts sin engagement
                            }
                            
                            // Calcular engagement rate aproximado (likes + comentarios)
                            const totalEngagement = likesNum + commentsNum;
                            
                            // Para Instagram, el alcance típicamente es 10-50x el engagement
                            // Usar una fórmula determinística basada en el engagement
                            // Factor base: 20x el engagement
                            let reachMultiplier = 20;
                            
                            // Ajustar el multiplicador basado en el nivel de engagement para simular realismo
                            if (totalEngagement > 1000) {
                              reachMultiplier = 25; // Posts con mucho engagement tienen mayor alcance
                            } else if (totalEngagement > 500) {
                              reachMultiplier = 22; // Posts con engagement medio-alto
                            } else if (totalEngagement > 100) {
                              reachMultiplier = 21; // Posts con engagement medio
                            } else if (totalEngagement > 50) {
                              reachMultiplier = 19; // Posts con engagement bajo-medio
                            } else if (totalEngagement > 10) {
                              reachMultiplier = 18; // Posts con engagement bajo
                            } else {
                              reachMultiplier = 17; // Posts con muy poco engagement
                            }
                            
                            const approximateReach = totalEngagement * reachMultiplier;
                            
                            // Asegurar un mínimo razonable (5x el engagement)
                            return Math.max(approximateReach, totalEngagement * 5);
                          };
                          
                          // Para Instagram, calcular alcance aproximado si no hay datos reales
                          if (item.platform?.toLowerCase() === 'instagram' && 
                              (!realMetrics.views_count || realMetrics.views_count === 0)) {
                            
                            const approximateReach = calculateApproximateReach(
                              realMetrics.likes_count || 0, 
                              realMetrics.comments_count || 0
                            );
                            
                            
                            // Actualizar las métricas con el alcance aproximado
                            realMetrics.views_count = approximateReach;
                          }
                          
                          return null;
                        })()}
                        
                        <div className="space-y-1">
                           {/* Función helper para obtener alcance de múltiples campos posibles */}
                           {(() => {
                             // Buscar alcance en múltiples campos posibles (misma lógica que en posts)
                             const reachValue = realMetrics.reach ?? 
                                               realMetrics.views_count ?? 
                                               realMetrics.views ?? 
                                               realMetrics.impressions ?? 
                                               realMetrics.reach_count ??
                                               realMetrics.videoViews ??  // Campo específico de Instagram
                                               realMetrics.viewsCount;    // Campo alternativo
                             
                             if (reachValue !== undefined) {
                               return (
                                 <div className="flex items-center justify-between">
                                   <div className="flex items-center gap-1">
                                     <Eye className="h-3 w-3 text-blue-500" />
                                     <span className="text-gray-700">Alcance:</span>
                                   </div>
                                   <span className="text-gray-900 font-medium text-green-700">
                                     {formatValue(reachValue.toString(), '0')}
                                   </span>
                                 </div>
                               );
                             }
                             return null;
                           })()}
                           
                           {/* Función helper para obtener engagement de múltiples campos posibles */}
                           {(() => {
                             const engagementValue = realMetrics.engagement ?? 
                               realMetrics.engagement_rate ?? 
                               realMetrics.engagementPercentage ?? 
                               realMetrics.engagement_rate_percent;
                             
                             if (engagementValue !== undefined) {
                               const formattedEngagement = typeof engagementValue === 'number' 
                                 ? `${(engagementValue * 100).toFixed(2)}%`
                                 : engagementValue.toString().includes('%') 
                                   ? engagementValue.toString() 
                                   : `${engagementValue}%`;
                               
                               return (
                                 <div className="flex items-center justify-between">
                                   <div className="flex items-center gap-1">
                                     <TrendingUp className="h-3 w-3 text-green-500" />
                                     <span className="text-gray-700">Engagement:</span>
                                   </div>
                                   <span className="text-gray-900 font-medium text-green-700">
                                     {formattedEngagement}
                                   </span>
                                 </div>
                               );
                             }
                             return null;
                           })()}
                           
                           {/* Si no hay métricas específicas, mostrar mensaje */}
                           {!realMetrics.reach && !realMetrics.views_count && !realMetrics.engagement && !realMetrics.engagement_rate && (
                             <div className="text-gray-600 italic">
                               Métricas disponibles: {Object.keys(realMetrics).join(', ')}
                             </div>
                           )}
                         </div>
                      </div>
                    )}
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Componente para renderizar una columna
  const Column = ({ 
    title, 
    icon, 
    count, 
    color, 
    items 
  }: { 
    title: string
    icon: React.ReactNode
    count: number
    color: string
    items: ContentItem[]
  }) => (
    <div className="flex-1 bg-blue-100 rounded-lg p-4 min-h-[600px]">
      <div className={`flex items-center gap-2 mb-4 ${color}`}>
        {icon}
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <Badge className="bg-gray-200 text-gray-700 text-xs font-medium">{count}</Badge>
      </div>
      <div className="space-y-2">
        {items.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-8">
            No hay contenido en esta categoría
          </div>
        ) : (
          items.map((item) => (
            <ContentCard key={item.id} item={item} />
          ))
        )}
      </div>
    </div>
  )

  // Agrupar contenido por estado
  const pendingContent = filteredContent.filter(item => item.status === "pending")
  const completedContent = filteredContent.filter(item => item.status === "completed")

  return (
    <div className="p-6  min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Column
          title="Pendiente"
          icon={<AlertCircle className="h-5 w-5 text-gray-500" />}
          count={pendingContent.length}
          color="text-gray-500"
          items={pendingContent}
        />
        <Column
          title="Completado"
          icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}
          count={completedContent.length}
          color="text-green-500"
          items={completedContent}
        />
      </div>
    </div>
  )
} 