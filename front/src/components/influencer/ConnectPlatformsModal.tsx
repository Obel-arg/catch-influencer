"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  Plus, 
  Trash2, 
  ExternalLink,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RobustModal } from "@/components/ui/robust-modal";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { creatorService } from "@/lib/services/creator";
import { influencerService } from "@/lib/services/influencer";

interface PlatformInfo {
  platform: string;
  platformId: string;
  isConnected: boolean;
  isVerified: boolean;
  needsSubmission: boolean;
  error?: string;
}

interface ConnectPlatformsModalProps {
  isOpen: boolean;
  onClose: () => void;
  influencer: any; // Tipo del influencer
  onPlatformsUpdated?: () => void;
}

export function ConnectPlatformsModal({ 
  isOpen, 
  onClose, 
  influencer, 
  onPlatformsUpdated 
}: ConnectPlatformsModalProps) {
  const [mounted, setMounted] = useState(false);
  const [platforms, setPlatforms] = useState<PlatformInfo[]>([]);
  const [newPlatformUrl, setNewPlatformUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  // Asegurar que el componente esté montado
  useEffect(() => {
    setMounted(true);
  }, []);

  // Inicializar plataformas cuando se abre el modal
  useEffect(() => {
    if (isOpen && influencer) {
      initializePlatforms();
    }
  }, [isOpen, influencer]);

  // Inicializar las plataformas del influencer
  const initializePlatforms = () => {
    const platformInfo = influencer.platform_info || {};
    const currentPlatforms: PlatformInfo[] = [];

    // YouTube
    if (platformInfo.youtube?.youtubeId) {
      currentPlatforms.push({
        platform: 'youtube',
        platformId: platformInfo.youtube.youtubeId,
        isConnected: true,
        isVerified: true,
        needsSubmission: false
      });
    }

    // Instagram
    if (platformInfo.instagram?.basicInstagram?.instagramId) {
      currentPlatforms.push({
        platform: 'instagram',
        platformId: platformInfo.instagram.basicInstagram.instagramId,
        isConnected: true,
        isVerified: true,
        needsSubmission: false
      });
    }

    // TikTok
    if (platformInfo.tiktok?.basicTikTok?.tiktokId) {
      currentPlatforms.push({
        platform: 'tiktok',
        platformId: platformInfo.tiktok.basicTikTok.tiktokId,
        isConnected: true,
        isVerified: true,
        needsSubmission: false
      });
    }

    setPlatforms(currentPlatforms);
  };

  // Extraer plataforma e ID de URL
  const extractPlatformAndId = (url: string) => {
    if (!url) return null;
    return creatorService.extractPlatformAndId(url);
  };

  // Verificar si una plataforma ya existe
  const platformExists = (platform: string) => {
    return platforms.some(p => p.platform === platform);
  };

  // Obtener icono de plataforma
  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'youtube':
        return <img src="/icons/youtube.svg" alt="YouTube" className="h-4 w-4" />;
      case 'instagram':
        return <img src="/icons/instagram.svg" alt="Instagram" className="h-4 w-4" />;
      case 'tiktok':
        return <img src="/icons/tiktok.svg" alt="TikTok" className="h-4 w-4" />;
      default:
        return null;
    }
  };

  // Estados para nueva plataforma
              const [newPlatformData, setNewPlatformData] = useState<{
              platform: string;
              platformId: string;
              isVerified: boolean;
              existsInCreatorDB: boolean;
            } | null>(null);

  // Extraer plataforma e ID cuando se ingresa URL
  const handleUrlChange = (url: string) => {  
    setNewPlatformUrl(url);
    setSubmitError("");
    setSubmitSuccess("");

    if (!url) {
      
      setNewPlatformData(null);
      return;
    }

    const result = extractPlatformAndId(url);
    
    
    if (result) {
      // URL coincide con patrones conocidos
      
                      setNewPlatformData({
                  platform: result.platform,
                  platformId: result.platformUserId,
                  isVerified: false,
                  existsInCreatorDB: false
                });
    } else {
      // URL no coincide con patrones conocidos, pero permitir verificar manualmente
      
      setNewPlatformData({
        platform: 'unknown',
        platformId: url,
        isVerified: false,
        existsInCreatorDB: false
      });
    }
  };

  // Verificar nueva plataforma en CreatorDB
  const verifyNewPlatform = async () => {
    if (!newPlatformData) return;

    setIsLoading(true);
    setSubmitError("");

    try {
      if (newPlatformData.platform === 'unknown') {
        // Para URLs que no coinciden con patrones conocidos, intentar detectar la plataforma
        const url = newPlatformData.platformId;
        let detectedPlatform = 'unknown';
        
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
          detectedPlatform = 'youtube';
        } else if (url.includes('instagram.com')) {
          detectedPlatform = 'instagram';
        } else if (url.includes('tiktok.com')) {
          detectedPlatform = 'tiktok';
        } else {
          setSubmitError("No se pudo detectar la plataforma. Verifica que la URL sea válida.");
          return;
        }
        
        // Ahora verificar en CreatorDB con la plataforma detectada
        // Extraer el ID correcto de la URL
        let platformId = newPlatformData.platformId;
        
        // Si es una URL, extraer el ID
        if (newPlatformData.platformId.includes('youtube.com/')) {
          const url = newPlatformData.platformId;
          // Extraer ID del canal de URLs como youtube.com/UC... (sin /channel/)
          const directChannelMatch = url.match(/youtube\.com\/(UC[a-zA-Z0-9_-]+)/);
          if (directChannelMatch && directChannelMatch[1]) {
            platformId = directChannelMatch[1];
          }
        }
        

        
        const checkResult = await creatorService.checkIdExists(detectedPlatform, platformId);
        
        setNewPlatformData({
          ...newPlatformData,
          platform: detectedPlatform,
          isVerified: true,
          existsInCreatorDB: checkResult.exists
        });
      } else {
        // Para plataformas conocidas, verificar en CreatorDB
        // newPlatformData.platformId ya debería ser el ID correcto para plataformas conocidas
        const checkResult = await creatorService.checkIdExists(newPlatformData.platform, newPlatformData.platformId);
        
        setNewPlatformData({
          ...newPlatformData,
          isVerified: true,
          existsInCreatorDB: checkResult.exists
        });
      }
    } catch (error) {
      setSubmitError(`Error verificando plataforma: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Agregar plataforma existente (sin enviar a CreatorDB)
  const addExistingPlatform = () => {
    if (!newPlatformData) return;

    if (platformExists(newPlatformData.platform)) {
      setSubmitError(`Ya tienes conectada la plataforma ${newPlatformData.platform}.`);
      return;
    }

    const newPlatform: PlatformInfo = {
      platform: newPlatformData.platform,
      platformId: newPlatformData.platformId,
      isConnected: true,
      isVerified: true,
      needsSubmission: false
    };

    setPlatforms([...platforms, newPlatform]);
    setNewPlatformUrl("");
    setNewPlatformData(null);
    setSubmitSuccess(`✅ Plataforma ${newPlatformData.platform} agregada.`);
  };

  // Agregar plataforma verificada y hacer refresh de datos
  const addVerifiedPlatform = async () => {
    if (!newPlatformData) return;

    if (platformExists(newPlatformData.platform)) {
      setSubmitError(`Ya tienes conectada la plataforma ${newPlatformData.platform}.`);
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      // Agregar la plataforma a la lista
      // Asegurar que se use el ID correcto, no la URL
      let platformId = newPlatformData.platformId;
      
      // Si es YouTube y contiene una URL, extraer el ID
      if (newPlatformData.platform === 'youtube' && newPlatformData.platformId.includes('youtube.com/')) {
        const directChannelMatch = newPlatformData.platformId.match(/youtube\.com\/(UC[a-zA-Z0-9_-]+)/);
        if (directChannelMatch && directChannelMatch[1]) {
          platformId = directChannelMatch[1];
        }
      }
      
      const newPlatform: PlatformInfo = {
        platform: newPlatformData.platform,
        platformId: platformId,
        isConnected: true,
        isVerified: true,
        needsSubmission: false
      };

      setPlatforms([...platforms, newPlatform]);
      setNewPlatformUrl("");
      setNewPlatformData(null);
      setSubmitSuccess(`✅ Plataforma ${newPlatformData.platform} agregada exitosamente. Refrescando datos...`);

      // Hacer refresh de datos del influencer con la nueva plataforma
      // Actualizar la información del influencer con la nueva plataforma antes del refresh
      if (influencer && influencer.platform_info) {
        const updatedPlatformInfo = { ...influencer.platform_info };
        
        if (newPlatform.platform === 'youtube') {
          updatedPlatformInfo.youtube = {
            ...updatedPlatformInfo.youtube,
            youtubeId: newPlatform.platformId
          };
        } else if (newPlatform.platform === 'instagram') {
          updatedPlatformInfo.instagram = {
            ...updatedPlatformInfo.instagram,
            basicInstagram: {
              ...updatedPlatformInfo.instagram?.basicInstagram,
              instagramId: newPlatform.platformId
            }
          };
        } else if (newPlatform.platform === 'tiktok') {
          updatedPlatformInfo.tiktok = {
            ...updatedPlatformInfo.tiktok,
            basicTikTok: {
              ...updatedPlatformInfo.tiktok?.basicTikTok,
              tiktokId: newPlatform.platformId
            }
          };
        }
        
        // Actualizar el influencer localmente
        influencer.platform_info = updatedPlatformInfo;
      }
      
      // Llamar a la función de actualización
      if (onPlatformsUpdated) {
        onPlatformsUpdated();
      }

    } catch (error) {
      setSubmitError(`Error agregando plataforma: ${error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Agregar y enviar nuevo creador a CreatorDB (solo cuando no existe)
  const addNewCreator = async () => {
    if (!newPlatformData) return;

    if (platformExists(newPlatformData.platform)) {
      setSubmitError(`Ya tienes conectada la plataforma ${newPlatformData.platform}.`);
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const submitResult = await creatorService.submitCreatorWithHistory(
        newPlatformData.platform, 
        newPlatformData.platformId, 
        newPlatformUrl
      );

      if (submitResult.success) {
        // Asegurar que se use el ID correcto, no la URL
        let platformId = newPlatformData.platformId;
        
        // Si es YouTube y contiene una URL, extraer el ID
        if (newPlatformData.platform === 'youtube' && newPlatformData.platformId.includes('youtube.com/')) {
          const directChannelMatch = newPlatformData.platformId.match(/youtube\.com\/(UC[a-zA-Z0-9_-]+)/);
          if (directChannelMatch && directChannelMatch[1]) {
            platformId = directChannelMatch[1];
          }
        }
        
        const newPlatform: PlatformInfo = {
          platform: newPlatformData.platform,
          platformId: platformId,
          isConnected: true,
          isVerified: true,
          needsSubmission: false
        };

        setPlatforms([...platforms, newPlatform]);
        setNewPlatformUrl("");
        setNewPlatformData(null);
        setSubmitSuccess(`✅ Creador ${newPlatformData.platform} agregado exitosamente. Los datos completos se obtendrán al guardar cambios.`);
      } else {
        throw new Error(submitResult.error || "Error al enviar el creador");
      }
    } catch (error) {
      setSubmitError(`Error enviando creador: ${error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Verificar plataforma en CreatorDB
  const verifyPlatform = async (platformInfo: PlatformInfo) => {
    setIsLoading(true);
    setSubmitError("");

    try {
      const result = await creatorService.checkIdExists(platformInfo.platform, platformInfo.platformId);

      const updatedPlatforms = platforms.map(p => 
        p.platform === platformInfo.platform 
          ? { ...p, isVerified: result.exists, needsSubmission: !result.exists }
          : p
      );

      setPlatforms(updatedPlatforms);

             // No mostrar mensaje de confirmación, solo actualizar el estado

    } catch (error) {
      setSubmitError(`Error verificando plataforma ${platformInfo.platform}: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Enviar plataforma a CreatorDB
  const submitPlatform = async (platformInfo: PlatformInfo) => {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const result = await creatorService.submitCreatorWithHistory(
        platformInfo.platform, 
        platformInfo.platformId, 
        `https://${platformInfo.platform}.com/${platformInfo.platformId}`
      );

      if (result.success) {
        const updatedPlatforms = platforms.map(p => 
          p.platform === platformInfo.platform 
            ? { ...p, isConnected: true, needsSubmission: false }
            : p
        );

        setPlatforms(updatedPlatforms);
                 // No mostrar mensaje de confirmación, solo actualizar el estado
      } else {
        throw new Error(result.error || "Error al enviar la plataforma");
      }
    } catch (error) {
      setSubmitError(`Error enviando plataforma ${platformInfo.platform}: ${error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Guardar cambios en el influencer
  const saveChanges = async () => {
    setIsLoading(true);
    setSubmitError("");

    try {
      // 🔧 NUEVA FUNCIONALIDAD: Obtener datos completos de nuevas plataformas
      const updatedPlatformInfo = { ...influencer.platform_info };
      const newPlatforms = platforms.filter(platform => {
        // Verificar si es una plataforma nueva (no existía antes)
        if (platform.platform === 'youtube') {
          return !influencer.platform_info?.youtube?.youtubeId;
        } else if (platform.platform === 'instagram') {
          return !influencer.platform_info?.instagram?.basicInstagram?.instagramId;
        } else if (platform.platform === 'tiktok') {
          return !influencer.platform_info?.tiktok?.basicTikTok?.tiktokId;
        }
        return false;
      });

      // Obtener datos completos de nuevas plataformas
      if (newPlatforms.length > 0) {
        setSubmitSuccess("Obteniendo datos completos de nuevas plataformas...");
        
        for (const platform of newPlatforms) {
          try {
            // Construir parámetros para obtener datos completos
            const params: any = {};
            if (platform.platform === 'youtube') {
              params.youtubeId = platform.platformId;
            } else if (platform.platform === 'instagram') {
              params.instagramId = platform.platformId;
            } else if (platform.platform === 'tiktok') {
              params.tiktokId = platform.platformId;
            }
            
            // Obtener datos completos de la plataforma
            const fullData = await influencerService.getFullInfluencerData(params);
            
            if (fullData) {
              // Actualizar platform_info con los datos completos
              if (platform.platform === 'youtube' && fullData.youtube) {
                updatedPlatformInfo.youtube = {
                  ...updatedPlatformInfo.youtube,
                  ...fullData.youtube
                };
              } else if (platform.platform === 'instagram' && fullData.instagram) {
                updatedPlatformInfo.instagram = {
                  ...updatedPlatformInfo.instagram,
                  ...fullData.instagram
                };
              } else if (platform.platform === 'tiktok' && fullData.tiktok) {
                updatedPlatformInfo.tiktok = {
                  ...updatedPlatformInfo.tiktok,
                  ...fullData.tiktok
                };
              }
            }
          } catch (dataError) {
            console.warn(`⚠️ Error obteniendo datos completos de ${platform.platform}:`, dataError);
            // Si no se pueden obtener los datos completos, al menos guardar el ID
            if (platform.platform === 'youtube') {
              updatedPlatformInfo.youtube = {
                ...updatedPlatformInfo.youtube,
                youtubeId: platform.platformId
              };
            } else if (platform.platform === 'instagram') {
              updatedPlatformInfo.instagram = {
                ...updatedPlatformInfo.instagram,
                basicInstagram: {
                  ...updatedPlatformInfo.instagram?.basicInstagram,
                  instagramId: platform.platformId
                }
              };
            } else if (platform.platform === 'tiktok') {
              updatedPlatformInfo.tiktok = {
                ...updatedPlatformInfo.tiktok,
                basicTikTok: {
                  ...updatedPlatformInfo.tiktok?.basicTikTok,
                  tiktokId: platform.platformId
                }
              };
            }
          }
        }
      }

      // Actualizar platform_info con todas las plataformas (nuevas y existentes)
      platforms.forEach(platform => {
        if (platform.isConnected) {
          if (platform.platform === 'youtube') {
            updatedPlatformInfo.youtube = {
              ...updatedPlatformInfo.youtube,
              youtubeId: platform.platformId
            };
          } else if (platform.platform === 'instagram') {
            updatedPlatformInfo.instagram = {
              ...updatedPlatformInfo.instagram,
              basicInstagram: {
                ...updatedPlatformInfo.instagram?.basicInstagram,
                instagramId: platform.platformId
              }
            };
          } else if (platform.platform === 'tiktok') {
            updatedPlatformInfo.tiktok = {
              ...updatedPlatformInfo.tiktok,
              basicTikTok: {
                ...updatedPlatformInfo.tiktok?.basicTikTok,
                tiktokId: platform.platformId
              }
            };
          }
        }
      });

      // Actualizar social_platforms array
      const connectedPlatforms = platforms
        .filter(p => p.isConnected)
        .map(p => p.platform);

      const updateData = {
        platform_info: updatedPlatformInfo,
        social_platforms: connectedPlatforms
      };

      await influencerService.updateInfluencer(influencer.id, updateData);

      setSubmitSuccess("Plataformas actualizadas exitosamente.");
      
      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        onClose();
        onPlatformsUpdated?.();
      }, 2000);

    } catch (error) {
      setSubmitError(`Error guardando cambios: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Remover plataforma
  const removePlatform = (platformToRemove: string) => {
    setPlatforms(platforms.filter(p => p.platform !== platformToRemove));
  };

  // Renderizar el modal
  const modalContent = (
          <RobustModal isOpen={isOpen} onClose={onClose} size="xl" className="max-w-4xl">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Conectar Plataformas</h2>
          <div className="flex items-center gap-2">
            <img 
              src={influencer?.avatar} 
              alt={influencer?.name}
              className="w-8 h-8 rounded-full"
            />
            <span className="font-medium">{influencer?.name}</span>
          </div>
        </div>

        {/* Plataformas actuales */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Plataformas Conectadas</h3>
          <div className="space-y-3">
            {platforms.map((platform) => (
              <div key={platform.platform} className="flex items-center justify-between p-3 border rounded-lg">
                                 <div className="flex items-center gap-3">
                   <div className="flex items-center gap-2">
                     {getPlatformIcon(platform.platform)}
                     <span className="font-mono text-sm">{platform.platformId}</span>
                   </div>
                   {platform.isConnected && (
                     <CheckCircle className="h-4 w-4 text-green-600" />
                   )}
                 </div>
                
                <div className="flex items-center gap-2">
                  {!platform.isVerified && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => verifyPlatform(platform)}
                      disabled={isLoading}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Verificar
                    </Button>
                  )}
                  
                  
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removePlatform(platform.platform)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {platforms.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No hay plataformas conectadas
              </p>
            )}
          </div>
        </div>

        <Separator className="my-6" />

        {/* Agregar nueva plataforma */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Agregar Nueva Plataforma</h3>
          
          {/* Input URL */}
          <div className="flex gap-2 mb-3">
            <Input
              placeholder="https://www.instagram.com/usuario/"
              value={newPlatformUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              className="flex-1"
            />
          </div>

          {/* Información de plataforma detectada */}
          
          {newPlatformData && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                                     <div className="flex items-center gap-2 mb-1">
                     <div className="flex items-center gap-2">
                       {getPlatformIcon(newPlatformData.platform)}
                       <span className="font-mono text-sm">{newPlatformData.platformId}</span>
                     </div>
                   </div>
                                     <p className="text-sm text-gray-600">
                     {newPlatformData.isVerified 
                       ? (newPlatformData.existsInCreatorDB 
                           ? "✅ Verificado - Disponible" 
                           : "ℹ️ Verificado - No disponible")
                       : "⏳ Sin verificar"
                     }
                   </p>
                </div>
                
                <div className="flex gap-2">
                  {!newPlatformData.isVerified && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={verifyNewPlatform}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          Verificando...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Verificar
                        </>
                      )}
                    </Button>
                  )}
                  
                                     {newPlatformData.isVerified && newPlatformData.existsInCreatorDB && (
                     <Button
                       variant="default"
                       size="sm"
                       onClick={addVerifiedPlatform}
                       disabled={isSubmitting}
                     >
                       {isSubmitting ? (
                         <>
                           <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                           Agregando...
                         </>
                       ) : (
                         <>
                           <Plus className="h-4 w-4 mr-1" />
                           Agregar Plataforma
                         </>
                       )}
                     </Button>
                   )}
                   
                   {newPlatformData.isVerified && !newPlatformData.existsInCreatorDB && (
                     <Button
                       variant="default"
                       size="sm"
                       onClick={addNewCreator}
                       disabled={isSubmitting}
                     >
                       {isSubmitting ? (
                         <>
                           <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                           Enviando...
                         </>
                       ) : (
                         <>
                           <ExternalLink className="h-4 w-4 mr-1" />
                           Agregar Creador
                         </>
                       )}
                     </Button>
                   )}
                </div>
              </div>
            </div>
          )}

          <p className="text-sm text-gray-500">
            Soporta URLs de Instagram, TikTok y YouTube
          </p>
        </div>

        {/* Mensajes de estado */}
        {submitError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        {submitSuccess && (
          <Alert className="mb-4">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{submitSuccess}</AlertDescription>
          </Alert>
        )}

        {/* Botones de acción */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={saveChanges} 
            disabled={isLoading || platforms.length === 0}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar Cambios"
            )}
          </Button>
        </div>
      </div>
    </RobustModal>
  );

  return mounted && typeof window !== 'undefined' 
    ? createPortal(modalContent, document.body)
    : null;
}
