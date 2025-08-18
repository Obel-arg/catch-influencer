import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, Clock, RefreshCw, Image, Sparkles, TrendingUp } from "lucide-react";

interface LoadingStateProps {
  onRefresh: () => void;
}

interface ErrorStateProps {
  error: string;
  onRefresh: () => void;
}

interface NoDataStateProps {
  postImage?: string;
  onRefresh: () => void;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ onRefresh }) => (
  <Card className="border border-gray-200 bg-white shadow-sm">
    <CardContent className="p-8 text-center">
      <div className="mb-6">
        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
          <Loader2 className="h-8 w-8 text-white animate-spin" />
        </div>
      </div>
      
      <h3 className="text-xl font-semibold mb-3 text-gray-900">
        Cargando análisis
      </h3>
      <p className="text-gray-600 mb-6 max-w-sm mx-auto">
        Estamos procesando los comentarios y generando insights...
      </p>
      
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-5 w-5 text-blue-500" />
          <span className="font-medium text-gray-900">Procesando datos</span>
        </div>
        <div className="text-left space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-700">Extrayendo comentarios del post</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-700">Analizando sentimientos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-700">Generando reporte final</span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onRefresh }) => (
  <Card className="border border-red-200 bg-white shadow-sm">
    <CardContent className="p-8 text-center">
      <div className="mb-6">
        <div className="w-20 h-20 mx-auto mb-4 bg-red-500 rounded-full flex items-center justify-center shadow-md">
          <AlertTriangle className="h-8 w-8 text-white" />
        </div>
      </div>
      
      <h3 className="text-xl font-semibold mb-3 text-gray-900">
        Error al cargar análisis
      </h3>
      <p className="text-gray-600 mb-6 max-w-sm mx-auto">
        {error}
      </p>
      
      <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-6">
        <p className="text-sm text-gray-700">
          <strong className="text-gray-900">Posibles causas:</strong><br/>
          • Problemas de conexión temporal<br/>
          • El post aún se está procesando<br/>
          • Error en el servidor de análisis
        </p>
      </div>
      
      <Button 
        onClick={onRefresh}
        variant="outline"
        className="border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400 font-medium px-6 py-3 transition-all duration-200"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Reintentar análisis
      </Button>
    </CardContent>
  </Card>
);

export const NoDataState: React.FC<NoDataStateProps> = ({ postImage, onRefresh }) => (
  <Card className="border border-gray-200 bg-white shadow-sm">
    <CardContent className="p-8 text-center">
      <div className="mb-6 mt-4">
        {postImage ? (
          <div className="relative">
            <div className="w-24 h-16 mx-auto mb-4 rounded-lg overflow-hidden shadow-md border border-gray-200">
              <img 
                src={postImage} 
                alt="Post" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
              <Clock className="h-4 w-4 text-white" />
            </div>
          </div>
        ) : (
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mt-4 shadow-md">
            <Clock className="h-8 w-8 text-white" />
          </div>
        )}
      </div>
      
      <h3 className="text-xl font-semibold mb-3 text-gray-900">
        Análisis en progreso
      </h3>
      <p className="text-gray-600 mb-6 max-w-sm mx-auto">
        El análisis de sentimientos está siendo procesado en segundo plano.
      </p>
      
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-5 w-5 text-blue-500" />
          <span className="font-medium text-gray-900">Sistema Automático de IA</span>
        </div>
        <div className="text-left space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Extracción automática de comentarios</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-700">Análisis de sentimientos con OpenAI</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Generación de insights avanzados</span>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600 font-medium">
          ⚡ Soporta: YouTube, TikTok, Instagram, Twitter/X
        </div>
      </div>
      
     
    </CardContent>
  </Card>
); 