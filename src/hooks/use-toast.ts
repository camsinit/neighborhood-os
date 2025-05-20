
/**
 * Custom toast hook
 * 
 * This is a centralized toast implementation that standardizes toast appearance
 * and behavior across the application.
 */
import { toast as sonnerToast, type ToastOptions } from 'sonner';

type ToastProps = {
  description: string;
  title?: string;
  variant?: 'default' | 'destructive';
} & ToastOptions;

/**
 * Toast function for showing notifications
 * 
 * @param props - Toast properties including description, title and variant
 */
export const toast = ({ description, title, variant = 'default', ...props }: ToastProps) => {
  // Use different toast types based on the variant
  if (variant === 'destructive') {
    return sonnerToast.error(title || 'Error', {
      description,
      ...props,
    });
  }
  
  return sonnerToast(title || 'Notice', {
    description,
    ...props,
  });
};

/**
 * Hook for accessing toast functionality
 * 
 * @returns Toast function and promise methods
 */
export const useToast = () => {
  return { toast };
};
