"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RobustModal } from "@/components/ui/robust-modal";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { creatorService } from "@/lib/services/creator";

interface AddCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddCreatorModal({ isOpen, onClose }: AddCreatorModalProps) {
  const [mounted, setMounted] = useState(false);

  // Estados del formulario
  const [creatorUrl, setCreatorUrl] = useState("");
  const [platform, setPlatform] = useState("");
  const [platformUserId, setPlatformUserId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Asegurar que el componente esté montado antes de usar createPortal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Resetear estados cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setCreatorUrl("");
      setPlatform("");
      setPlatformUserId("");
      setSubmitError("");
      setSubmitSuccess(false);
    }
  }, [isOpen]);

  // Función para extraer plataforma e ID del URL
  function extractPlatformAndId(url: string) {
    if (!url) {
      setPlatform("");
      setPlatformUserId("");
      return;
    }

    const result = creatorService.extractPlatformAndId(url);
    
    if (result) {
      setPlatform(result.platform);
      setPlatformUserId(result.platformUserId);
    } else {
      setPlatform("");
      setPlatformUserId("");
    }
  }

  // Función para enviar creador a CreatorDB
  async function handleSubmitCreator() {
    if (!platform || !platformUserId) return;

    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess(false);

    try {
      const result = await creatorService.submitCreatorWithHistory(platform, platformUserId, creatorUrl);

      if (result.success) {
        setSubmitSuccess(true);
        setCreatorUrl("");
        setPlatform("");
        setPlatformUserId("");

        // Cerrar modal después de 3 segundos
        setTimeout(() => {
          onClose();
          setSubmitSuccess(false);
        }, 3000);
      } else {
        throw new Error(result.error || "Error al enviar el creador");
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Error desconocido");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Renderizar el modal usando createPortal para asegurar que esté en el body
  const modalContent = (
    <RobustModal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Agregar nuevo creador</h2>
        
        {/* Formulario */}
        <div className="space-y-4">
          {/* Campo URL */}
          <div>
            <Label htmlFor="creatorUrl">URL del creador</Label>
            <Input
              id="creatorUrl"
              placeholder="https://www.instagram.com/kondzilla/"
              value={creatorUrl}
              onChange={(e) => {
                setCreatorUrl(e.target.value);
                extractPlatformAndId(e.target.value);
              }}
              onBlur={(e) => {
                extractPlatformAndId(e.target.value);
              }}
              className="mt-1"
            />
          </div>

          {/* Plataforma detectada */}
          {platform && (
            <div>
              <Label>Plataforma detectada</Label>
              <div className="mt-1 p-2 bg-gray-50 rounded border">
                <span className="capitalize font-medium">{platform}</span>
              </div>
            </div>
          )}

          {/* ID de plataforma */}
          {platformUserId && (
            <div>
              <Label>ID de plataforma</Label>
              <div className="mt-1 p-2 bg-gray-50 rounded border font-mono text-sm">
                {platformUserId}
              </div>
            </div>
          )}

          {/* Ayuda para YouTube */}
          {platform === "youtube" && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="mt-2">
                  <p className="font-medium mb-2">¿Cómo obtener el ID de YouTube?</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Ingresa a la página principal del canal</li>
                    <li>En el resumen de la descripción, presiona "... más"</li>
                    <li>Al final de la ventana emergente, da clic en "Compartir canal"</li>
                    <li>Selecciona "Copiar ID del canal"</li>
                  </ol>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Botón submit */}
          <Button
            onClick={handleSubmitCreator}
            disabled={!platform || !platformUserId || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              "Agregar a la plataforma"
            )}
            
          </Button>

          {/* Mensajes de error/éxito */}
          {submitError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          {submitSuccess && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Creador enviado exitosamente. Se agregará a la base de datos cuando sea aprobado.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </RobustModal>
  );

  // Usar createPortal para renderizar en el body
  return mounted && typeof window !== 'undefined' 
    ? createPortal(modalContent, document.body)
    : null;
} 