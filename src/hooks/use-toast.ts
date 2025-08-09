
/**
 * DEPRECATED: use-toast compatibility layer (kept for backwards compatibility)
 * 
 * Prefer importing toast utilities from "@/utils/toast" for new code:
 *   - showSuccessToast, showErrorToast, showInfoToast, showWarningToast
 *   - showToast, showLoadingToast, dismissToast
 * 
 * This adapter allows legacy components to keep working while we migrate.
 */
import { toast as sonnerToast } from 'sonner';

// Custom toast type that handles both the old API (title/description) and new API (description only)
export type Toast = {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
};

// Adapter function that converts our app's toast format to Sonner's format
const adaptToastToSonner = (props: Toast) => {
  // If using the old API with title, combine title and description
  if (props.title) {
    const message = props.description 
      ? `${props.title}: ${props.description}`
      : props.title;
    
    // Map variant to Sonner's variants
    if (props.variant === 'destructive') {
      return sonnerToast.error(message);
    } else if (props.variant === 'success') {
      return sonnerToast.success(message);
    } else {
      return sonnerToast(message);
    }
  } 
  // If using the new API with just description
  else {
    return sonnerToast(props.description || '');
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
