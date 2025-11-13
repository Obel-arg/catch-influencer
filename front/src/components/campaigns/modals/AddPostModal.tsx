import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X, Wand2, Loader2, CheckCircle, Link, Upload } from "lucide-react";
import { isYouTubeUrl, getYouTubeThumbnail } from "@/utils/youtube";
import {
  isTikTokUrl,
  getTikTokThumbnailBest,
  getTikTokThumbnailValidated,
} from "@/utils/tiktok";
import {
  isTwitterUrl,
  getTwitterThumbnail,
  getTwitterThumbnailValidated,
  isTwitterTweetUrl,
} from "@/utils/twitter";
import { twitterService } from "@/lib/services/twitter.service";
import {
  isInstagramUrl,
  getInstagramThumbnailValidated,
} from "@/utils/instagram";
import { ImageProxyService } from "@/lib/services/image-proxy.service";
import { SmartImage } from "@/components/ui/SmartImage";
import {
  campaignScheduleService,
  CampaignSchedule,
} from "@/lib/services/campaign/campaign-schedule.service";

// Función robusta para mostrar confirmación de éxito
const showSuccessConfirmation = () => {
  // Método 1: Toast personalizado
  try {
    if (typeof window !== "undefined" && (window as any).showPostSuccessToast) {
      (window as any).showPostSuccessToast();
      return;
    }
  } catch (error) {}

  // Método 2: Notificación del navegador
  try {
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      new Notification("¡Post agregado exitosamente!", {
        body: "El post se está procesando automáticamente",
        icon: "/favicon.ico",
        badge: "/favicon.ico",
      });
      return;
    }
  } catch (error) {}

  // Método 3: Alerta nativa (siempre funciona)
  alert(
    "¡Post agregado exitosamente!\n\nEl post se está procesando automáticamente."
  );
};

