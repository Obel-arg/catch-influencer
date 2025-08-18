import { useEffect } from 'react';
import { isTokenExpired } from '@/lib/http/tokenInterceptor';

// Función para mostrar modal de sesión expirada
const showSessionExpiredModal = () => {
  // Evitar mostrar múltiples modales
  if (document.getElementById('session-expired-modal')) {
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
  document.body.insertAdjacentHTML('beforeend', modalHtml);
  
  // Agregar event listener al botón
  const loginBtn = document.getElementById('session-expired-login-btn');
  const modal = document.getElementById('session-expired-modal');
  
  const redirectToLogin = () => {
    // Limpiar todos los datos de autenticación
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    
    // Remover modal
    if (modal) {
      modal.remove();
    }
    
    // Redirigir al login
    window.location.href = '/auth/login';
  };
  
  if (loginBtn) {
    loginBtn.addEventListener('click', redirectToLogin);
  }
  
  // Auto-redirigir después de 10 segundos si no hace clic
  setTimeout(() => {
    if (document.getElementById('session-expired-modal')) {
      redirectToLogin();
    }
  }, 10000);
};

const checkTokenAndShowModal = () => {
  console.log('🔍 useTokenValidator - Verificando token...');
  const token = localStorage.getItem('token');
  console.log('🔑 Token encontrado:', !!token);
  
  if (token && isTokenExpired(token)) {
    console.log('🚨 Token expirado, mostrando modal...');
    showSessionExpiredModal();
  } else {
    console.log('✅ Token válido o no encontrado');
  }
};

export const useTokenValidator = () => {
  useEffect(() => {
    // TEMPORALMENTE DESHABILITADO: Verificación automática del token
    // Esto estaba causando que aparezca el modal de sesión expirada inmediatamente después del login
    /*
    // Verificar token al cargar la aplicación con un delay para evitar conflictos después del login
    const checkTokenWithDelay = () => {
      setTimeout(() => {
        checkTokenAndShowModal();
      }, 2000); // Esperar 2 segundos antes de verificar
    };

    checkTokenWithDelay();
    */

    // Configurar verificación periódica del token (cada 5 minutos)
    const interval = setInterval(() => {
      const token = localStorage.getItem('token');
      if (token && isTokenExpired(token)) {
        checkTokenAndShowModal();
      }
    }, 5 * 60 * 1000); // 5 minutos

    // Limpiar interval al desmontar
    return () => clearInterval(interval);
  }, []);

  // Verificar token cuando la ventana recupera el foco
  useEffect(() => {
    const handleFocus = () => {
      const token = localStorage.getItem('token');
      if (token && isTokenExpired(token)) {
        checkTokenAndShowModal();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Verificar token cuando la página se vuelve visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const token = localStorage.getItem('token');
        if (token && isTokenExpired(token)) {
          checkTokenAndShowModal();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);
}; 