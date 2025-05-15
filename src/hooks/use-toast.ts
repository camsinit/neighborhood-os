
/**
 * Custom toast hook that provides compatibility with different toast APIs
 * This hook serves as a bridge between sonner toast and shadcn/ui toast
 */
import { useToast as useShadcnToast } from "@/components/ui/toast"
import { toast as sonnerToast } from "sonner"

// Type definitions for the toast function parameters
export interface ToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
  action?: React.ReactNode;
}

/**
 * Unified toast hook that works with both shadcn/ui and sonner
 */
export function useToast() {
  // Get the original shadcn toast implementation
  const shadcnToast = useShadcnToast();

  // Create a wrapper function that converts the props to the correct format
  const toast = (props: ToastProps) => {
    // Handle string-only case for backwards compatibility
    if (typeof props === 'string') {
      return shadcnToast({
        description: props,
      });
    }

    // Use the shadcn toast implementation
    return shadcnToast(props);
  };

  return {
    ...shadcnToast,
    toast,
  };
}

/**
 * Standalone toast function for use outside of React components
 */
export const toast = (props: ToastProps) => {
  // If it's just a string, use it as description
  if (typeof props === 'string') {
    sonnerToast(props);
    return;
  }

  // Extract properties
  const { title, description, variant, duration } = props;

  // Map variant to sonner's variant
  const sonnerVariant = variant === 'destructive' ? 'error' : 'default';

  // Use sonner toast with the appropriate parameters
  if (title && description) {
    sonnerToast[sonnerVariant](title, {
      description,
      duration,
    });
  } else if (title) {
    sonnerToast[sonnerVariant](title, {
      duration,
    });
  } else if (description) {
    sonnerToast[sonnerVariant](description, {
      duration,
    });
  }
};