// Estilos CSS para la animación
const toastStyles = `
  @keyframes slideIn {
    from {
      transform: translateY(-100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

// Agregar estilos al head
if (typeof document !== "undefined") {
  const styleId = "success-toast-styles";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = toastStyles;
    document.head.appendChild(style);
  }
}

interface AddPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (postData: CreatePostData) => Promise<void>;
  onSuccess?: () => void; // Callback para cuando el post se crea exitosamente
  influencerName: string;
  campaignId: string;
  influencerId: string;
}

export interface CreatePostData {
  post_url: string;
  image_url?: string;
  platform: string;
  caption?: string;
  post_date?: Date;
  performance_rating?: string;
  likes_count?: number;
  comments_count?: number;
}

export const AddPostModal: React.FC<AddPostModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onSuccess,
  influencerName,
  campaignId,
  influencerId,
}) => {
  const [formData, setFormData] = useState<CreatePostData>({
    post_url: "",
    image_url: "",
    platform: "instagram",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isExtractingThumbnail, setIsExtractingThumbnail] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [urlError, setUrlError] = useState<string>("");

  // Nuevos estados para schedules pendientes
  const [pendingSchedules, setPendingSchedules] = useState<CampaignSchedule[]>(
    []
  );
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>("");
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  
  // Estados para upload de imagen personalizada
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Inicializar función global solo en el cliente
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Función global para mostrar toast de éxito
      (window as any).showPostSuccessToast = () => {
        // Remover toast existente si hay uno
        const existingToast = document.getElementById("post-success-toast");
        if (existingToast) {
          existingToast.remove();
        }

        // Crear el toast
        const toast = document.createElement("div");
        toast.id = "post-success-toast";
        toast.className =
          "fixed top-4 right-4 z-[99999] bg-green-50 border-2 border-green-200 text-green-800 px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3";
        toast.style.cssText = `
          animation: slideIn 0.3s ease-out;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          transition: all 0.3s ease-out;
        `;

        toast.innerHTML = `
          <svg class="h-6 w-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <div>
            <p class="font-bold text-green-900 text-base">¡Post agregado exitosamente!</p>
            <p class="text-sm text-green-700 mt-1">El post se está procesando automáticamente</p>
          </div>
        `;

        document.body.appendChild(toast);

        // Auto-remover después de 5 segundos
        setTimeout(() => {
          if (toast.parentNode) {
            toast.style.opacity = "0";
            toast.style.transform = "translateY(-100%)";
            setTimeout(() => {
              if (toast.parentNode) {
                toast.remove();
              }
            }, 300);
          }
        }, 5000);
      };

      // Agregar estilos CSS para la animación
      const styleId = "success-toast-styles";
      if (!document.getElementById(styleId)) {
        const style = document.createElement("style");
        style.id = styleId;
        style.textContent = `
          @keyframes slideIn {
            from {
              transform: translateY(-100%);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
        `;
        document.head.appendChild(style);
      }
    }
  }, []);

  // Limpiar el toast cuando el modal se cierre completamente
  useEffect(() => {
    // Limpiar cualquier toast existente cuando el modal se cierre
    if (!isOpen) {
      const existingToast = document.getElementById("post-success-toast");
      if (existingToast) {
        existingToast.remove();
      }
    }
  }, [isOpen]);

  // Cargar schedules pendientes del influencer cuando se abre el modal
  useEffect(() => {
    if (isOpen && influencerId && campaignId) {
      setIsInitialLoading(true);
      loadPendingSchedules();
    }
  }, [isOpen, influencerId, campaignId]);

  // Función para cargar schedules pendientes del influencer
  const loadPendingSchedules = async () => {
    setIsLoadingSchedules(true);
    try {
      // Cargar schedules pending e in-progress
      const pendingSchedules =
        await campaignScheduleService.getSchedulesByCampaign(campaignId, {
          influencer_id: influencerId,
          status: "pending",
        });

      const inProgressSchedules =
        await campaignScheduleService.getSchedulesByCampaign(campaignId, {
          influencer_id: influencerId,
          status: "in-progress",
        });

      // Combinar ambos arrays
      const allSchedules = [...pendingSchedules, ...inProgressSchedules];
      setPendingSchedules(allSchedules);
    } catch (error) {
      console.error("Error loading pending schedules:", error);
    } finally {
      setIsLoadingSchedules(false);
      setIsInitialLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.post_url.trim()) {
      return;
    }

    // Validar URL antes de enviar
    const error = validateUrl(formData.post_url);
    if (error) {
      setUrlError(error);
      return;
    }

    setIsLoading(true);

    try {
      // Preparar los datos del post
      let postDataToSubmit = { ...formData };

      // Si hay una imagen extraída automáticamente, usarla
      if (formData.image_url) {
        postDataToSubmit.image_url = formData.image_url;
      }

      // Enviar el post
      await onSubmit(postDataToSubmit);

      // Si hay un schedule seleccionado, actualizarlo con el URL del post
      if (selectedScheduleId) {
        try {
          await campaignScheduleService.updateSchedule(selectedScheduleId, {
            content_url: formData.post_url,
            status: "completed", // Cambiar a completado ya que ahora tiene el post
          });
        } catch (scheduleError) {
          console.error("Error actualizando schedule:", scheduleError);
          // No fallar el submit principal si falla la actualización del schedule
        }
      }

      // Mostrar confirmación de éxito
      setIsSuccess(true);
      showSuccessConfirmation();

      // Limpiar el formulario
      setFormData({
        post_url: "",
        image_url: "",
        platform: "instagram",
      });
      setSelectedScheduleId("");

      // Cerrar el modal después de un delay
      setTimeout(() => {
        handleClose();
        if (onSuccess) {
          onSuccess();
        }
      }, 2000);
    } catch (error) {
      console.error("Error submitting post:", error);
      alert("Error al agregar el post. Por favor, intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (isSuccess) return; // No permitir cerrar si está en estado de éxito

    setFormData({
      post_url: "",
      image_url: "",
      platform: "instagram",
    });
    setSelectedScheduleId("");
    setPendingSchedules([]);
    setIsSuccess(false);
    setUrlError("");
    setIsInitialLoading(false);
    onClose();
  };

  const updateFormData = (field: keyof CreatePostData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Función para validar URL
  const validateUrl = (url: string): string => {
    // Limpiar el error anterior
    if (!url.trim()) {
      return "La URL es obligatoria";
    }

    // ✅ NUEVO: Detectar múltiples URLs pegadas
    const urlPattern = /https?:\/\/[^\s]+/g;
    const foundUrls = url.match(urlPattern);
    
    if (foundUrls && foundUrls.length > 1) {
      return "Has pegado múltiples URLs. Por favor, ingresa solo una URL por vez.";
    }

    // ✅ NUEVO: Detectar URLs pegadas sin espacios (caso específico del usuario)
    const suspiciousPatterns = [
      /https:\/\/[^?]+[?][^&]*&ab_channel=[^&]*https:\/\/[^?]+/, // YouTube + TikTok
      /https:\/\/[^?]+[?][^&]*&t=\d+https:\/\/[^?]+/, // TikTok + otra URL
      /https:\/\/[^?]+[?][^&]*https:\/\/[^?]+/, // Cualquier URL con query params + otra URL
    ];
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(url)) {
        return "Detecté URLs pegadas sin espacios. Por favor, ingresa solo una URL válida.";
      }
    }

    // ✅ NUEVO: Detectar URLs separadas por espacios o caracteres
    const hasMultipleUrls = url.includes('http') && (
      url.includes(' ') || 
      url.includes('\n') || 
      url.includes('\t') ||
      url.includes('https://') && url.indexOf('https://', 1) !== -1 ||
      url.includes('http://') && url.indexOf('http://', 1) !== -1
    );
    
    if (hasMultipleUrls) {
      return "Detecté múltiples URLs. Por favor, ingresa solo una URL válida.";
    }

    // ✅ NUEVO: Detectar URLs sospechosamente largas (posiblemente múltiples URLs pegadas)
    if (url.length > 500) {
      return "La URL es demasiado larga. Posiblemente hay múltiples URLs pegadas. Por favor, ingresa solo una URL.";
    }

    // Validar formato básico de URL
    try {
      new URL(url);
    } catch {
      return "Por favor, ingresa una URL válida";
    }

    // Validar que sea de una plataforma soportada
    const isValidPlatform = 
      isYouTubeUrl(url) || 
      isTikTokUrl(url) || 
      isInstagramUrl(url) || 
      isTwitterUrl(url);

    if (!isValidPlatform) {
      return "URL no soportada. Debe ser de YouTube, TikTok, Instagram o Twitter/X";
    }

    return ""; // Sin errores
  };

  const capitalizeFirst = (value?: string) => {
    if (!value) return "";
    const str = String(value);
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Función para manejar cambios en el campo image_url
  const handleImageUrlChange = async (url: string) => {
    updateFormData("image_url", url);

    // Si es una URL de Instagram, usar proxy para evitar CORS
    if (url && (url.includes('instagram.com') || url.includes('cdninstagram.com') || url.includes('fbcdn.net'))) {
      try {
        // Usar weserv.nl como proxy para Instagram
        const proxiedUrl = `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=800&h=800&fit=cover&output=webp`;
        updateFormData("image_url", proxiedUrl);
        return;
      } catch (error) {
        console.error("❌ Error proxying Instagram URL:", error);
      }
    }

    // Si es una URL temporal, convertirla automáticamente
    if (url && ImageProxyService.isTemporaryUrl(url)) {
      try {
        const permanentUrl = await ImageProxyService.convertTemporaryUrl(url);
        if (permanentUrl && permanentUrl !== url) {
          updateFormData("image_url", permanentUrl);
        } else {
          console.warn(
            "⚠️ La conversión no cambió la URL, puede haber fallado"
          );
        }
      } catch (error) {
        console.error("❌ Error convirtiendo URL temporal:", error);
      }
    }
  };

  // Función para extraer automáticamente la miniatura cuando se cambia la URL
  const handleUrlChange = async (url: string) => {
    updateFormData("post_url", url);
    
    // Validar URL
    const error = validateUrl(url);
    setUrlError(error);

    // Solo continuar con la extracción de thumbnail si la URL es válida
    if (error) {
      return; // Salir si hay errores de validación
    }

    // Si es una URL de YouTube y no hay imagen ya establecida, extraer automáticamente
    if (isYouTubeUrl(url) && !formData.image_url) {
      setIsExtractingThumbnail(true);
      try {
        const thumbnail = getYouTubeThumbnail(url);
        if (thumbnail) {
          // Convertir inmediatamente a Data URL permanente
          const permanentUrl = await ImageProxyService.convertTemporaryUrl(
            thumbnail
          );
          updateFormData("image_url", permanentUrl);
        }
      } catch (error) {
        console.error("❌ Error extrayendo miniatura de YouTube:", error);
      } finally {
        setIsExtractingThumbnail(false);
      }
    }

    // Si es una URL de TikTok y no hay imagen ya establecida, extraer automáticamente con validación
    if (isTikTokUrl(url) && !formData.image_url) {
      setIsExtractingThumbnail(true);
      try {
        const thumbnail = await getTikTokThumbnailValidated(url);
        if (thumbnail) {
          // Convertir inmediatamente a Blob URL permanente
          const permanentUrl = await ImageProxyService.convertTemporaryUrl(
            thumbnail
          );
          if (permanentUrl && permanentUrl !== thumbnail) {
            updateFormData("image_url", permanentUrl);
          } else {
            console.warn(
              "⚠️ No se pudo convertir miniatura de TikTok, usando original"
            );
            updateFormData("image_url", thumbnail);
          }
        }
      } catch (error) {
        console.error("❌ Error extrayendo miniatura de TikTok:", error);
        // Usar fallback
        const fallbackThumbnail = getTikTokThumbnailBest(url);
        if (fallbackThumbnail) {
          const permanentUrl = await ImageProxyService.convertTemporaryUrl(
            fallbackThumbnail
          );
          if (permanentUrl && permanentUrl !== fallbackThumbnail) {
            updateFormData("image_url", permanentUrl);
          } else {
            console.warn(
              "⚠️ No se pudo convertir fallback de TikTok, usando original"
            );
            updateFormData("image_url", fallbackThumbnail);
          }
        }
      } finally {
        setIsExtractingThumbnail(false);
      }
    }

    // Si es una URL de Instagram y no hay imagen ya establecida, extraer automáticamente con validación
    if (isInstagramUrl(url) && !formData.image_url) {
      setIsExtractingThumbnail(true);
      try {
        const thumbnail = await getInstagramThumbnailValidated(url);
        if (thumbnail) {
          // Si es una URL de Instagram, usar proxy para evitar CORS
          let finalUrl = thumbnail;
          if (thumbnail.includes('instagram.com') || thumbnail.includes('cdninstagram.com') || thumbnail.includes('fbcdn.net')) {
            finalUrl = `https://images.weserv.nl/?url=${encodeURIComponent(thumbnail)}&w=800&h=800&fit=cover&output=webp`;
          } else {
            // Para otras URLs, intentar convertir con ImageProxyService
            const permanentUrl = await ImageProxyService.convertTemporaryUrl(thumbnail);
            if (permanentUrl && permanentUrl !== thumbnail) {
              finalUrl = permanentUrl;
            }
          }
          updateFormData("image_url", finalUrl);
        } else {
          console.warn("⚠️ No se pudo extraer miniatura de Instagram");
        }
      } catch (error) {
        console.error("❌ Error extrayendo miniatura de Instagram:", error);
      } finally {
        setIsExtractingThumbnail(false);
      }
    }

    // Si es una URL de Twitter/X y no hay imagen ya establecida, extraer captura automáticamente
    if (isTwitterTweetUrl(url) && !formData.image_url) {
      setIsExtractingThumbnail(true);
      try {

        // Usar el nuevo servicio que guarda en blob storage
        const result = await twitterService.generateAndStoreThumbnail(url);

        if (result.success && result.blobUrl) {
          
          updateFormData("image_url", result.blobUrl);
        } else {
          console.warn(
            "⚠️ No se pudo generar miniatura con blob storage, usando fallback"
          );

          // Fallback al método anterior
          const thumbnail = await getTwitterThumbnailValidated(url);
          if (thumbnail) {
            const permanentUrl = await ImageProxyService.convertTemporaryUrl(
              thumbnail
            );
            updateFormData("image_url", permanentUrl);
          } else {
            // Fallback final
            const fallbackThumbnail = getTwitterThumbnail(url);
            if (fallbackThumbnail) {
              const permanentUrl = await ImageProxyService.convertTemporaryUrl(
                fallbackThumbnail
              );
              updateFormData("image_url", permanentUrl);
            }
          }
        }
      } catch (error) {
        console.error("❌ Error generando miniatura de Twitter:", error);

        // Fallback al método anterior
        try {
          const thumbnail = await getTwitterThumbnailValidated(url);
          if (thumbnail) {
            const permanentUrl = await ImageProxyService.convertTemporaryUrl(
              thumbnail
            );
            updateFormData("image_url", permanentUrl);
          }
        } catch (fallbackError) {
          console.error("❌ Error en fallback de Twitter:", fallbackError);

          // Fallback final
          const fallbackThumbnail = getTwitterThumbnail(url);
          if (fallbackThumbnail) {
            const permanentUrl = await ImageProxyService.convertTemporaryUrl(
              fallbackThumbnail
            );
            updateFormData("image_url", permanentUrl);
          }
        }
      } finally {
        setIsExtractingThumbnail(false);
      }
    }

    // Auto-detectar plataforma basada en la URL
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      updateFormData("platform", "youtube");
    } else if (url.includes("instagram.com")) {
      updateFormData("platform", "instagram");
    } else if (url.includes("tiktok.com")) {
      updateFormData("platform", "tiktok");
    } else if (url.includes("twitter.com") || url.includes("x.com")) {
      updateFormData("platform", "twitter");
    }
  };

  // Función para extraer miniatura manualmente
  const extractThumbnail = async () => {
    setIsExtractingThumbnail(true);

    try {
      if (isYouTubeUrl(formData.post_url)) {
        const thumbnail = getYouTubeThumbnail(formData.post_url);
        if (thumbnail) {
          // Convertir inmediatamente a Data URL permanente
          const permanentUrl = await ImageProxyService.convertTemporaryUrl(
            thumbnail
          );
          updateFormData("image_url", permanentUrl);
        }
      } else if (isTikTokUrl(formData.post_url)) {
        try {
          const thumbnail = await getTikTokThumbnailValidated(
            formData.post_url
          );
          if (thumbnail) {
            // Convertir inmediatamente a Data URL permanente
            const permanentUrl = await ImageProxyService.convertTemporaryUrl(
              thumbnail
            );
            updateFormData("image_url", permanentUrl);
          }
        } catch (error) {
          // Usar fallback
          const fallbackThumbnail = getTikTokThumbnailBest(formData.post_url);
          if (fallbackThumbnail) {
            const permanentUrl = await ImageProxyService.convertTemporaryUrl(
              fallbackThumbnail
            );
            updateFormData("image_url", permanentUrl);
          }
        }
      } else if (isInstagramUrl(formData.post_url)) {
        const thumbnail = await getInstagramThumbnailValidated(
          formData.post_url
        );
        if (thumbnail) {
          // Convertir inmediatamente a Data URL permanente
          const permanentUrl = await ImageProxyService.convertTemporaryUrl(
            thumbnail
          );
          updateFormData("image_url", permanentUrl);
        } else {
          alert(
            "No se pudo extraer la miniatura de Instagram. Verifica que la URL sea correcta y que el backend esté funcionando."
          );
        }
      } else if (isTwitterTweetUrl(formData.post_url)) {
        try {
          

          // Usar el nuevo servicio que guarda en blob storage
          const result = await twitterService.generateAndStoreThumbnail(
            formData.post_url
          );

          if (result.success && result.blobUrl) {

            updateFormData("image_url", result.blobUrl);
          } else {
            console.warn(
              "⚠️ No se pudo generar miniatura con blob storage, usando fallback"
            );

            // Fallback al método anterior
            const thumbnail = await getTwitterThumbnailValidated(
              formData.post_url
            );
            if (thumbnail) {
              const permanentUrl = await ImageProxyService.convertTemporaryUrl(
                thumbnail
              );
              updateFormData("image_url", permanentUrl);
            } else {
              // Fallback final
              const fallbackThumbnail = getTwitterThumbnail(formData.post_url);
              if (fallbackThumbnail) {
                const permanentUrl =
                  await ImageProxyService.convertTemporaryUrl(
                    fallbackThumbnail
                  );
                updateFormData("image_url", permanentUrl);
              }
            }
          }
        } catch (error) {
          console.error(
            "❌ Error generando miniatura de Twitter manualmente:",
            error
          );

          // Fallback al método anterior
          try {
            const thumbnail = await getTwitterThumbnailValidated(
              formData.post_url
            );
            if (thumbnail) {
              const permanentUrl = await ImageProxyService.convertTemporaryUrl(
                thumbnail
              );
              updateFormData("image_url", permanentUrl);
            }
          } catch (fallbackError) {
            console.error(
              "❌ Error en fallback manual de Twitter:",
              fallbackError
            );

            // Fallback final
            const fallbackThumbnail = getTwitterThumbnail(formData.post_url);
            if (fallbackThumbnail) {
              const permanentUrl = await ImageProxyService.convertTemporaryUrl(
                fallbackThumbnail
              );
              updateFormData("image_url", permanentUrl);
            }
          }
        }
      }
    } catch (error) {
      console.error("❌ Error extrayendo miniatura:", error);
    } finally {
      setIsExtractingThumbnail(false);
    }
  };

  // Función para manejar la selección de archivo de imagen
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

    handleImageUpload(file);
  };

  // Función para subir archivo a blob storage y obtener URL
  const handleImageUpload = async (file: File) => {
    setIsUploadingImage(true);
    
    try {
      const formData = new FormData();
      formData.append('image', file);


      // Usar fetch para evitar interferencia del httpApiClient con headers
      const token = localStorage.getItem('token');
      const apiBaseUrl = 'http://localhost:5001/api';
      
      const fetchResponse = await fetch(`${apiBaseUrl}/influencer-posts/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: formData
      });

      const responseData = await fetchResponse.json() as { success: boolean; data?: { imageUrl: string; uploadedAt: string }; message?: string };
      
      if (!fetchResponse.ok) {
        throw new Error(responseData.message || 'Error al subir imagen');
      }

      if (responseData.success && responseData.data) {
        
        // Usar la URL del blob directamente
        updateFormData("image_url", responseData.data.imageUrl);
      } else {
        throw new Error('Error al subir imagen');
      }
      
    } catch (error) {
      console.error('❌ [ADD-POST-MODAL] Error subiendo imagen:', error);
      alert('Error al cargar la imagen. Por favor intenta de nuevo.');
    } finally {
      setIsUploadingImage(false);
      
      // Limpiar input de archivo
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Función para abrir selector de archivos
  const handleOpenFileSelector = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={isSuccess ? undefined : handleClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-600" />
              Agregar Post - {influencerName}
            </DialogTitle>
          </DialogHeader>

          {isInitialLoading ? (
            // Skeleton de carga simplificado
            <div className="space-y-6">
              {/* Skeleton para URL del Post */}
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>

              {/* Skeleton para Plataforma */}
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>

              {/* Skeleton para URL de la Imagen */}
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>

              {/* Skeleton para botones */}
              <div className="flex justify-end gap-3 pt-4">
                <div className="h-10 bg-gray-200 rounded w-20 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Input oculto para archivos */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* URL del Post - Campo obligatorio */}
              <div className="space-y-2">
                <Label htmlFor="post_url" className="text-sm font-medium">
                  URL del Post <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="post_url"
                    type="url"
                    placeholder="https://youtube.com/watch?v=..."
                    value={formData.post_url}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    required
                    className={`w-full ${isExtractingThumbnail ? "pr-10" : ""} ${
                      urlError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                    }`}
                    disabled={isExtractingThumbnail}
                  />
                  {isExtractingThumbnail && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    </div>
                  )}
                </div>
                {urlError && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {urlError}
                  </p>
                )}
                {isExtractingThumbnail && (
                  <p className="text-xs text-blue-600 flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Extrayendo miniatura automáticamente...
                  </p>
                )}
              </div>

              {/* Schedules Pendientes del Influencer */}
              {pendingSchedules.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    Contenidos Programados
                  </Label>
                  <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-3 bg-gray-50">
                    {isLoadingSchedules ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                        <span className="ml-2 text-sm text-gray-600">
                          Cargando...
                        </span>
                      </div>
                    ) : (
                      pendingSchedules.map((schedule) => (
                        <div
                          key={schedule.id}
                          className={`flex items-center gap-3 p-2 rounded border cursor-pointer transition-colors ${
                            selectedScheduleId === schedule.id
                              ? "bg-blue-100 border-blue-300"
                              : "bg-white border-gray-200 hover:bg-gray-50"
                          }`}
                          onClick={() =>
                            setSelectedScheduleId(
                              selectedScheduleId === schedule.id
                                ? ""
                                : schedule.id
                            )
                          }
                        >
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {schedule.title || "Sin título"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {capitalizeFirst(schedule.platform)} • {capitalizeFirst(schedule.content_type)}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  {selectedScheduleId && (
                    <p className="text-xs text-blue-600">
                      ✓ El post se vinculará con el contenido programado
                      seleccionado
                    </p>
                  )}
                </div>
              )}

              {/* Plataforma */}
              <div className="space-y-2">
                <Label htmlFor="platform" className="text-sm font-medium">
                  Plataforma
                </Label>
                <Select
                  value={formData.platform}
                  onValueChange={(value) => updateFormData("platform", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar plataforma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="twitter">Twitter</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* URL de la Imagen */}
              <div className="space-y-2">
                <Label htmlFor="image_url" className="text-sm font-medium">
                  URL de la Imagen
                </Label>
                <Input
                  id="image_url"
                  type="url"
                  placeholder="https://ejemplo.com/imagen.jpg (se extrae automáticamente)"
                  value={formData.image_url}
                  onChange={(e) => handleImageUrlChange(e.target.value)}
                  className="w-full"
                />
                {formData.image_url && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-2">Vista previa:</p>
                    <div className="relative inline-block">
                      <SmartImage
                        src={formData.image_url}
                        alt="Vista previa"
                        className="w-32 h-20 object-cover border rounded-md"
                        fallback={
                          <div className="w-32 h-20 border rounded-md overflow-hidden bg-gray-50 flex items-center justify-center text-xs text-gray-500">
                            Error al cargar
                          </div>
                        }
                      />
                      {/* Botón de upload minimalista */}
                      <button
                        type="button"
                        onClick={handleOpenFileSelector}
                        disabled={isUploadingImage}
                        className="absolute top-1 right-1 bg-white/90 hover:bg-white border border-gray-300 rounded-md p-1.5 shadow-sm transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Cambiar imagen"
                      >
                        {isUploadingImage ? (
                          <Loader2 className="h-3 w-3 animate-spin text-gray-600" />
                        ) : (
                          <Upload className="h-3 w-3 text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Spinner mientras se extrae la miniatura */}
                {isExtractingThumbnail && !formData.image_url && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-2">
                      Extrayendo miniatura...
                    </p>
                    <div className="w-32 h-20 border rounded-md overflow-hidden bg-gray-50 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    </div>
                  </div>
                )}


              </div>

              {/* Botones */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading || isSuccess}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !formData.post_url.trim() || isSuccess}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {isLoading ? "Agregando post..." : "Crear Post"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Toast personalizado - fuera del Dialog para que persista */}
      {/* <SuccessToast isVisible={showCustomToast} /> */}
    </>
  );
};
