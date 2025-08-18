import { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

// Variable para controlar si ya se mostró el modal
let isSessionExpiredModalShowing = false;

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

const showSessionExpiredModal = () => {
  // Evitar mostrar múltiples modales
  if (isSessionExpiredModalShowing) {
    return;
  }
  
  isSessionExpiredModalShowing = true;
  
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
  
  // Mostrar notificación del navegador si está disponible
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Sesión Expirada', {
      body: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
      icon: '/favicon.ico'
    });
  }
};

const redirectToLogin = () => {
  // Detectar si estamos en el cliente (browser)
  if (typeof window !== 'undefined') {
    // Mostrar modal de sesión expirada en lugar de redirigir directamente
    showSessionExpiredModal();
  }
};

export const setupTokenInterceptors = (axiosInstance: any) => {
  // Request interceptor - añadir token a todas las peticiones
  axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem('token');
      
      if (token && !config.headers.get('Authorization')) {
        config.headers.set('Authorization', `Bearer ${token}`);
      }
      return config;
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor - manejar tokens expirados
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
      
      
      
      // Si el error es 401 (Unauthorized) y no hemos intentado refrescar el token
      if (error.response?.status === 401 && !originalRequest._retry) {
        
        // No interferir con los errores de login - dejar que el componente los maneje
        if (originalRequest.url?.includes('/login') || originalRequest.url?.includes('/register')) {
          return Promise.reject(error);
        }
        
        // Evitar mostrar modal de sesión expirada inmediatamente después del login
        // Dar tiempo para que el token se guarde correctamente
        const token = localStorage.getItem('token');
        
        if (!token) {
          // Si no hay token, probablemente es un error de autenticación normal
          return Promise.reject(error);
        }
        
        // Verificar si el token está realmente expirado
        const isExpired = isTokenExpired(token);
        
        if (!isExpired) {
          // Si el token no está expirado pero recibimos 401, puede ser un problema temporal
          // Esperar un poco y reintentar una vez
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Reintentar la petición original
          if (originalRequest.headers) {
            originalRequest.headers.set('Authorization', `Bearer ${token}`);
          }
          return axiosInstance(originalRequest);
        }
        
        // Si ya estamos intentando refrescar el token, añadir a la cola
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(token => {
            if (originalRequest.headers) {
              originalRequest.headers.set('Authorization', `Bearer ${token}`);
            }
            return axiosInstance(originalRequest);
          }).catch(err => {
            return Promise.reject(err);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = localStorage.getItem('refreshToken');
          
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          // Intentar refrescar el token
          const backendUrl = process.env.NODE_ENV === "development"
            ? "http://localhost:5000/api/auth"
            : "https://influencerstracker-back.vercel.app/api/auth";

          const response = await fetch(`${backendUrl}/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
          });

          if (!response.ok) {
            throw new Error('Failed to refresh token');
          }

          const data = await response.json();
          const newToken = data.token;
          
          // Guardar el nuevo token
          localStorage.setItem('token', newToken);
          
          // Si también viene un nuevo refresh token, guardarlo
          if (data.refreshToken) {
            localStorage.setItem('refreshToken', data.refreshToken);
          }

          // Procesar la cola de peticiones fallidas
          processQueue(null, newToken);
          
          // Reintentar la petición original
          if (originalRequest.headers) {
            originalRequest.headers.set('Authorization', `Bearer ${newToken}`);
          }
          
          return axiosInstance(originalRequest);
          
        } catch (refreshError) {

          // Si no se puede refrescar el token, mostrar modal y redirigir
          processQueue(refreshError, null);
          redirectToLogin();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // Si el error es 403 (Forbidden) también puede indicar token inválido
      if (error.response?.status === 403) {
        const errorData = error.response.data as any;
        const errorMessage = errorData?.error || errorData?.message || '';
        if (errorMessage.toLowerCase().includes('token') || 
            errorMessage.toLowerCase().includes('unauthorized') ||
            errorMessage.toLowerCase().includes('forbidden')) {
          redirectToLogin();
        }
      }

      return Promise.reject(error);
    }
  );
};

export const isTokenExpired = (token: string): boolean => {
  try {
    // Los tokens JWT usan base64url, no base64 estándar
    // Necesitamos convertir base64url a base64 antes de usar atob
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    const currentTime = Date.now() / 1000;
    const isExpired = payload.exp < currentTime;
    

    
    return isExpired;
  } catch (error) {

    return true; // Si no se puede parsear, asumir que está expirado
  }
};

export const checkTokenOnStartup = () => {
  const token = localStorage.getItem('token');
  if (token && isTokenExpired(token)) {
    redirectToLogin();
  }
}; 