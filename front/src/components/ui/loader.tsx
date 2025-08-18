import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  variant?: "default" | "primary" | "secondary";
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
};

const variantClasses = {
  default: "text-gray-500",
  primary: "text-primary",
  secondary: "text-secondary",
};

export function Loader({ size = "md", className, variant = "default" }: LoaderProps) {
  return (
    <div className="flex items-center justify-center">
      <Loader2
        className={cn(
          "animate-spin",
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
      />
    </div>
  );
}

export function FullPageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Loader size="lg" variant="primary" />
    </div>
  );
}

export function InlineLoader() {
  return <Loader size="sm" />;
} 