
/**
 * Custom toast hook
 * 
 * This is a centralized toast implementation that standardizes toast appearance
 * and behavior across the application.
 */
import { toast as sonnerToast } from 'sonner';

// Define our own ToastOptions type instead of importing it
type ToastOptions = {
  id?: string | number;
  duration?: number;
  icon?: string | React.ReactNode;
  promise?: Promise<any>;
  description?: string | React.ReactNode;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
  cancel?: React.ReactNode;
  action?: React.ReactNode;
  onDismiss?: (id: string | number) => void;
  onAutoClose?: (id: string | number) => void;
  className?: string;
  style?: React.CSSProperties;
  cancelButtonStyle?: React.CSSProperties;
  actionButtonStyle?: React.CSSProperties;
  unstyled?: boolean;
};

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
