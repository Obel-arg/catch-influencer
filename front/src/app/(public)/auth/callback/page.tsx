"use client";

import { useEffect, useState, useRef, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/auth/useAuth";
import { AuthProvider } from "@/contexts/AuthContext";
import { BarChart2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleGoogleCallback } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [errorMessage, setErrorMessage] = useState<string>("");
  const hasProcessed = useRef(false);

  const processCallback = useCallback(async () => {
    // Evitar múltiples ejecuciones del callback
    if (hasProcessed.current) {
      console.log("Callback already processed, skipping...");
      return;
    }

    try {
      hasProcessed.current = true; // Marcar como procesado al inicio

      console.log("🚀 Auth Callback - Iniciando procesamiento...");
      console.log("🔍 URL actual:", window.location.href);

      // Obtener los parámetros de la URL
      const token = searchParams.get("token");
      const refreshToken = searchParams.get("refreshToken");
      const error = searchParams.get("error");

      console.log("🔍 Auth Callback - Parámetros recibidos:", {
        hasToken: !!token,
        hasRefreshToken: !!refreshToken,
        error,
        tokenLength: token?.length,
        refreshTokenLength: refreshToken?.length,
      });

      if (error) {
        console.error("OAuth error from URL:", error);
        setStatus("error");
        setErrorMessage("Error en la autenticación con Google");
        setTimeout(() => {
          router.replace("/auth/login");
        }, 2000);
        return;
      }

      if (!token || !refreshToken) {
        console.error("Missing tokens:", {
          token: !!token,
          refreshToken: !!refreshToken,
        });
        setStatus("error");
        setErrorMessage("Tokens de autenticación no encontrados");
        setTimeout(() => {
          router.replace("/auth/login");
        }, 2000);
        return;
      }

      // Decodificar los tokens (están URL-encoded)
      const decodedToken = decodeURIComponent(token);
      const decodedRefreshToken = decodeURIComponent(refreshToken);

      console.log("🔄 Tokens decodificados:", {
        hasDecodedToken: !!decodedToken,
        hasDecodedRefreshToken: !!decodedRefreshToken,
        decodedTokenLength: decodedToken.length,
        decodedRefreshTokenLength: decodedRefreshToken.length,
      });

      // Verificar que los tokens parecen válidos (JWT tiene 3 partes separadas por puntos)
      const tokenParts = decodedToken.split(".");
      const refreshTokenParts = decodedRefreshToken.split(".");

      console.log("🔍 Validación de tokens:", {
        tokenParts: tokenParts.length,
        refreshTokenParts: refreshTokenParts.length,
        tokenLooksValid: tokenParts.length === 3,
        refreshTokenLooksValid: refreshTokenParts.length === 3,
      });

      // Procesar el callback con los tokens
      console.log("🔄 Procesando callback de Google...");
      const result = await handleGoogleCallback(
        decodedToken,
        decodedRefreshToken
      );

      console.log("✅ Callback procesado exitosamente:", {
        userId: result.user?.id,
        userEmail: result.user?.email,
        hasUser: !!result.user,
      });

      // Actualizar el contexto de autenticación manualmente
      if (result.user) {
        console.log("🔄 Actualizando AuthContext manualmente...");

        // Guardar en localStorage para que el AuthContext lo detecte
        localStorage.setItem("token", decodedToken);
        localStorage.setItem("refreshToken", decodedRefreshToken);
        localStorage.setItem("userData", JSON.stringify(result.user));
        localStorage.setItem("userEmail", result.user.email);

        console.log("✅ AuthContext actualizado manualmente");
      } else {
        console.error("❌ No se recibieron datos de usuario del callback");
      }

      setStatus("success");

      // Mostrar toast de éxito UNA SOLA VEZ
      toast({
        title: "¡Éxito!",
        description: "Inicio de sesión con Google exitoso",
        variant: "default",
      });

      // Redirigir después de un breve retraso para mostrar el mensaje de éxito
      setTimeout(() => {
        console.log("🚀 Redirecting to /explorer");

        // Debug: Mostrar estado actual antes de redirigir
        console.log("🔍 Estado antes de redirigir:", {
          localStorage: {
            token: !!localStorage.getItem("token"),
            refreshToken: !!localStorage.getItem("refreshToken"),
            userData: !!localStorage.getItem("userData"),
            userEmail: !!localStorage.getItem("userEmail"),
          },
        });

        router.replace("/explorer"); // Usar replace para evitar volver al callback
      }, 1500);
    } catch (error) {
      console.error("❌ Error procesando callback de Google:", error);
      setStatus("error");
      setErrorMessage("Error al procesar la autenticación");

      // Mostrar toast de error
      toast({
        title: "Error",
        description: "Error al procesar la autenticación con Google",
        variant: "destructive",
      });

      setTimeout(() => {
        router.replace("/auth/login");
      }, 2000);
    }
  }, [handleGoogleCallback, router, searchParams, toast]);

  useEffect(() => {
    processCallback();
  }, [processCallback]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="flex justify-center mb-6">
          <BarChart2 className="h-12 w-12 text-blue-600" />
        </div>

        <h1 className="text-2xl font-bold mb-4">Influencer Tracker</h1>

        {status === "loading" && (
          <div>
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Procesando autenticación...</p>
          </div>
        )}

        {status === "success" && (
          <div>
            <div className="text-green-600 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              ¡Autenticación exitosa!
            </h2>
            <p className="text-gray-600">Redirigiendo al explorador...</p>
          </div>
        )}

        {status === "error" && (
          <div>
            <div className="text-red-600 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Error de autenticación
            </h2>
            <p className="text-gray-600 mb-4">{errorMessage}</p>
            <p className="text-sm text-gray-500">Redirigiendo al login...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
            <div className="flex justify-center mb-6">
              <BarChart2 className="h-12 w-12 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Influencer Tracker</h1>
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Cargando...</p>
          </div>
        </div>
      }
    >
      <AuthProvider>
        <AuthCallbackContent />
      </AuthProvider>
    </Suspense>
  );
}
