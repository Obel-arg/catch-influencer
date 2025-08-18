import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // 🎯 BOTÓN POR DEFECTO - AZUL SÓLIDO
        default: "bg-blue-600 text-white hover:bg-blue-700 focus:bg-blue-700 shadow-sm",
        
        // 🎯 BOTÓN DESTRUCTIVO - ROJO SÓLIDO  
        destructive: "bg-red-600 text-white hover:bg-red-700 focus:bg-red-700 shadow-sm",
        
        // 🎯 BOTÓN CON BORDE - FONDO BLANCO
        outline: "border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 focus:bg-gray-50 shadow-sm",
        
        // 🎯 BOTÓN SECUNDARIO - GRIS CLARO
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:bg-gray-200 shadow-sm",
        
        // 🎯 BOTÓN FANTASMA - SOLO HOVER
        ghost: "text-gray-700 hover:bg-gray-100 focus:bg-gray-100",
        
        // 🎯 ENLACE - AZUL SUBRAYADO
        link: "text-blue-600 underline-offset-4 hover:underline focus:underline",
        
        // 🎯 NUEVAS VARIANTES ROBUSTAS
        success: "bg-green-600 text-white hover:bg-green-700 focus:bg-green-700 shadow-sm",
        warning: "bg-yellow-600 text-white hover:bg-yellow-700 focus:bg-yellow-700 shadow-sm",
        white: "bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 focus:bg-gray-50 shadow-sm",
        dark: "bg-gray-900 text-white hover:bg-gray-800 focus:bg-gray-800 shadow-sm",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        xs: "h-8 rounded px-2 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
