import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface RobustModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showCloseButton?: boolean;
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md", 
  lg: "max-w-lg",
  xl: "max-w-xl"
};

/**
 * 🎯 Modal robusto que SIEMPRE tiene fondo blanco y estilos consistentes
 * Úsalo cuando quieras garantizar que el modal se vea correctamente
 */
export const RobustModal = ({ 
  isOpen, 
  onClose, 
  children, 
  className,
  size = "md",
  showCloseButton = true 
}: RobustModalProps) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div 
        className={cn(
          // 🎯 POSICIONAMIENTO CENTRADO
          "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50",
          // 🎯 ESTILOS GARANTIZADOS - SIEMPRE FONDO BLANCO
          "bg-white border border-gray-200 shadow-2xl rounded-xl",
          "text-gray-900",
          // 🎯 TAMAÑO Y RESPONSIVIDAD
          "w-full mx-4",
          sizeClasses[size],
          // 🎯 ANIMACIÓN SUAVE
          "animate-in fade-in-0 zoom-in-95 duration-200",
          // 🎯 DARK MODE
          "dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-opacity"
          >
            <svg className="h-4 w-4 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="sr-only">Cerrar</span>
          </button>
        )}
        
        {/* Content */}
        {children}
      </div>
    </>
  );
};

/**
 * 🎯 Card robusta que SIEMPRE tiene fondo blanco
 */
export const RobustCard = ({ 
  children, 
  className,
  padding = true 
}: { 
  children: ReactNode; 
  className?: string;
  padding?: boolean;
}) => {
  return (
    <div 
      className={cn(
        // 🎯 ESTILOS GARANTIZADOS
        "bg-white border border-gray-200 shadow-sm rounded-lg",
        "text-gray-900",
        // 🎯 PADDING OPCIONAL
        padding && "p-6",
        // 🎯 DARK MODE
        "dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700",
        className
      )}
    >
      {children}
    </div>
  );
};

/**
 * 🎯 Floating Panel robusto (como CacheDebugPanel)
 */
export const RobustFloatingPanel = ({ 
  children, 
  className,
  position = "bottom-right"
}: { 
  children: ReactNode; 
  className?: string;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
}) => {
  const positionClasses = {
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4", 
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4"
  };

  return (
    <div 
      className={cn(
        // 🎯 POSICIONAMIENTO FIXED
        "fixed z-50",
        positionClasses[position],
        // 🎯 ESTILOS GARANTIZADOS
        "bg-white border border-gray-200 shadow-2xl rounded-xl",
        "text-gray-900",
        // 🎯 DARK MODE
        "dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700",
        className
      )}
    >
      {children}
    </div>
  );
}; 