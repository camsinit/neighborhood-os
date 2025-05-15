/**
 * Re-export the toast hook from sonner
 * 
 * This file provides a consistent API for toast notifications across the application
 * by re-exporting functionality from the Sonner library
 */
import { toast as sonnerToast } from 'sonner';

/**
 * Toast utility for displaying notifications
 * 
 * This maintains compatibility with existing code by providing both a 
 * function-style API and an object-style API
 */
const toast = Object.assign(
  // Make the toast function itself callable
  (message: string, options?: any) => sonnerToast(message, options),
  // Add all the sonnerToast methods as properties
  sonnerToast
);

/**
 * Simple hook that returns the toast utilities
 * This maintains compatibility with existing code that uses useToast()
 */
export function useToast() {
  return {
    toast: toast,
    // Provide a compatible API for components using toast.X directly
    toasts: [] as any[],
    // Other methods needed for backward compatibility
    dismiss: toast.dismiss,
    update: toast.update
  };
}

export { toast };
