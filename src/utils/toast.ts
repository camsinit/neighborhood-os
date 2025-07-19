import { toast as sonnerToast } from "sonner";

/**
 * Unified Toast Utility
 * 
 * Standardizes all toast notifications across the app using sonner.
 * Replaces the complex shadcn useToast hook with simple, consistent methods.
 */

// Simple success toast with green styling
export const showSuccessToast = (message: string, description?: string) => {
  sonnerToast.success(message, {
    description,
    duration: 4000,
  });
};

// Simple error toast with red styling
export const showErrorToast = (message: string, description?: string) => {
  sonnerToast.error(message, {
    description,
    duration: 6000, // Longer duration for errors so users can read them
  });
};

// Simple info toast with blue styling
export const showInfoToast = (message: string, description?: string) => {
  sonnerToast.info(message, {
    description,
    duration: 4000,
  });
};

// Simple warning toast with orange styling
export const showWarningToast = (message: string, description?: string) => {
  sonnerToast.warning(message, {
    description,
    duration: 5000,
  });
};

// Generic toast for backwards compatibility
export const showToast = (
  type: 'success' | 'error' | 'info' | 'warning',
  message: string,
  description?: string
) => {
  switch (type) {
    case 'success':
      showSuccessToast(message, description);
      break;
    case 'error':
      showErrorToast(message, description);
      break;
    case 'info':
      showInfoToast(message, description);
      break;
    case 'warning':
      showWarningToast(message, description);
      break;
  }
};

// Simple loading toast that can be dismissed
export const showLoadingToast = (message: string = "Loading...") => {
  return sonnerToast.loading(message);
};

// Dismiss a specific toast by ID
export const dismissToast = (toastId: string | number) => {
  sonnerToast.dismiss(toastId);
};