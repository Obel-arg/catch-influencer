"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { BrandMetricEvolution } from "@/hooks/brands/useBrandEvolutionData";

interface BrandMetricsEvolutionChartProps {
  evolutionData: BrandMetricEvolution[];
  evolutionLoading: boolean;
  hasAttemptedLoad: boolean;
  brandName?: string;
}

export const BrandMetricsEvolutionChart = ({ 
  evolutionData, 
  evolutionLoading, 
  hasAttemptedLoad,
  brandName = "la marca"
}: BrandMetricsEvolutionChartProps) => {
  const reachChartRef = useRef<HTMLDivElement>(null);
  const engagementChartRef = useRef<HTMLDivElement>(null);
  const [reachHoveredPoint, setReachHoveredPoint] = useState<{ x: number; y: number; value: number; date: string; index: number } | null>(null);
  const [engagementHoveredPoint, setEngagementHoveredPoint] = useState<{ x: number; y: number; value: number; date: string; index: number } | null>(null);

  // Dimensiones del gráfico
  const chartWidth = 500;
  const chartHeight = 250;
  const margin = { top: 20, right: 30, bottom: 40, left: 50 };
  const plotWidth = chartWidth - margin.left - margin.right;
  const plotHeight = chartHeight - margin.top - margin.bottom;

  // Memoizar los datos del gráfico de alcance
  const reachChartData = useMemo(() => {
    const data = evolutionData.map((item, index) => ({
      x: index,
      y: item.reach,
      date: item.date
    }));
    
    return data;
  }, [evolutionData]);

  // Memoizar los datos del gráfico de engagement
  const engagementChartData = useMemo(() => {
    const data = evolutionData.map((item, index) => ({
      x: index,
      y: item.engagement,
      date: item.date
    }));
    
    return data;
  }, [evolutionData]);

  // Calcular escalas y posiciones para alcance
  const reachChartConfig = useMemo(() => {
    if (reachChartData.length === 0) {
      return { yScale: () => 0, yMin: 0, yMax: 0, pointPositions: [] };
    }

    const maxValue = Math.max(...reachChartData.map(d => d.y));
    const minValue = Math.min(...reachChartData.map(d => d.y));
    const valueRange = maxValue - minValue;
    
    let yMin, yMax;
    if (reachChartData.length === 1) {
      yMin = Math.max(0, minValue - minValue * 0.3);
      yMax = maxValue + maxValue * 0.3;
    } else if (valueRange === 0) {
      yMin = Math.max(0, minValue - minValue * 0.5);
      yMax = maxValue + maxValue * 0.5;
    } else {
      yMin = Math.max(0, minValue - valueRange * 0.1);
      yMax = maxValue + valueRange * 0.1;
    }
    
    if (yMax <= yMin) {
      yMax = yMin + 1;
    }
    
    const yScale = (value: number) => margin.top + plotHeight - ((value - yMin) / (yMax - yMin)) * plotHeight;
    
    const pointPositions = reachChartData.map((point, index) => {
      const x = margin.left + (index / Math.max(reachChartData.length - 1, 1)) * plotWidth;
      const y = yScale(point.y);
      return { x, y, value: point.y, date: point.date, index };
    });
    
    return { yScale, yMin, yMax, pointPositions };
  }, [reachChartData, plotWidth, plotHeight, margin]);

  // Calcular escalas y posiciones para engagement
  const engagementChartConfig = useMemo(() => {
    if (engagementChartData.length === 0) {
      return { yScale: () => 0, yMin: 0, yMax: 0, pointPositions: [] };
    }

    const maxValue = Math.max(...engagementChartData.map(d => d.y));
    const minValue = Math.min(...engagementChartData.map(d => d.y));
    const valueRange = maxValue - minValue;
    
    let yMin, yMax;
    if (engagementChartData.length === 1) {
      yMin = Math.max(0, minValue - minValue * 0.3);
      yMax = maxValue + maxValue * 0.3;
    } else if (valueRange === 0) {
      yMin = Math.max(0, minValue - minValue * 0.5);
      yMax = maxValue + maxValue * 0.5;
    } else {
      yMin = Math.max(0, minValue - valueRange * 0.1);
      yMax = maxValue + valueRange * 0.1;
    }
    
    if (yMax <= yMin) {
      yMax = yMin + 1;
    }
    
    const yScale = (value: number) => margin.top + plotHeight - ((value - yMin) / (yMax - yMin)) * plotHeight;
    
    const pointPositions = engagementChartData.map((point, index) => {
      const x = margin.left + (index / Math.max(engagementChartData.length - 1, 1)) * plotWidth;
      const y = yScale(point.y);
      return { x, y, value: point.y, date: point.date, index };
    });
    
    return { yScale, yMin, yMax, pointPositions };
  }, [engagementChartData, plotWidth, plotHeight, margin]);

  // Generar path del gráfico de alcance
  const reachChartPath = useMemo(() => {
    if (reachChartConfig.pointPositions.length === 0) {
      return '';
    }
    
    let path = `M ${reachChartConfig.pointPositions[0].x},${reachChartConfig.pointPositions[0].y}`;
    
    for (let i = 1; i < reachChartConfig.pointPositions.length; i++) {
      path += ` L ${reachChartConfig.pointPositions[i].x},${reachChartConfig.pointPositions[i].y}`;
    }
    
    return path;
  }, [reachChartConfig.pointPositions]);

  // Generar path del área de alcance
  const reachAreaPath = useMemo(() => {
    if (reachChartConfig.pointPositions.length === 0) return '';
    
    let path = `M ${reachChartConfig.pointPositions[0].x},${reachChartConfig.pointPositions[0].y}`;
    
    for (let i = 1; i < reachChartConfig.pointPositions.length; i++) {
      path += ` L ${reachChartConfig.pointPositions[i].x},${reachChartConfig.pointPositions[i].y}`;
    }
    
    path += ` L ${reachChartConfig.pointPositions[reachChartConfig.pointPositions.length - 1].x},${margin.top + plotHeight}`;
    path += ` L ${reachChartConfig.pointPositions[0].x},${margin.top + plotHeight} Z`;
    
    return path;
  }, [reachChartConfig.pointPositions, margin, plotHeight]);

  // Generar path del gráfico de engagement
  const engagementChartPath = useMemo(() => {
    if (engagementChartConfig.pointPositions.length === 0) {
      return '';
    }
    
    let path = `M ${engagementChartConfig.pointPositions[0].x},${engagementChartConfig.pointPositions[0].y}`;
    
    for (let i = 1; i < engagementChartConfig.pointPositions.length; i++) {
      path += ` L ${engagementChartConfig.pointPositions[i].x},${engagementChartConfig.pointPositions[i].y}`;
    }
    
    return path;
  }, [engagementChartConfig.pointPositions]);

  // Generar path del área de engagement
  const engagementAreaPath = useMemo(() => {
    if (engagementChartConfig.pointPositions.length === 0) return '';
    
    let path = `M ${engagementChartConfig.pointPositions[0].x},${engagementChartConfig.pointPositions[0].y}`;
    
    for (let i = 1; i < engagementChartConfig.pointPositions.length; i++) {
      path += ` L ${engagementChartConfig.pointPositions[i].x},${engagementChartConfig.pointPositions[i].y}`;
    }
    
    path += ` L ${engagementChartConfig.pointPositions[engagementChartConfig.pointPositions.length - 1].x},${margin.top + plotHeight}`;
    path += ` L ${engagementChartConfig.pointPositions[0].x},${margin.top + plotHeight} Z`;
    
    return path;
  }, [engagementChartConfig.pointPositions, margin, plotHeight]);

  // Calcular valores del eje Y para alcance
  const reachYAxisValues = useMemo(() => {
    if (reachChartConfig.yMax === reachChartConfig.yMin) {
      return [reachChartConfig.yMin, reachChartConfig.yMin + 1];
    }
    
    const numTicks = 4;
    const values = [];
    for (let i = 0; i <= numTicks; i++) {
      const value = reachChartConfig.yMin + (i / numTicks) * (reachChartConfig.yMax - reachChartConfig.yMin);
      values.push(value);
    }
    return values;
  }, [reachChartConfig.yMin, reachChartConfig.yMax]);

  // Calcular valores del eje Y para engagement
  const engagementYAxisValues = useMemo(() => {
    if (engagementChartConfig.yMax === engagementChartConfig.yMin) {
      return [engagementChartConfig.yMin, engagementChartConfig.yMin + 1];
    }
    
    const numTicks = 4;
    const values = [];
    for (let i = 0; i <= numTicks; i++) {
      const value = engagementChartConfig.yMin + (i / numTicks) * (engagementChartConfig.yMax - engagementChartConfig.yMin);
      values.push(value);
    }
    return values;
  }, [engagementChartConfig.yMin, engagementChartConfig.yMax]);

  // Funciones de formateo
  const formatReachValue = useCallback((value: number) => {
    if (value >= 1000000) {
      const millions = Math.round(value / 1000000 * 10) / 10;
      return `${millions}M`;
    } else if (value >= 1000) {
      const thousands = Math.round(value / 1000);
      return `${thousands}K`;
    } else {
      return `${Math.round(value)}`;
    }
  }, []);

  const formatEngagementValue = useCallback((value: number) => {
    return `${Math.round(value * 10) / 10}%`;
  }, []);

  // Event handlers para alcance
  const handleReachPointHover = useCallback((point: typeof reachChartConfig.pointPositions[0]) => {
    setReachHoveredPoint(point);
  }, []);

  const handleReachPointLeave = useCallback(() => {
    setReachHoveredPoint(null);
  }, []);

  // Event handlers para engagement
  const handleEngagementPointHover = useCallback((point: typeof engagementChartConfig.pointPositions[0]) => {
    setEngagementHoveredPoint(point);
  }, []);

  const handleEngagementPointLeave = useCallback(() => {
    setEngagementHoveredPoint(null);
  }, []);

  // Limpiar hover cuando no hay datos
  useEffect(() => {
    if (reachChartConfig.pointPositions.length === 0) {
      setReachHoveredPoint(null);
    }
    if (engagementChartConfig.pointPositions.length === 0) {
      setEngagementHoveredPoint(null);
    }
  }, [reachChartConfig.pointPositions.length, engagementChartConfig.pointPositions.length]);

  if (evolutionLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <CardHeader className="p-6 border-b bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Evolución de Alcance</h2>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <CardHeader className="p-6 border-b bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Evolución de Engagement</h2>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasAttemptedLoad || evolutionData.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <CardHeader className="p-6 border-b bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Evolución de Alcance</h2>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-base font-medium text-gray-600 mb-2">No hay datos de alcance disponibles</p>
                <p className="text-sm text-gray-500">Asigna campañas a {brandName} para ver el rendimiento</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <CardHeader className="p-6 border-b bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Evolución de Engagement</h2>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-base font-medium text-gray-600 mb-2">No hay datos de engagement disponibles</p>
                <p className="text-sm text-gray-500">Asigna campañas a {brandName} para ver el rendimiento</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Gráfico de Alcance */}
      <Card className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <CardHeader className="p-6 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Evolución de Alcance</h2>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-[300px] w-full relative" ref={reachChartRef}>
            <svg 
              className="w-full h-full" 
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              preserveAspectRatio="xMidYMid meet"
              onMouseLeave={handleReachPointLeave}
              onMouseOut={handleReachPointLeave}
            >
              <defs>
                <linearGradient id="reachGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
                </linearGradient>
              </defs>
              
              {/* Eje Y principal */}
              <line
                x1={margin.left}
                y1={margin.top}
                x2={margin.left}
                y2={margin.top + plotHeight}
                stroke="#d1d5db"
                strokeWidth="2"
              />
              
              {/* Eje X principal */}
              <line
                x1={margin.left}
                y1={margin.top + plotHeight}
                x2={chartWidth - margin.right}
                y2={margin.top + plotHeight}
                stroke="#d1d5db"
                strokeWidth="2"
              />
              
              {/* Líneas de cuadrícula horizontales */}
              {reachYAxisValues.map((value, index) => {
                const y = reachChartConfig.yScale(value);
                return (
                  <line
                    key={`y-${index}`}
                    x1={margin.left}
                    y1={y}
                    x2={chartWidth - margin.right}
                    y2={y}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                  />
                );
              })}
              
              {/* Líneas de cuadrícula verticales */}
              {reachChartConfig.pointPositions.map((point, index) => (
                <line
                  key={`x-${index}`}
                  x1={point.x}
                  y1={margin.top}
                  x2={point.x}
                  y2={margin.top + plotHeight}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                  opacity="0.5"
                />
              ))}
              
              {/* Etiquetas del eje Y */}
              {reachYAxisValues.map((value, index) => {
                const y = reachChartConfig.yScale(value);
                return (
                  <text
                    key={index}
                    x={margin.left - 10}
                    y={y + 4}
                    textAnchor="end"
                    fontSize="10"
                    fill="#6b7280"
                    fontWeight="500"
                  >
                    {formatReachValue(value)}
                  </text>
                );
              })}
              
              {/* Área del gráfico */}
              <path
                d={reachAreaPath}
                fill="url(#reachGradient)"
              />
              
              {/* Línea del gráfico */}
              <path
                d={reachChartPath}
                stroke="#3b82f6"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Puntos de datos */}
              {reachChartConfig.pointPositions.map((point, index) => (
                <g key={index}>
                  {/* Área de hover invisible */}
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="12"
                    fill="transparent"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => handleReachPointHover(point)}
                    onMouseLeave={handleReachPointLeave}
                  />
                  
                  {/* Punto visual */}
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={reachHoveredPoint?.index === index ? "6" : "4"}
                    fill="#3b82f6"
                    stroke="white"
                    strokeWidth={reachHoveredPoint?.index === index ? "2" : "1.5"}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => handleReachPointHover(point)}
                    onMouseLeave={handleReachPointLeave}
                  />
                </g>
              ))}
              
              {/* Tooltip de alcance */}
              {reachHoveredPoint && reachChartConfig.pointPositions.length > 0 && (
                <g>
                  {/* Línea de referencia */}
                  <line
                    x1={reachHoveredPoint.x}
                    y1={margin.top}
                    x2={reachHoveredPoint.x}
                    y2={margin.top + plotHeight}
                    stroke="#3b82f6"
                    strokeWidth="1"
                    strokeDasharray="3,3"
                    opacity="0.6"
                  />
                  
                  {/* Tooltip box */}
                  {(() => {
                    const tooltipWidth = 100;
                    const tooltipHeight = 50;
                    const tooltipX = reachHoveredPoint.x + 15;
                    const tooltipY = reachHoveredPoint.y - 25;
                    
                    const adjustedX = tooltipX + tooltipWidth > chartWidth - margin.right 
                      ? reachHoveredPoint.x - tooltipWidth - 15 
                      : tooltipX;
                    const adjustedY = tooltipY < margin.top 
                      ? reachHoveredPoint.y + 15 
                      : tooltipY;
                    
                    return (
                      <>
                        {/* Fondo del tooltip */}
                        <rect
                          x={adjustedX}
                          y={adjustedY}
                          width={tooltipWidth}
                          height={tooltipHeight}
                          fill="rgba(0,0,0,0.85)"
                          rx="6"
                        />
                        
                        {/* Contenido del tooltip */}
                        <text
                          x={adjustedX + 8}
                          y={adjustedY + 18}
                          fontSize="12"
                          fill="white"
                          fontWeight="600"
                        >
                          {formatReachValue(reachHoveredPoint.value)}
                        </text>
                        <text
                          x={adjustedX + 8}
                          y={adjustedY + 35}
                          fontSize="10"
                          fill="rgba(255,255,255,0.8)"
                        >
                          {(() => {
                            const dateString = reachHoveredPoint.date.split('T')[0];
                            const [year, month, day] = dateString.split('-').map(Number);
                            const date = new Date(year, month - 1, day);
                            return date.toLocaleDateString('es-ES', { 
                              day: '2-digit', 
                              month: 'short' 
                            });
                          })()}
                        </text>
                      </>
                    );
                  })()}
                </g>
              )}
              
              {/* Fechas en el eje X */}
              {reachChartConfig.pointPositions.map((point, index) => {
                const dateString = point.date.split('T')[0];
                const [year, month, day] = dateString.split('-').map(Number);
                const date = new Date(year, month - 1, day);
                
                return (
                  <text
                    key={`date-${index}`}
                    x={point.x}
                    y={chartHeight - 10}
                    textAnchor="middle"
                    fontSize="9"
                    fill="#6b7280"
                    fontWeight="500"
                  >
                    {date.toLocaleDateString('es-ES', { 
                      day: '2-digit', 
                      month: 'short' 
                    })}
                  </text>
                );
              })}
            </svg>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Engagement */}
      <Card className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <CardHeader className="p-6 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Evolución de Engagement</h2>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-[300px] w-full relative" ref={engagementChartRef}>
            <svg 
              className="w-full h-full" 
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              preserveAspectRatio="xMidYMid meet"
              onMouseLeave={handleEngagementPointLeave}
              onMouseOut={handleEngagementPointLeave}
            >
              <defs>
                <linearGradient id="engagementGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
                </linearGradient>
              </defs>
              
              {/* Eje Y principal */}
              <line
                x1={margin.left}
                y1={margin.top}
                x2={margin.left}
                y2={margin.top + plotHeight}
                stroke="#d1d5db"
                strokeWidth="2"
              />
              
              {/* Eje X principal */}
              <line
                x1={margin.left}
                y1={margin.top + plotHeight}
                x2={chartWidth - margin.right}
                y2={margin.top + plotHeight}
                stroke="#d1d5db"
                strokeWidth="2"
              />
              
              {/* Líneas de cuadrícula horizontales */}
              {engagementYAxisValues.map((value, index) => {
                const y = engagementChartConfig.yScale(value);
                return (
                  <line
                    key={`y-${index}`}
                    x1={margin.left}
                    y1={y}
                    x2={chartWidth - margin.right}
                    y2={y}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                  />
                );
              })}
              
              {/* Líneas de cuadrícula verticales */}
              {engagementChartConfig.pointPositions.map((point, index) => (
                <line
                  key={`x-${index}`}
                  x1={point.x}
                  y1={margin.top}
                  x2={point.x}
                  y2={margin.top + plotHeight}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                  opacity="0.5"
                />
              ))}
              
              {/* Etiquetas del eje Y */}
              {engagementYAxisValues.map((value, index) => {
                const y = engagementChartConfig.yScale(value);
                return (
                  <text
                    key={index}
                    x={margin.left - 10}
                    y={y + 4}
                    textAnchor="end"
                    fontSize="10"
                    fill="#6b7280"
                    fontWeight="500"
                  >
                    {formatEngagementValue(value)}
                  </text>
                );
              })}
              
              {/* Área del gráfico */}
              <path
                d={engagementAreaPath}
                fill="url(#engagementGradient)"
              />
              
              {/* Línea del gráfico */}
              <path
                d={engagementChartPath}
                stroke="#10b981"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Puntos de datos */}
              {engagementChartConfig.pointPositions.map((point, index) => (
                <g key={index}>
                  {/* Área de hover invisible */}
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="12"
                    fill="transparent"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => handleEngagementPointHover(point)}
                    onMouseLeave={handleEngagementPointLeave}
                  />
                  
                  {/* Punto visual */}
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={engagementHoveredPoint?.index === index ? "6" : "4"}
                    fill="#10b981"
                    stroke="white"
                    strokeWidth={engagementHoveredPoint?.index === index ? "2" : "1.5"}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => handleEngagementPointHover(point)}
                    onMouseLeave={handleEngagementPointLeave}
                  />
                </g>
              ))}
              
              {/* Tooltip de engagement */}
              {engagementHoveredPoint && engagementChartConfig.pointPositions.length > 0 && (
                <g>
                  {/* Línea de referencia */}
                  <line
                    x1={engagementHoveredPoint.x}
                    y1={margin.top}
                    x2={engagementHoveredPoint.x}
                    y2={margin.top + plotHeight}
                    stroke="#10b981"
                    strokeWidth="1"
                    strokeDasharray="3,3"
                    opacity="0.6"
                  />
                  
                  {/* Tooltip box */}
                  {(() => {
                    const tooltipWidth = 100;
                    const tooltipHeight = 50;
                    const tooltipX = engagementHoveredPoint.x + 15;
                    const tooltipY = engagementHoveredPoint.y - 25;
                    
                    const adjustedX = tooltipX + tooltipWidth > chartWidth - margin.right 
                      ? engagementHoveredPoint.x - tooltipWidth - 15 
                      : tooltipX;
                    const adjustedY = tooltipY < margin.top 
                      ? engagementHoveredPoint.y + 15 
                      : tooltipY;
                    
                    return (
                      <>
                        {/* Fondo del tooltip */}
                        <rect
                          x={adjustedX}
                          y={adjustedY}
                          width={tooltipWidth}
                          height={tooltipHeight}
                          fill="rgba(0,0,0,0.85)"
                          rx="6"
                        />
                        
                        {/* Contenido del tooltip */}
                        <text
                          x={adjustedX + 8}
                          y={adjustedY + 18}
                          fontSize="12"
                          fill="white"
                          fontWeight="600"
                        >
                          {formatEngagementValue(engagementHoveredPoint.value)}
                        </text>
                        <text
                          x={adjustedX + 8}
                          y={adjustedY + 35}
                          fontSize="10"
                          fill="rgba(255,255,255,0.8)"
                        >
                          {(() => {
                            const dateString = engagementHoveredPoint.date.split('T')[0];
                            const [year, month, day] = dateString.split('-').map(Number);
                            const date = new Date(year, month - 1, day);
                            return date.toLocaleDateString('es-ES', { 
                              day: '2-digit', 
                              month: 'short' 
                            });
                          })()}
                        </text>
                      </>
                    );
                  })()}
                </g>
              )}
              
              {/* Fechas en el eje X */}
              {engagementChartConfig.pointPositions.map((point, index) => {
                const dateString = point.date.split('T')[0];
                const [year, month, day] = dateString.split('-').map(Number);
                const date = new Date(year, month - 1, day);
                
                return (
                  <text
                    key={`date-${index}`}
                    x={point.x}
                    y={chartHeight - 10}
                    textAnchor="middle"
                    fontSize="9"
                    fill="#6b7280"
                    fontWeight="500"
                  >
                    {date.toLocaleDateString('es-ES', { 
                      day: '2-digit', 
                      month: 'short' 
                    })}
                  </text>
                );
              })}
            </svg>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
