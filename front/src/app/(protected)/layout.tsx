"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type React from "react";
import { MainSidebar } from "@/components/layout/protected/main-sidebar";
import { NotificationsPopover } from "@/components/account/notifications";
import { UserProfileDropdown } from "@/components/account/user-profile-dropdown";
import { FeedbackSystem } from "@/components/feedback/FeedbackSystem";
import { useTokenValidator } from "@/hooks/auth/useTokenValidator";
import { isTokenExpired } from "@/lib/http/tokenInterceptor";
import {
  RequestDebugDashboard,
  useDebugDashboard,
} from "@/components/common/RequestDebugDashboard";
import { InfluencersProvider } from "@/contexts/InfluencersContext";
import { UsersProvider } from "@/contexts/UsersContext";
import { AuthProvider, useAuthContext } from "@/contexts/AuthContext";
import { RoleProvider } from "@/contexts/RoleContext";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

// Función para mostrar modal de sesión expirada
const showSessionExpiredModal = () => {
  // Evitar mostrar múltiples modales
  if (document.getElementById("session-expired-modal")) {
    return;
  }

  // Crear el modal dinámicamente
  const modalHtml = `
    <div id="session-expired-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div class="bg-white rounded-lg shadow-2xl w-full max-w-md mx-4 p-6">
        <div class="text-center">
          <div class="flex justify-center mb-4">
            <div class="p-3 rounded-full bg-amber-100">
              <svg class="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
          
          <h3 class="text-lg font-semibold text-gray-900 mb-2">
            Sesión Expirada
          </h3>
          
          <p class="text-gray-600 mb-6">
            Tu sesión ha expirado. Por favor, inicia sesión nuevamente para continuar.
          </p>
          
          <div class="flex gap-3 justify-center">
            <button id="session-expired-login-btn" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
              Iniciar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Insertar modal en el DOM
  document.body.insertAdjacentHTML("beforeend", modalHtml);

  // Agregar event listener al botón
  const loginBtn = document.getElementById("session-expired-login-btn");
  const modal = document.getElementById("session-expired-modal");

  const redirectToLogin = () => {
    // Limpiar todos los datos de autenticación
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRoleCache"); // Limpiar caché de roles

    // Remover modal
    if (modal) {
      modal.remove();
    }

    // Redirigir al login
    window.location.href = "/auth/login";
  };

  if (loginBtn) {
    loginBtn.addEventListener("click", redirectToLogin);
  }

  // Auto-redirigir después de 10 segundos si no hace clic
  setTimeout(() => {
    if (document.getElementById("session-expired-modal")) {
      redirectToLogin();
    }
  }, 10000);
};

function ProtectedLayoutContent({ children }: ProtectedLayoutProps) {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>("");
  const { user, isLoading: authLoading, isInitialized } = useAuthContext();

  // Usar el hook de validación de tokens
  useTokenValidator();

  // Dashboard de debugging
  const { isVisible, toggleVisibility } = useDebugDashboard();

  // Obtener el email del usuario desde localStorage
  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (email) {
      setUserEmail(email);
    }
  }, []);

  // Verificar autenticación cuando se inicializa (solo una vez)
  useEffect(() => {
    if (isInitialized && !authLoading) {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("userData");

      console.log("🔍 Protected Layout - Verificando autenticación:", {
        hasToken: !!token,
        hasUserData: !!userData,
        user: !!user,
        isInitialized,
        authLoading,
      });

      if (!token || !user) {
        console.log("❌ No hay token o usuario, redirigiendo a login...");
        router.push("/auth/login");
        return;
      }

      if (isTokenExpired(token)) {
        console.log("🚨 Token expirado, mostrando modal...");
        showSessionExpiredModal();
        return;
      }

      console.log("✅ Usuario autenticado correctamente");
    }
  }, [isInitialized, authLoading]); // Removido 'user' y 'router' de las dependencias

  // // Mostrar loading solo durante la inicialización de autenticación
  // if (authLoading) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
  //         <p className="text-gray-600">Inicializando...</p>
  //       </div>
  //     </div>
  //   );
  // }
  return (
    <RoleProvider>
      <InfluencersProvider>
        <UsersProvider>
          <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
            <MainSidebar />
            <div className="flex-1 ml-16">
              <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white/80 backdrop-blur-md px-4 md:px-6 shadow-sm">
                <div className="ml-auto flex gap-2 items-center">
                  <FeedbackSystem userEmail={userEmail} />
                  {/* <NotificationsPopover /> */}
                  <UserProfileDropdown />
                </div>
              </header>
              <main className="flex-1 p-4 md:p-6">{children}</main>
            </div>

            {/* Dashboard de debugging */}
            <RequestDebugDashboard
              isVisible={isVisible}
              onToggleVisibility={toggleVisibility}
            />
          </div>
        </UsersProvider>
      </InfluencersProvider>
    </RoleProvider>
  );
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  return (
    <AuthProvider>
      <ProtectedLayoutContent>{children}</ProtectedLayoutContent>
    </AuthProvider>
  );
}
