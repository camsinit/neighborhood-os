
/**
 * Standardized toast hook that uses Sonner as the underlying implementation
 * 
 * This centralizes all toast notifications through a single consistent interface
 * and removes the compatibility layer that was causing duplicate notifications
 */
import { toast as sonnerToast } from 'sonner';

// Define our toast types for consistent usage
export type ToastProps = {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
};

/**
 * Primary toast function - use this for all notifications
 * 
 * @param props Toast configuration properties
 */
export const toast = (props: ToastProps) => {
  const { title, description, variant } = props;
  
  // For simple messages, use the title directly
  const message = title || "";
  
  // Determine which Sonner method to use based on variant
  if (variant === 'destructive') {
    return sonnerToast.error(message, {
      description: description,
    });
  } else if (variant === 'success') {
    return sonnerToast.success(message, {
      description: description,
    });
  } else {
    // Default toast
    return sonnerToast(message, {
      description: description,
    });
  }
};

/**
 * Hook for consuming toast functionality in components
 * 
 * Maintains the previous API for backward compatibility
 */
export function useToast() {
  return {
    toast,
    // Empty array for compatibility with components that expect toasts array
    toasts: [] 
  };
}
