import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TrendingUp, TrendingDown, Minus, Clock, BarChart3, Users, MessageCircle, ThumbsUp } from 'lucide-react';
import StoryAnalysis from './StoryAnalysis';

interface AnalysisData {
  videoId: string;
  videoTitle: string;
  totalComments: number;
  analyzedComments: number;
  commentsSample: Array<{
    id: string;
    text: string;
    author: string;
    publishedAt: string;
    likeCount: number;
    replyCount: number;
    sentiment: {
      label: string;
      score: number;
      confidence: number;
      method: string;
    };
  }>;
  sentimentSummary: {
    positive: number;
    negative: number;
    neutral: number;
    positivePercentage: number;
    negativePercentage: number;
    neutralPercentage: number;
  };
  processingStats: {
    totalProcessed: number;
    processingTimeMs: number;
    batchesProcessed: number;
    averageProcessingTimePerComment: number;
    modelInfo?: {
      name: string;
      method: string;
      accuracy: string;
    };
  };
  platform?: string;
}

interface AnalysisResultsProps {
  data: AnalysisData;
  isLoading?: boolean;
  postUrl?: string;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ data, isLoading = false, postUrl }) => {
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="bg-gray-200 h-32 rounded-lg"></div>
        <div className="bg-gray-200 h-64 rounded-lg"></div>
        <div className="bg-gray-200 h-96 rounded-lg"></div>
      </div>
    );
  }

  // Detectar si es una historia de Instagram
  const isInstagramStory = data.platform === 'instagram' && postUrl && /instagram\.com\/stories\//i.test(postUrl);

  // Si es una historia, mostrar el componente específico
  if (isInstagramStory) {
    return <StoryAnalysis postUrl={postUrl} platform={data.platform || 'instagram'} />;
  }

  const getSentimentIcon = (label: string) => {
    switch (label) {
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'negative':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSentimentColor = (label: string) => {
    switch (label) {
      case 'positive':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'negative':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Resumen General */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Resumen del Análisis</h3>
          <div className="flex items-center space-x-2">
            {data.platform && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                data.platform === 'youtube' 
                  ? 'bg-red-100 text-red-700' 
                  : data.platform === 'tiktok'
                  ? 'bg-pink-100 text-pink-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {data.platform === 'youtube' ? '📺 YouTube' : 
                 data.platform === 'tiktok' ? '🎵 TikTok' : 
                 '🌐 ' + data.platform.toUpperCase()}
              </span>
            )}
            <Badge variant="secondary">
              {data.analyzedComments.toLocaleString()} comentarios analizados
            </Badge>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Users className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-gray-600">Total Comentarios</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{data.totalComments.toLocaleString()}</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <BarChart3 className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-sm font-medium text-gray-600">Analizados</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{data.analyzedComments.toLocaleString()}</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-5 w-5 text-purple-600 mr-2" />
              <span className="text-sm font-medium text-gray-600">Tiempo</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {(data.processingStats.processingTimeMs / 1000).toFixed(1)}s
            </p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <MessageCircle className="h-5 w-5 text-orange-600 mr-2" />
              <span className="text-sm font-medium text-gray-600">Velocidad</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {data.processingStats.averageProcessingTimePerComment.toFixed(0)}ms
            </p>
          </div>
        </div>

        {data.processingStats.modelInfo && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">🤖 Modelo de IA Utilizado</h4>
            <div className="text-sm text-blue-800">
              <p><strong>Nombre:</strong> {data.processingStats.modelInfo.name}</p>
              <p><strong>Método:</strong> {data.processingStats.modelInfo.method}</p>
              <p><strong>Precisión:</strong> {data.processingStats.modelInfo.accuracy}</p>
            </div>
          </div>
        )}
      </div>

      {/* Análisis de Sentimientos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-green-700">
              <TrendingUp className="h-5 w-5 mr-2" />
              Positivos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700 mb-2">
              {data.sentimentSummary.positivePercentage}%
            </div>
            <Progress value={data.sentimentSummary.positivePercentage} className="mb-2" />
            <p className="text-sm text-gray-600">
              {data.sentimentSummary.positive.toLocaleString()} comentarios
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-red-700">
              <TrendingDown className="h-5 w-5 mr-2" />
              Negativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-700 mb-2">
              {data.sentimentSummary.negativePercentage}%
            </div>
            <Progress value={data.sentimentSummary.negativePercentage} className="mb-2" />
            <p className="text-sm text-gray-600">
              {data.sentimentSummary.negative.toLocaleString()} comentarios
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-gray-700">
              <Minus className="h-5 w-5 mr-2" />
              Neutrales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-700 mb-2">
              {data.sentimentSummary.neutralPercentage}%
            </div>
            <Progress value={data.sentimentSummary.neutralPercentage} className="mb-2" />
            <p className="text-sm text-gray-600">
              {data.sentimentSummary.neutral.toLocaleString()} comentarios
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Comentarios */}
      <Card>
        <CardHeader>
          <CardTitle>Comentarios Analizados</CardTitle>
          <p className="text-sm text-gray-600">
            Muestra representativa de {data.commentsSample.length} comentarios ordenados por relevancia
          </p>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {data.commentsSample.map((comment) => (
                <div
                  key={comment.id}
                  className={`p-4 rounded-lg border ${getSentimentColor(comment.sentiment.label)}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getSentimentIcon(comment.sentiment.label)}
                      <span className="font-medium text-sm">{comment.author}</span>
                      <Badge variant="outline" className="text-xs">
                        {comment.sentiment.label}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {(comment.sentiment.confidence * 100).toFixed(0)}% confianza
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span className="flex items-center">
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        {comment.likeCount}
                      </span>
                      <span>{formatDate(comment.publishedAt)}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-800 leading-relaxed">
                    {comment.text}
                  </p>
                  <div className="mt-2 text-xs text-gray-500">
                    Método: {comment.sentiment.method} • Score: {comment.sentiment.score.toFixed(3)}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalysisResults; 