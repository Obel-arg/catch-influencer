import { useToast as useShadcnToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
  duration?: number;
  status?: 'success' | 'error' | 'warning' | 'info';
}

export const useToast = () => {
  const [isClient, setIsClient] = useState(false);
  const shadcnToast = useShadcnToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const showToast = ({ title, description, variant = 'default', duration = 3000, status }: ToastOptions) => {
    if (isClient && shadcnToast.toast) {
      // Si es un toast de éxito, usar fondo blanco sólido
      // Si es info, usar fondo blanco
      let className;
      if (status === 'success') {
        className = "bg-white border border-gray-200 text-gray-900 shadow-lg";
      } else if (status === 'info') {
        className = "bg-white border border-gray-200 text-gray-900";
      }
      
      shadcnToast.toast({
        title,
        description,
        variant: variant === 'success' ? 'default' : variant, // Usar 'default' para evitar error de tipo
        duration,
        className,
      });
    }
  };

  return { toast: showToast, showToast };
};

// Función auxiliar para obtener el color de fondo según el estado
const getBackgroundColor = (status: ToastOptions["status"]): string => {
  switch (status) {
    case "success":
      return "#48BB78";
    case "error":
      return "#F56565";
    case "warning":
      return "#ED8936";
    case "info":
    default:
      return "#4299E1";
  }
}; 