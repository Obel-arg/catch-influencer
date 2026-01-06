import { useToast as useShadcnToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { useCallback, createElement } from "react";

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
  duration?: number;
  status?: 'success' | 'error' | 'warning' | 'info';
  /** Action button configuration */
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ToastResult {
  id: string;
  dismiss: () => void;
  update: (props: Partial<ToastOptions>) => void;
}

export const useToast = () => {
  const shadcnToast = useShadcnToast();

  const dismiss = useCallback((toastId?: string) => {
    shadcnToast.dismiss(toastId);
  }, [shadcnToast]);

  const showToast = useCallback((options: ToastOptions): ToastResult | undefined => {
    const { title, description, variant = 'default', duration = 3000, status, action } = options;
    
    // Only check if toast function exists, not isClient (shadcn handles SSR)
    if (!shadcnToast.toast) {
      return undefined;
    }

    // Determine className based on status
    let className: string | undefined;
    if (status === 'success') {
      className = "bg-white border border-green-200 text-gray-900 shadow-lg";
    } else if (status === 'info') {
      className = "bg-white border border-blue-200 text-gray-900";
    } else if (status === 'error') {
      className = "bg-white border border-red-200 text-gray-900";
    } else if (status === 'warning') {
      className = "bg-white border border-yellow-200 text-gray-900";
    }

    // Create action element if provided using createElement (since this is .ts not .tsx)
    const actionElement = action 
      ? createElement(ToastAction, {
          altText: action.label,
          onClick: (e: React.MouseEvent) => {
            e.preventDefault();
            // Use setTimeout to ensure the callback runs after toast events
            setTimeout(() => {
              action.onClick();
            }, 0);
          },
          className: "bg-primary text-primary-foreground hover:bg-primary/90",
        }, action.label)
      : undefined;
    
    const result = shadcnToast.toast({
      title,
      description,
      variant: variant === 'success' ? 'default' : variant,
      duration,
      className,
      // Cast to any to bypass strict typing since createElement returns a slightly different type
      action: actionElement as unknown as typeof actionElement extends undefined ? undefined : React.ReactElement,
    });

    return {
      id: result.id,
      dismiss: () => shadcnToast.dismiss(result.id),
      update: (props: Partial<ToastOptions>) => result.update({
        id: result.id,
        title: props.title,
        description: props.description,
        variant: props.variant === 'success' ? 'default' : props.variant,
        duration: props.duration,
      }),
    };
  }, [shadcnToast]);

  return { 
    toast: showToast, 
    showToast, 
    dismiss,
    // Expose the raw dismiss for dismissing by ID
    dismissToast: dismiss,
  };
}; 