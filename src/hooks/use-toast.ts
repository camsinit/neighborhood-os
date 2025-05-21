
/**
 * This is a compatibility layer for Sonner toast
 * 
 * It provides a unified API that works with both the older toast system
 * and the newer Sonner implementation.
 */
import { toast as sonnerToast, type ToastT, type ExternalToast } from 'sonner';

// Custom toast type that handles both the old API (title/description) and new API (description only)
export type Toast = {
  title?: string;
  description: string; // Make description required to match the error
  variant?: 'default' | 'destructive' | 'success';
};

// Define ToastProps type for backwards compatibility
export type ToastProps = Toast;

// Adapter function that converts our app's toast format to Sonner's format
const adaptToastToSonner = (props: Toast) => {
  // Create a Sonner-compatible toast object
  const sonnerProps: ExternalToast = {
    description: props.description
  };
  
  // Add optional title if provided
  if (props.title) {
    sonnerProps.title = props.title;
  }
  
  // Map variant to Sonner's variants
  if (props.variant === 'destructive') {
    return sonnerToast.error(props.title || props.description, sonnerProps);
  } else if (props.variant === 'success') {
    return sonnerToast.success(props.title || props.description, sonnerProps);
  } else {
    return sonnerToast(props.title || props.description, sonnerProps);
  }
};

// Compatibility function that mimics the old toast API but uses Sonner
export const toast = (props: Toast) => {
  return adaptToastToSonner(props);
};

// For backwards compatibility with components using useToast hook
export function useToast() {
  return {
    toast: adaptToastToSonner,
    // For compatibility with components expecting toasts array
    toasts: [] 
  };
}
