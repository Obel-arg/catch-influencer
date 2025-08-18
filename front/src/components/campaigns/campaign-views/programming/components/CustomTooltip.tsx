"use client"

import { useState, useRef, useEffect } from "react"
import { ContentItem } from "../types"
import { formatDate, parseLocalDate, formatLocalDate } from "../utils/helpers"
import { StatusBadge } from "./StatusBadge"
import { ObjectiveProgress } from "./ObjectiveProgress"
import { useCampaignSchedule } from "@/hooks/campaign/useCampaignSchedule"
import { LazyInfluencerAvatar } from "@/components/explorer/LazyInfluencerAvatar"

interface CustomTooltipProps {
  item: ContentItem
  children: React.ReactNode
  campaignId: string
}

export const CustomTooltip = ({ item, children, campaignId }: CustomTooltipProps) => {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [realMetrics, setRealMetrics] = useState<any>(null)
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false)
  const [minWidthPx, setMinWidthPx] = useState<number>(360)
  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  
  const { getPostMetricsForSchedule, matchMetricsWithObjectives } = useCampaignSchedule(campaignId)

  const handleMouseEnter = async (e: React.MouseEvent) => {
    // Encontrar la card real usando la clase específica
    const cardElement = e.currentTarget.querySelector('.gantt-card') as HTMLElement
    if (cardElement) {
      const rect = cardElement.getBoundingClientRect()
      setPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 5
      })
    } else {
      // Fallback al contenedor si no encuentra la card
      const rect = e.currentTarget.getBoundingClientRect()
      setPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 5
      })
    }
    setIsVisible(true)
    
    // Cargar métricas reales si no están cargando y no se han cargado ya
    if (!isLoadingMetrics && !realMetrics) {
      setIsLoadingMetrics(true)
      try {
        const metrics = await getPostMetricsForSchedule(item.id)
        setRealMetrics(metrics)
      } catch (error) {
        console.error('Error loading metrics for tooltip:', error)
        // Si no se pueden cargar métricas reales, no mostrar nada
      } finally {
        setIsLoadingMetrics(false)
      }
    }
  }

  const handleMouseLeave = () => {
    setIsVisible(false)
  }

  // Ajustar tamaño mínimo del tooltip según el viewport
  useEffect(() => {
    if (!isVisible) return
    const updateMinWidth = () => {
      const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1024
      const computed = Math.max(240, Math.min(360, viewportWidth - 16))
      setMinWidthPx(computed)
    }
    updateMinWidth()
    window.addEventListener('resize', updateMinWidth)
    return () => window.removeEventListener('resize', updateMinWidth)
  }, [isVisible])

  // Reposicionar el tooltip para que no choque con bordes
  useEffect(() => {
    if (!isVisible || !tooltipRef.current) return
    const margin = 8
    const viewportWidth = window.innerWidth
    const rect = tooltipRef.current.getBoundingClientRect()
    const half = rect.width / 2
    let x = position.x
    if (position.x - half < margin) {
      x = margin + half
    } else if (position.x + half > viewportWidth - margin) {
      x = viewportWidth - margin - half
    }
    if (x !== position.x) {
      setPosition(prev => ({ ...prev, x }))
    }
  }, [isVisible, position.x])

  // Obtener objetivos con métricas reales si están disponibles
  const objectivesWithMetrics = realMetrics ? 
    matchMetricsWithObjectives(item.objectives, realMetrics) : 
    item.objectives

  // Función para formatear el título del objetivo
  const formatObjectiveTitle = (title: string) => {
    if (title.toLowerCase().includes('engagement')) {
      return title.replace(/engagement/gi, 'Engage')
    }
    return title
  }

  // Verificar si el schedule tiene post linkeado (tiene content_url)
  const hasLinkedPost = item.content_url && item.content_url.trim() !== ''
  
  // Si tiene post linkeado, usar objetivos con métricas reales si están disponibles
  // Si no tiene post linkeado, usar los objetivos definidos en la base de datos
  const displayObjectives = hasLinkedPost ? objectivesWithMetrics : item.objectives

  // Función para convertir string con sufijos a número
  const parseValueWithSuffix = (value: string | number): number => {
    if (typeof value === 'number') return value
    
    const str = value.toString().trim()
    const match = str.match(/^([\d.]+)\s*([kKmM])?$/)
    
    if (!match) return parseFloat(str) || 0
    
    const [, numberStr, suffix] = match
    const number = parseFloat(numberStr)
    
    if (!suffix) return number
    
    const upperSuffix = suffix.toUpperCase()
    if (upperSuffix === 'K') return number * 1000
    if (upperSuffix === 'M') return number * 1000000
    
    return number
  }

  // Función para formatear números con K o M
  const formatNumber = (value: string | number) => {
    const num = parseValueWithSuffix(value)
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}k`
    }
    return num.toString()
  }

  // Función para calcular el porcentaje de progreso
  const calculateProgress = (current: string | number, target: string | number) => {
    const currentNum = parseValueWithSuffix(current)
    const targetNum = parseValueWithSuffix(target)
    if (targetNum === 0) return 0
    return Math.min((currentNum / targetNum) * 100, 100)
  }

  // Función para formatear el valor mostrado
  const formatDisplayValue = (objective: any) => {
    const current = objective.current || '0'
    const target = objective.target || '0'
    return `${formatNumber(current)}/${formatNumber(target)}`
  }

  // Resolver nombres de campos de métricas provenientes del backend
  const getDisplayReach = (metrics: any) => {
    if (!metrics) return undefined
    return (
      metrics.reach ??
      metrics.views_count ??
      metrics.views ??
      metrics.impressions ??
      metrics.reach_count ??
      undefined
    )
  }

  const getDisplayEngagement = (metrics: any) => {
    if (!metrics) return undefined
    return (
      metrics.engagement ??
      metrics.engagement_rate ??
      metrics.engagementPercentage ??
      metrics.engagement_rate_percent ??
      undefined
    )
  }

  // Función para calcular alcance aproximado para Instagram (misma lógica que posts y ListView)
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
      reachMultiplier = 25; // Posts con muy poco engagement
    }
    
    const approximateReach = totalEngagement * reachMultiplier;
    
    // Asegurar un mínimo razonable (5x el engagement)
    return Math.max(approximateReach, totalEngagement * 5);
  };

  // Obtener alcance con cálculo aproximado para Instagram
  const getReachWithApproximation = (metrics: any) => {
    if (!metrics) return undefined;
    
    // Primero intentar obtener alcance real
    const realReach = getDisplayReach(metrics);
    if (realReach && realReach !== 0) return realReach;
    
    // Para Instagram, calcular alcance aproximado si no hay datos reales
    if (item.platform?.toLowerCase() === 'instagram') {
      const approximateReach = calculateApproximateReach(
        metrics.likes_count || 0, 
        metrics.comments_count || 0
      );
      
      console.log('🔍 [TOOLTIP APPROXIMATE REACH] Calculated for Instagram:', {
        likes: metrics.likes_count,
        comments: metrics.comments_count,
        approximateReach: approximateReach
      });
      
      return approximateReach;
    }
    
    return realReach;
  };

  const reachValue = realMetrics ? getReachWithApproximation(realMetrics) : undefined;
  const engagementValue = realMetrics ? getDisplayEngagement(realMetrics) : undefined;

  const formatEngagementDisplay = (value: any) => {
    if (value === undefined || value === null) return undefined
    if (typeof value === 'number') {
      return `${(value * 100).toFixed(2)}%`
    }
    const numeric = parseFloat(String(value).replace('%', '').trim())
    if (!isNaN(numeric)) {
      return `${(numeric * 100).toFixed(2)}%`
    }
    return String(value)
  }

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-block"
      >
        {children}
      </div>
      
      {isVisible && (
        <div
          ref={tooltipRef}
          className="fixed z-50 pointer-events-none"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            transform: 'translateX(-50%) translateY(-100%)'
          }}
        >
            <div className="bg-white border border-gray-200 rounded-lg shadow-lg max-w-[95vw]" style={{ minWidth: `${minWidthPx}px` }}>
                         <div className="p-3 bg-white rounded-t-lg border-b">
                               <div className="flex items-center justify-between gap-2">
                  <div className="font-medium text-gray-900 truncate">{item.title}</div>
                  <StatusBadge status={item.status} />
                </div>
               <div className="flex items-center gap-2 text-sm text-gray-500">
                 <LazyInfluencerAvatar 
                   influencer={{
                     name: item.influencer.name,
                     avatar: item.influencer.image
                   }}
                   className="w-4 h-4"
                 />
                 <span>{item.influencer.name}</span>
               </div>
               {item.description && item.description.trim() !== '' && (
                 <div className="text-xs text-gray-600 mt-1 break-words whitespace-normal">
                   {item.description}
                 </div>
               )}
               <div className="text-xs text-gray-500 mt-1">
                 <span className="font-medium">Fecha:</span> {formatLocalDate(item.startDate)}
               </div>
               <div className="text-xs text-gray-500">
                 <span className="font-medium">Plataforma:</span> {item.platform} ({item.type})
               </div>
             </div>
            <div className="p-3 bg-gray-50 rounded-b-lg">
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs font-medium text-gray-900">Objetivos:</div>
              </div>
              <div className="space-y-2">
                {displayObjectives.length === 0 ? (
                  <div className="text-xs text-gray-500 italic">Sin Objetivos</div>
                ) : (
                  displayObjectives.map((objective) => (
                    <div key={objective.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">{formatObjectiveTitle(objective.title)}:</span>
                        <span className={`font-medium ${realMetrics ? 'text-green-700' : 'text-gray-900'}`}>
                          {formatDisplayValue(objective)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            realMetrics ? 'bg-green-500' : 'bg-gray-400'
                          }`}
                          style={{ 
                            width: `${calculateProgress(objective.current || 0, objective.target || 1)}%` 
                          }}
                        />
                      </div>
                    </div>
                  ))
                )}
                
                {/* Mostrar métricas de contenido si no tiene objetivos */}
                {displayObjectives.length === 0 && (
                  <div className="mt-3 pt-3 ">
                    <div className="space-y-1">
                      {realMetrics ? (
                        (reachValue !== undefined || engagementValue !== undefined) ? (
                          <>
                            {reachValue !== undefined && (
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">Alcance:</span>
                                <span className="font-medium text-green-700">
                                  {formatNumber(reachValue)}
                                </span>
                              </div>
                            )}
                            {engagementValue !== undefined && (
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">Engagement:</span>
                                <span className="font-medium text-green-700">
                                  {formatEngagementDisplay(engagementValue)}
                                </span>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-xs text-gray-500 italic"></div>
                        )
                      ) : (
                        <div className="text-xs text-gray-500 italic"></div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 