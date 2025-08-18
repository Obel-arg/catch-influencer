import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Button, ButtonProps } from "./button";

/**
 * 🎯 BOTONES ROBUSTOS - SIEMPRE FUNCIONAN
 * Úsalos cuando tengas problemas de transparencia o colores incorrectos
 */

interface RobustButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost';
}

/**
 * Botón principal azul - SIEMPRE visible
 */
export const PrimaryButton = forwardRef<HTMLButtonElement, Omit<RobustButtonProps, 'variant'>>(
  ({ className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          // 🎯 ESTILOS GARANTIZADOS - AZUL SÓLIDO
          "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2",
          "bg-blue-600 text-white font-medium text-sm",
          "hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-800",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "transition-colors duration-200 shadow-sm",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
PrimaryButton.displayName = "PrimaryButton";

/**
 * Botón secundario gris - SIEMPRE visible
 */
export const SecondaryButton = forwardRef<HTMLButtonElement, Omit<RobustButtonProps, 'variant'>>(
  ({ className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          // 🎯 ESTILOS GARANTIZADOS - GRIS CLARO
          "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2",
          "bg-gray-100 text-gray-900 font-medium text-sm",
          "hover:bg-gray-200 focus:bg-gray-200 active:bg-gray-300",
          "focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "transition-colors duration-200 shadow-sm",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
SecondaryButton.displayName = "SecondaryButton";

/**
 * Botón de peligro rojo - SIEMPRE visible
 */
export const DangerButton = forwardRef<HTMLButtonElement, Omit<RobustButtonProps, 'variant'>>(
  ({ className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          // 🎯 ESTILOS GARANTIZADOS - ROJO SÓLIDO
          "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2",
          "bg-red-600 text-white font-medium text-sm",
          "hover:bg-red-700 focus:bg-red-700 active:bg-red-800",
          "focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "transition-colors duration-200 shadow-sm",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
DangerButton.displayName = "DangerButton";

/**
 * Botón con borde - SIEMPRE visible
 */
export const OutlineButton = forwardRef<HTMLButtonElement, Omit<RobustButtonProps, 'variant'>>(
  ({ className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          // 🎯 ESTILOS GARANTIZADOS - BORDE CON FONDO BLANCO
          "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2",
          "bg-white text-gray-900 font-medium text-sm",
          "border border-gray-300",
          "hover:bg-gray-50 focus:bg-gray-50 active:bg-gray-100",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "transition-colors duration-200 shadow-sm",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
OutlineButton.displayName = "OutlineButton";

/**
 * Botón de éxito verde - SIEMPRE visible
 */
export const SuccessButton = forwardRef<HTMLButtonElement, Omit<RobustButtonProps, 'variant'>>(
  ({ className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          // 🎯 ESTILOS GARANTIZADOS - VERDE SÓLIDO
          "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2",
          "bg-green-600 text-white font-medium text-sm",
          "hover:bg-green-700 focus:bg-green-700 active:bg-green-800",
          "focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "transition-colors duration-200 shadow-sm",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
SuccessButton.displayName = "SuccessButton";

/**
 * Botón fantasma - SIEMPRE visible
 */
export const GhostButton = forwardRef<HTMLButtonElement, Omit<RobustButtonProps, 'variant'>>(
  ({ className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          // 🎯 ESTILOS GARANTIZADOS - TRANSPARENTE CON HOVER
          "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2",
          "bg-transparent text-gray-700 font-medium text-sm",
          "hover:bg-gray-100 focus:bg-gray-100 active:bg-gray-200",
          "focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "transition-colors duration-200",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
GhostButton.displayName = "GhostButton";

/**
 * 🎯 BOTÓN VERSÁTIL ROBUSTO
 * Un solo componente con todas las variantes
 */
export const RobustButton = forwardRef<HTMLButtonElement, RobustButtonProps>(
  ({ variant = 'primary', className, children, ...props }, ref) => {
    const variantStyles = {
      primary: "bg-blue-600 text-white hover:bg-blue-700 focus:bg-blue-700 focus:ring-blue-500",
      secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:bg-gray-200 focus:ring-gray-500",
      danger: "bg-red-600 text-white hover:bg-red-700 focus:bg-red-700 focus:ring-red-500",
      success: "bg-green-600 text-white hover:bg-green-700 focus:bg-green-700 focus:ring-green-500",
      outline: "bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 focus:bg-gray-50 focus:ring-blue-500",
      ghost: "bg-transparent text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:ring-gray-500",
    };

    return (
      <button
        ref={ref}
        className={cn(
          // 🎯 ESTILOS BASE GARANTIZADOS
          "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2",
          "font-medium text-sm transition-colors duration-200",
          "focus:outline-none focus:ring-2 focus:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "shadow-sm",
          // 🎯 VARIANTE ESPECÍFICA
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
RobustButton.displayName = "RobustButton"; 