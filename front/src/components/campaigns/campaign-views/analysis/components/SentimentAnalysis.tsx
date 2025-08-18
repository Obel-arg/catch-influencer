import React from 'react';
import {  Heart, MessageCircle, TrendingDown, BarChart3, Target, Scale } from 'lucide-react';
import { SentimentAnalysisData } from "@/lib/services/analysis/sentiment-analysis.service";
import { cn } from "@/lib/utils";

interface ExtendedSentimentAnalysisData extends SentimentAnalysisData {
  reach_estimate?: number;
  engagement_rate?: number;
  conversion_estimate?: number;
  conversion_rate?: number;
  impression_estimate?: number;
  virality_score?: number;
  influence_score?: number;
}

interface SentimentAnalysisProps {
  analysisData: ExtendedSentimentAnalysisData;
}

export const SentimentAnalysis: React.FC<SentimentAnalysisProps> = ({ analysisData }) => {
  const sentiments = [
    { 
      label: 'Positivo', 
      value: analysisData.positive_percentage, 
      color: 'from-green-400 to-emerald-500',
      bgColor: 'from-green-50 to-emerald-100',
      iconColor: 'text-green-500',
      icon: Heart,
      description: 'Comentarios favorables y elogios'
    },
    { 
      label: 'Neutral', 
      value: analysisData.neutral_percentage, 
      color: 'from-yellow-400 to-amber-500',
      bgColor: 'from-yellow-50 to-amber-100',
      iconColor: 'text-yellow-500',
      icon: Scale,
      description: 'Comentarios informativos y neutros'
    },
    { 
      label: 'Negativo', 
      value: analysisData.negative_percentage, 
      color: 'from-red-400 to-rose-500',
      bgColor: 'from-red-50 to-rose-100',
      iconColor: 'text-red-500',
      icon: TrendingDown,
      description: 'Críticas y comentarios negativos'
    }
  ];

  const maxSentiment = sentiments.reduce((max, sentiment) => 
    sentiment.value > max.value ? sentiment : max, sentiments[0]
  );

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">

        <div>
          <h3 className="text-base font-bold text-gray-900">Análisis de Sentimientos</h3>
          <p className="text-xs text-gray-600">
            Análisis inteligente de {analysisData.total_comments.toLocaleString()} comentarios
          </p>
        </div>
      </div>

      {/* Sentimiento predominante mejorado */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className=" rounded-xl">
              <maxSentiment.icon className={cn("h-5 w-5", maxSentiment.iconColor)} />
            </div>
            <div>
              <p className="text-base font-bold text-gray-900">
                Sentimiento: {maxSentiment.label}
              </p>
              <p className="text-xs text-gray-600">
                Predominante
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900">
              {Math.round(maxSentiment.value)}%
            </div>

          </div>
        </div>
        
        {/* Barras de progreso mejoradas */}
        <div className="space-y-4">
          {sentiments.map((sentiment, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <sentiment.icon className={cn("h-4 w-4", sentiment.iconColor)} />
                  <span className="text-xs font-semibold text-gray-800">
                    {sentiment.label}
                  </span>
                </div>
                <span className="text-xs font-bold text-gray-700">
                  {Math.round(sentiment.value)}%
                </span>
              </div>
              <div className="relative">
                <div className="bg-gray-200 rounded-full h-3">
                  <div 
                    className={cn(
                      "h-3 rounded-full transition-all duration-700 bg-gradient-to-r",
                      sentiment.color
                    )}
                    style={{ width: `${sentiment.value}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}; 