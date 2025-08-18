"use client"

import { useEffect, useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface SessionExpiredNotificationProps {
  onRetry?: () => void;
  onLogin?: () => void;
}

export const SessionExpiredNotification = ({ 
  onRetry, 
  onLogin 
}: SessionExpiredNotificationProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Mostrar la notificación después de un pequeño delay para suavizar la transición
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = () => {
    if (onLogin) {
      onLogin();
    } else {
      window.location.href = '/auth/login';
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      <Card className="w-full max-w-md mx-4 shadow-2xl">
        <CardContent className="p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-amber-100">
              <AlertCircle className="h-8 w-8 text-amber-600" />
            </div>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Sesión Expirada
          </h3>
          
          <p className="text-gray-600 mb-6">
            Tu sesión ha expirado. Por favor, inicia sesión nuevamente para continuar.
          </p>
          
          <div className="flex gap-3 justify-center">
            {onRetry && (
              <Button 
                variant="outline" 
                onClick={onRetry}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reintentar
              </Button>
            )}
            
            <Button 
              onClick={handleLogin}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Iniciar Sesión
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 mt-4">
            Serás redirigido automáticamente en unos segundos...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}; 