
/**
 * Toast utility hook using Sonner
 * 
 * This file provides a centralized way to access toast functionality
 * throughout the application by re-exporting from Sonner.
 */
import { toast } from 'sonner';

// Re-export Sonner's toast directly
export { toast };

/**
 * Legacy hook for backward compatibility with older components
 * This maintains the same API signature that older components expect
 */
export function useToast() {
  return {
    toast, // Provide the toast function directly
    // Additional compatibility methods that some components might expect
    dismiss: toast.dismiss,
    update: toast.update,
    // Placeholder for components that expect toasts array
    toasts: [] as any[]
  };
}
