"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/auth/useAuth";
import { AuthProvider } from "@/contexts/AuthContext";

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

  const processCallback = async () => {
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
  };

  useEffect(() => {
    // Solo ejecutar una vez al montar el componente
    if (!hasProcessed.current) {
      processCallback();
    }
  }, []); // Dependencias vacías para ejecutar solo una vez

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-black flex items-center justify-center p-6 relative overflow-hidden">
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 text-center transform transition-all duration-1000 ease-in-out animate-in fade-in slide-in-from-bottom-4">
          {/* Logo siempre visible */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-950 to-slate-900 rounded-2xl blur-lg opacity-10"></div>
              <img 
                src="/logo_black.svg" 
                alt="Catch Logo" 
                className="relative h-16 w-auto object-contain"
              />
            </div>
          </div>

          {/* Contenido dinámico con transición suave */}
          <div className="transition-all duration-1000 ease-in-out min-h-[120px] flex items-center justify-center">
            {status === "loading" && (
              <div className="opacity-100 transform translate-y-0 transition-all duration-1000 ease-in-out animate-in fade-in">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-950 mb-4"></div>
                <p className="text-gray-600">Procesando autenticación...</p>
              </div>
            )}

            {status === "success" && (
              <div className="opacity-100 transform translate-y-0 transition-all duration-1000 ease-in-out animate-in fade-in">
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
                <p className="text-gray-600">
                  Redirigiendo al explorador...
                </p>
                <div className="mt-4 w-full bg-gray-200 rounded-full h-1 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-950 to-green-600 h-1 rounded-full animate-pulse transition-all duration-1000 ease-out"></div>
                </div>
              </div>
            )}

            {status === "error" && (
              <div className="opacity-100 transform translate-y-0 transition-all duration-1000 ease-in-out animate-in fade-in">
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
                <p className="text-sm text-gray-500">
                  Redirigiendo al login...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-black flex items-center justify-center p-6 relative overflow-hidden">
          <div className="w-full max-w-md relative z-10">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 text-center transform transition-all duration-700 ease-out">
              <div className="flex items-center justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-950 to-slate-900 rounded-2xl blur-lg opacity-10"></div>
                  <img 
                    src="/logo_black.svg" 
                    alt="Catch Logo" 
                    className="relative h-16 w-auto object-contain"
                  />
                </div>
              </div>
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-950 mb-4"></div>
              <p className="text-gray-600">Cargando...</p>
            </div>
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
