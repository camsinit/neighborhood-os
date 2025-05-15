
/**
 * Re-export the toast hook from sonner
 * 
 * This maintains the existing API used in the codebase
 * but allows us to switch toast libraries if needed
 */
import { toast as sonnerToast } from 'sonner';

// Type definition for our toast function to match expected usage
type ToastFunction = typeof sonnerToast & {
  // Add these properties to match how toast is used in the codebase
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
};

// Cast the sonner toast to our extended type
export const toast = sonnerToast as ToastFunction;

/**
 * Simple hook that returns the toast utilities
 * This maintains compatibility with existing code
 */
export function useToast() {
  return { 
    toast: {
      ...sonnerToast,
      // Add this method to support the existing API in the codebase
      // where toast is called with an object containing title and description
      __proto__: {
        ...sonnerToast.__proto__,
        call: function(this: any, _: any, options: { title?: string; description?: string; variant?: string }) {
          if (options.variant === "destructive") {
            return sonnerToast.error(options.title, {
              description: options.description
            });
          }
          return sonnerToast(options.title, {
            description: options.description
          });
        }
      }
    }
  };
}
