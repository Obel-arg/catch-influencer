import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { useState, useMemo, useCallback, useRef, useEffect } from "react";

interface MetricEvolution {
  date: string;
  reach: number;
  engagement: number;
}

interface MetricsEvolutionChartProps {
  evolutionData: MetricEvolution[];
  evolutionLoading: boolean;
  postsLoading: boolean;
  hasAttemptedLoad: boolean;
}

export const MetricsEvolutionChart = ({ 
  evolutionData, 
  evolutionLoading, 
  postsLoading, 
  hasAttemptedLoad 
}: MetricsEvolutionChartProps) => {
  const [selectedMetric, setSelectedMetric] = useState<'engagement' | 'reach'>('reach');
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; value: number; date: string; index: number } | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  // Memoizar los datos del gráfico
  const chartData = useMemo(() => {
    const data = evolutionData.map((item, index) => ({
      x: index,
      y: selectedMetric === 'engagement' ? item.engagement : item.reach,
      date: item.date
    }));
    
    return data;
  }, [evolutionData, selectedMetric]);

  // Dimensiones del gráfico
  const chartWidth = 1000;
  const chartHeight = 300;
  const margin = { top: 20, right: 40, bottom: 40, left: 60 };
  const plotWidth = chartWidth - margin.left - margin.right;
  const plotHeight = chartHeight - margin.top - margin.bottom;

  // Calcular escalas y posiciones
  const { yScale, yMin, yMax, pointPositions } = useMemo(() => {
    if (chartData.length === 0) {
      return { yScale: () => 0, yMin: 0, yMax: 0, pointPositions: [] };
    }

    const maxValue = Math.max(...chartData.map(d => d.y));
    const minValue = Math.min(...chartData.map(d => d.y));
    const valueRange = maxValue - minValue;
    
    let yMin, yMax;
    if (chartData.length === 1) {
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
    
    const pointPositions = chartData.map((point, index) => {
      const x = margin.left + (index / Math.max(chartData.length - 1, 1)) * plotWidth;
      const y = yScale(point.y);
      return { x, y, value: point.y, date: point.date, index };
    });
    
    return { yScale, yMin, yMax, pointPositions };
  }, [chartData, plotWidth, plotHeight, margin]);

  // Generar path del gráfico
  const chartPath = useMemo(() => {
    if (pointPositions.length === 0) {
      return '';
    }
    
    let path = `M ${pointPositions[0].x},${pointPositions[0].y}`;
    
    for (let i = 1; i < pointPositions.length; i++) {
      path += ` L ${pointPositions[i].x},${pointPositions[i].y}`;
    }
    
    return path;
  }, [pointPositions]);

  // Generar path del área
  const areaPath = useMemo(() => {
    if (pointPositions.length === 0) return '';
    
    let path = `M ${pointPositions[0].x},${pointPositions[0].y}`;
    
    for (let i = 1; i < pointPositions.length; i++) {
      path += ` L ${pointPositions[i].x},${pointPositions[i].y}`;
    }
    
    path += ` L ${pointPositions[pointPositions.length - 1].x},${margin.top + plotHeight}`;
    path += ` L ${pointPositions[0].x},${margin.top + plotHeight} Z`;
    
    return path;
  }, [pointPositions, margin, plotHeight]);

  // Calcular valores del eje Y
  const yAxisValues = useMemo(() => {
    if (yMax === yMin) {
      return [yMin, yMin + 1];
    }
    
    const numTicks = 4;
    const values = [];
    for (let i = 0; i <= numTicks; i++) {
      const value = yMin + (i / numTicks) * (yMax - yMin);
      values.push(value);
    }
    return values;
  }, [yMin, yMax]);

  // Funciones de formateo
  const formatYAxisValue = useCallback((value: number) => {
    if (selectedMetric === 'engagement') {
      return `${Math.round(value * 10) / 10}%`;
    } else {
      if (value >= 1000000) {
        const millions = Math.round(value / 1000000 * 10) / 10;
        return `${millions}M`;
      } else if (value >= 1000) {
        const thousands = Math.round(value / 1000);
        return `${thousands}K`;
      } else {
        return `${Math.round(value)}`;
      }
    }
  }, [selectedMetric]);

  const formatValue = useCallback((value: number) => {
    if (selectedMetric === 'engagement') {
      return `${Math.round(value * 10) / 10}%`;
    } else {
      if (value >= 1000000) {
        const millions = Math.round(value / 1000000 * 10) / 10;
        return `${millions}M`;
      } else if (value >= 1000) {
        const thousands = Math.round(value / 1000);
        return `${thousands}K`;
      } else {
        return `${Math.round(value)}`;
      }
    }
  }, [selectedMetric]);

  // Event handlers
  const handlePointHover = useCallback((point: typeof pointPositions[0]) => {
    setHoveredPoint(point);
  }, []);

  const handlePointLeave = useCallback(() => {
    setHoveredPoint(null);
  }, []);

  // Limpiar hover cuando no hay datos
  useEffect(() => {
    if (pointPositions.length === 0) {
      setHoveredPoint(null);
    }
  }, [pointPositions.length]);

  return (
    <Card className="bg-white border-gray-200 lg:col-span-2">
      <CardHeader className="pb-2 pt-3 px-4 bg-blue-600 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-white" />
            <h3 className="text-sm font-semibold text-white">Evolución de Métricas</h3>
          </div>
          <div className="flex rounded-md gap-1">
            <button 
              className={`px-3 py-2 text-xs rounded-md transition-all duration-200 ${
                selectedMetric === 'reach' 
                  ? 'bg-blue-500 text-white shadow-sm' 
                  : 'text-blue-100 hover:text-white hover:bg-blue-600/50'
              }`}
              onClick={() => setSelectedMetric('reach')}
            >
              Alcance
            </button>
            <button 
              className={`px-3 py-2 text-xs rounded-md transition-all duration-200 ${
                selectedMetric === 'engagement' 
                  ? 'bg-blue-500 text-white shadow-sm' 
                  : 'text-blue-100 hover:text-white hover:bg-blue-600/50'
              }`}
              onClick={() => setSelectedMetric('engagement')}
            >
              Engagement
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full relative" ref={chartRef}>
          {/* Mostrar skeleton mientras carga */}
          {evolutionLoading || postsLoading ? (
            <div className="h-full w-full p-4">
              <div className="h-full flex flex-col">
                <div className="flex-1 bg-gray-100 rounded-lg animate-pulse mb-4"></div>
                <div className="flex justify-between">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="w-16 h-3 bg-gray-200 rounded animate-pulse"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : !evolutionLoading && !postsLoading && hasAttemptedLoad && chartData.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <TrendingUp className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No hay datos de evolución disponibles</p>
              </div>
            </div>
          ) : (
            /* Gráfico SVG */
            <svg 
              className="w-full h-full" 
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              preserveAspectRatio="xMidYMid meet"
              onMouseLeave={handlePointLeave}
              onMouseOut={handlePointLeave}
            >
              <defs>
                <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
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
              {yAxisValues.map((value, index) => {
                const y = yScale(value);
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
              {pointPositions.map((point, index) => (
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
              {yAxisValues.map((value, index) => {
                const y = yScale(value);
                return (
                  <text
                    key={index}
                    x={margin.left - 20}
                    y={y + 4}
                    textAnchor="end"
                    fontSize="11"
                    fill="#6b7280"
                    fontWeight="500"
                  >
                    {formatYAxisValue(value)}
                  </text>
                );
              })}
              
              {/* Área del gráfico */}
              <path
                d={areaPath}
                fill="url(#chartGradient)"
              />
              
              {/* Línea del gráfico */}
              <path
                d={chartPath}
                stroke="#3b82f6"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Puntos de datos */}
              {pointPositions.map((point, index) => (
                <g key={index}>
                  {/* Área de hover invisible */}
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="15"
                    fill="transparent"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => handlePointHover(point)}
                    onMouseLeave={handlePointLeave}
                  />
                  
                  {/* Punto visual */}
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={hoveredPoint?.index === index ? "8" : "5"}
                    fill="#3b82f6"
                    stroke="white"
                    strokeWidth={hoveredPoint?.index === index ? "3" : "2"}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => handlePointHover(point)}
                    onMouseLeave={handlePointLeave}
                  />
                </g>
              ))}
              
              {/* Tooltip */}
              {hoveredPoint && pointPositions.length > 0 && (
                <g>
                  {/* Línea de referencia */}
                  <line
                    x1={hoveredPoint.x}
                    y1={margin.top}
                    x2={hoveredPoint.x}
                    y2={margin.top + plotHeight}
                    stroke="#3b82f6"
                    strokeWidth="1"
                    strokeDasharray="3,3"
                    opacity="0.6"
                  />
                  
                  {/* Tooltip box */}
                  {(() => {
                    const tooltipWidth = 100;
                    const tooltipHeight = 45;
                    const tooltipX = hoveredPoint.x + 15;
                    const tooltipY = hoveredPoint.y - 25;
                    
                    const adjustedX = tooltipX + tooltipWidth > chartWidth - margin.right 
                      ? hoveredPoint.x - tooltipWidth - 15 
                      : tooltipX;
                    const adjustedY = tooltipY < margin.top 
                      ? hoveredPoint.y + 15 
                      : tooltipY;
                    
                    return (
                      <>
                        {/* Sombra */}
                        <rect
                          x={adjustedX + 2}
                          y={adjustedY + 2}
                          width={tooltipWidth}
                          height={tooltipHeight}
                          fill="rgba(0,0,0,0.1)"
                          rx="6"
                        />
                        
                        {/* Tooltip */}
                        <rect
                          x={adjustedX}
                          y={adjustedY}
                          width={tooltipWidth}
                          height={tooltipHeight}
                          fill="white"
                          stroke="#3b82f6"
                          strokeWidth="1.5"
                          rx="6"
                          filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
                        />
                        
                        {/* Contenido del tooltip */}
                        <text
                          x={adjustedX + 8}
                          y={adjustedY + 15}
                          fontSize="10"
                          fill="#374151"
                          fontWeight="600"
                        >
                          {formatValue(hoveredPoint.value)}
                        </text>
                        <text
                          x={adjustedX + 8}
                          y={adjustedY + 28}
                          fontSize="9"
                          fill="#6b7280"
                        >
                          {(() => {
                            const dateString = hoveredPoint.date.split('T')[0];
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
              {pointPositions.map((point, index) => {
                const dateString = point.date.split('T')[0];
                const [year, month, day] = dateString.split('-').map(Number);
                const date = new Date(year, month - 1, day);
                
                return (
                  <text
                    key={`date-${index}`}
                    x={point.x}
                    y={chartHeight - 15}
                    textAnchor="middle"
                    fontSize="11"
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
          )}
        </div>
      </CardContent>
    </Card>
  );
}; 