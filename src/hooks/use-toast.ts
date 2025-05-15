
/**
 * Re-export the toast hook from sonner
 * 
 * This maintains the existing API used in the codebase
 * but allows us to switch toast libraries if needed
 */
import { toast } from 'sonner';

export { toast };

/**
 * Simple hook that returns the toast utilities
 * This maintains compatibility with existing code
 */
export function useToast() {
  return { toast };
}
