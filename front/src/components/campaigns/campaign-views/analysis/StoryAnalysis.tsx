import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Heart, MessageCircle, Eye, Save, CheckCircle, Loader2, Upload, X } from 'lucide-react';
import { httpApiClient } from '@/lib/http';

interface StoryAnalysisProps {
  postUrl: string;
  platform: string;
  postId?: string;
  onMetricsSaved?: () => void;
}

const StoryAnalysis: React.FC<StoryAnalysisProps> = ({ postUrl, platform, postId, onMetricsSaved }) => {
  const [metrics, setMetrics] = useState({
    likes: '',
    responses: '',
    alcance: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasExistingMetrics, setHasExistingMetrics] = useState(false);
  
  // Estados para screenshots
  const [screenshot, setScreenshot] = useState<{
    file: File | null;
    preview: string | null;
    url: string | null;
    uploadedAt: string | null;
  }>({
    file: null,
    preview: null,
    url: null,
    uploadedAt: null
  });
  const [isUploadingScreenshot, setIsUploadingScreenshot] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ NUEVO: Cargar métricas existentes cuando se monta el componente
  const loadExistingMetrics = async () => {
    if (!postId) return;

    setIsLoading(true);
    try {
      const endpoint = `/influencer-posts/${postId}/metrics`;
      console.log('📸 [STORY-ANALYSIS] Cargando métricas existentes para:', { postId, endpoint });
      
      const response = await httpApiClient.get(endpoint);
      console.log('📸 [STORY-ANALYSIS] Response completa:', response);
      console.log('📸 [STORY-ANALYSIS] Response.data:', response.data);
      
      const responseData = response.data as { success: boolean; data?: { post: any; metrics: any } };
      console.log('📸 [STORY-ANALYSIS] Data object:', responseData.data);
      console.log('📸 [STORY-ANALYSIS] Metrics object:', responseData.data?.metrics);
      
      const metrics = responseData.data?.metrics;
      if (metrics) {
        console.log('📸 [STORY-ANALYSIS] Metrics encontrados:', metrics);
        
        // Buscar métricas manuales en raw_response.manual_metrics primero
        let existingMetrics = null;
        if (metrics.raw_response?.manual_metrics) {
          existingMetrics = metrics.raw_response.manual_metrics;
          console.log('✅ [STORY-ANALYSIS] Métricas en raw_response.manual_metrics:', existingMetrics);
        } 
        // Si no están en manual_metrics, usar las columnas principales
        else if (metrics.likes_count !== undefined || metrics.comments_count !== undefined || metrics.views_count !== undefined) {
          existingMetrics = {
            likes: metrics.likes_count || 0,
            comments: metrics.comments_count || 0,
            alcance: metrics.views_count || 0
          };
          console.log('✅ [STORY-ANALYSIS] Métricas en columnas principales:', existingMetrics);
        }
        
        if (existingMetrics) {
          console.log('📸 [STORY-ANALYSIS] Métricas extraídas:', {
            likes: existingMetrics.likes,
            comments: existingMetrics.comments,
            alcance: existingMetrics.alcance
          });
          setMetrics({
            likes: existingMetrics.likes?.toString() || '',
            responses: existingMetrics.comments?.toString() || '',
            alcance: existingMetrics.alcance?.toString() || ''
          });
          setHasExistingMetrics(true);
          console.log('✅ [STORY-ANALYSIS] Inputs pre-llenados con:', {
            likes: existingMetrics.likes?.toString() || '',
            responses: existingMetrics.comments?.toString() || '',
            alcance: existingMetrics.alcance?.toString() || ''
          });
        } else {
          console.log('📸 [STORY-ANALYSIS] No se encontraron métricas válidas');
          setHasExistingMetrics(false);
        }

        // ✅ NUEVO: Cargar screenshot existente si hay
        const screenshotUrl = metrics?.raw_response?.screenshot_url;
        const uploadedAt = metrics?.raw_response?.screenshot_uploaded_at;
        
        if (screenshotUrl) {
          console.log('📸 [STORY-ANALYSIS] Screenshot encontrado:', screenshotUrl);
          setScreenshot(prev => ({
            ...prev,
            url: screenshotUrl,
            uploadedAt: uploadedAt || null
          }));
        }
      } else {
        console.log('📸 [STORY-ANALYSIS] No hay metrics en la respuesta');
        setHasExistingMetrics(false);
      }
    } catch (error) {
      console.error('❌ [STORY-ANALYSIS] Error cargando métricas existentes:', error);
      console.error('❌ [STORY-ANALYSIS] Error completo:', JSON.stringify(error, null, 2));
      setHasExistingMetrics(false);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ NUEVO: Cargar métricas al montar el componente
  useEffect(() => {
    loadExistingMetrics();
  }, [postId]);

  const handleMetricChange = (field: string, value: string) => {
    setMetrics(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveMetrics = async () => {
    if (!postId) {
      console.error('No postId provided');
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      const action = hasExistingMetrics ? 'Actualizando' : 'Guardando';
      console.log(`📸 [STORY-ANALYSIS] ${action} story metrics:`, { postId, metrics, hasExistingMetrics });
      
      const response = await httpApiClient.post(`/influencer-posts/${postId}/manual-metrics`, {
        likes: metrics.likes ? parseInt(metrics.likes) : 0,
        comments: metrics.responses ? parseInt(metrics.responses) : 0,
        alcance: metrics.alcance ? parseInt(metrics.alcance) : 0
      });

      const responseData = response.data as { success: boolean; message?: string };

      if (responseData.success) {
        const successAction = hasExistingMetrics ? 'actualizadas' : 'guardadas';
        console.log(`✅ [STORY-ANALYSIS] Métricas ${successAction} exitosamente`);
        setSaveSuccess(true);
        setHasExistingMetrics(true); // Ahora ya existen métricas
        
        // Notificar al componente padre para refrescar las métricas en la lista de posts
        if (onMetricsSaved) {
          onMetricsSaved();
        }
        
        // ✅ NUEVO: Recargar métricas en este componente para reflejar inmediatamente los cambios
        setTimeout(async () => {
          await loadExistingMetrics();
        }, 100); // Pequeño delay para que la DB se actualice
        
        // Ocultar mensaje de éxito después de 3 segundos
        setTimeout(() => {
          setSaveSuccess(false);
        }, 3000);
      } else {
        throw new Error(responseData.message || 'Error al guardar métricas');
      }
    } catch (error) {
      console.error('❌ [STORY-ANALYSIS] Error saving metrics:', error);
      // TODO: Mostrar mensaje de error al usuario
    } finally {
      setIsSaving(false);
    }
  };

  // Función para manejar selección de archivo
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Validar tamaño (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('El archivo es demasiado grande. Máximo 10MB');
      return;
    }

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setScreenshot(prev => ({
        ...prev,
        file,
        preview: e.target?.result as string,
        url: null // Limpiar URL existente si hay
      }));
    };
    reader.readAsDataURL(file);
  };

  // Función para subir screenshot
  const handleUploadScreenshot = async () => {
    if (!screenshot.file || !postId) return;

    setIsUploadingScreenshot(true);
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append('screenshot', screenshot.file);

      console.log('📸 [STORY-ANALYSIS] Subiendo screenshot:', { 
        postId, 
        fileName: screenshot.file.name,
        fileSize: screenshot.file.size,
        fileType: screenshot.file.type,
        formDataEntries: Array.from(formData.entries()).map(([key, value]) => [key, value instanceof File ? `File: ${value.name}` : value])
      });

      // Usar fetch para evitar interferencia del httpApiClient con headers
      const token = localStorage.getItem('token');
      const apiBaseUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:5000/api' 
        : 'https://influencerstracker-back.vercel.app/api';
      
      const fetchResponse = await fetch(`${apiBaseUrl}/influencer-posts/${postId}/screenshot`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: formData
      });

      const responseData = await fetchResponse.json() as { success: boolean; data?: { screenshotUrl: string; uploadedAt: string }; message?: string };
      
      if (!fetchResponse.ok) {
        throw new Error(responseData.message || 'Error al subir screenshot');
      }

      if (responseData.success && responseData.data) {
        console.log('✅ [STORY-ANALYSIS] Screenshot subido exitosamente:', responseData.data.screenshotUrl);
        
        setScreenshot(prev => ({
          ...prev,
          url: responseData.data!.screenshotUrl,
          uploadedAt: responseData.data!.uploadedAt,
          file: null,
          preview: null
        }));
        
        setUploadSuccess(true);
        
        // Limpiar input de archivo
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        // Ocultar mensaje de éxito después de 3 segundos
        setTimeout(() => {
          setUploadSuccess(false);
        }, 3000);
      } else {
        throw new Error('Error al subir screenshot');
      }
    } catch (error) {
      console.error('❌ [STORY-ANALYSIS] Error subiendo screenshot:', error);
      alert('Error al subir el screenshot. Por favor intenta de nuevo.');
    } finally {
      setIsUploadingScreenshot(false);
    }
  };

  // Función para remover screenshot seleccionado
  const handleRemoveScreenshot = () => {
    setScreenshot(prev => ({
      ...prev,
      file: null,
      preview: null
    }));
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Función para abrir selector de archivos
  const handleOpenFileSelector = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      {/* Screenshot Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Camera className="h-4 w-4" />
            Captura de Pantalla
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Input oculto para archivos */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Mostrar screenshot existente */}
          {screenshot.url && !screenshot.preview && (
            <div className="space-y-4">
              <div className="relative flex justify-center">
                <img
                  src={screenshot.url}
                  alt="Screenshot de la historia"
                  className="w-48 h-80 object-cover rounded-lg border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => window.open(screenshot.url!, '_blank')}
                />
              </div>
              <div className="text-center text-sm text-gray-600 space-y-1">
                {screenshot.uploadedAt && (
                  <p>Subido: {new Date(screenshot.uploadedAt).toLocaleString()}</p>
                )}
                <p className="text-xs text-gray-500">Haz clic en la imagen para verla en tamaño completo</p>
              </div>
              <div className="flex justify-center">
                <Button 
                  onClick={handleOpenFileSelector} 
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Cambiar Screenshot
                </Button>
              </div>
            </div>
          )}

          {/* Mostrar preview del archivo seleccionado */}
          {screenshot.preview && (
            <div className="space-y-4">
              <div className="relative flex justify-center">
                <img
                  src={screenshot.preview}
                  alt="Preview del screenshot"
                  className="w-48 h-80 object-cover rounded-lg border shadow-sm hover:shadow-md transition-shadow"
                />
                <Button
                  onClick={handleRemoveScreenshot}
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex justify-center gap-2">
                {uploadSuccess ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Screenshot guardado exitosamente</span>
                  </div>
                ) : (
                  <Button 
                    onClick={handleUploadScreenshot}
                    disabled={isUploadingScreenshot || !postId}
                    className="flex items-center gap-2"
                  >
                    {isUploadingScreenshot ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {isUploadingScreenshot ? 'Subiendo...' : 'Guardar Screenshot'}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Zona de carga cuando no hay screenshot */}
          {!screenshot.url && !screenshot.preview && (
            <div 
              className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={handleOpenFileSelector}
            >
            <Camera className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">Carga una captura de pantalla de la historia</p>
              <Button variant="outline" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
              Cargar Screenshot
            </Button>
          </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Metrics Input */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Métricas Manuales</CardTitle>
          <p className="text-sm text-gray-600">
            {hasExistingMetrics 
              ? 'Modifica las métricas de la historia de Instagram'
              : 'Ingresa las métricas: Likes, Respuestas y Alcance de la historia de Instagram'
            }
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <span className="text-gray-600">Cargando métricas existentes...</span>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Likes */}
                <div>
                  <Label htmlFor="likes" className="flex items-center gap-2 mb-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    Likes
                  </Label>
                  <Input
                    id="likes"
                    type="number"
                    placeholder="0"
                    value={metrics.likes}
                    onChange={(e) => handleMetricChange('likes', e.target.value)}
                    min="0"
                  />
                </div>

                {/* Responses */}
                <div>
                  <Label htmlFor="responses" className="flex items-center gap-2 mb-2">
                    <MessageCircle className="h-4 w-4 text-blue-500" />
                    Respuestas
                  </Label>
                  <Input
                    id="responses"
                    type="number"
                    placeholder="0"
                    value={metrics.responses}
                    onChange={(e) => handleMetricChange('responses', e.target.value)}
                    min="0"
                  />
                </div>

                {/* Alcance */}
                <div>
                  <Label htmlFor="alcance" className="flex items-center gap-2 mb-2">
                    <Eye className="h-4 w-4 text-purple-500" />
                    Alcance
                  </Label>
                  <Input
                    id="alcance"
                    type="number"
                    placeholder="0"
                    value={metrics.alcance}
                    onChange={(e) => handleMetricChange('alcance', e.target.value)}
                    min="0"
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4">
                {saveSuccess ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Métricas {hasExistingMetrics ? 'actualizadas' : 'guardadas'} exitosamente
                    </span>
                  </div>
                ) : (
                  <Button 
                    onClick={handleSaveMetrics}
                    disabled={isSaving || (!metrics.likes && !metrics.responses && !metrics.alcance) || !postId}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {isSaving 
                      ? (hasExistingMetrics ? 'Actualizando...' : 'Guardando...') 
                      : (hasExistingMetrics ? 'Actualizar Métricas' : 'Guardar Métricas')
                    }
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StoryAnalysis;