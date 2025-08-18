import * as React from "react"

import { cn } from "@/lib/utils"

const CardNoInfo = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // 🎯 FONDO TRANSPARENTE, SIN BORDES, SIN SOMBRAS
      "rounded-lg bg-transparent text-gray-900",
      "dark:bg-transparent dark:text-gray-100",
      className
    )}
    {...props}
  />
))
CardNoInfo.displayName = "CardNoInfo"

const CardNoInfoHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardNoInfoHeader.displayName = "CardNoInfoHeader"

const CardNoInfoTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardNoInfoTitle.displayName = "CardNoInfoTitle"

const CardNoInfoDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardNoInfoDescription.displayName = "CardNoInfoDescription"

const CardNoInfoContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardNoInfoContent.displayName = "CardNoInfoContent"

const CardNoInfoFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardNoInfoFooter.displayName = "CardNoInfoFooter"

export { 
  CardNoInfo, 
  CardNoInfoHeader, 
  CardNoInfoFooter, 
  CardNoInfoTitle, 
  CardNoInfoDescription, 
  CardNoInfoContent 
}