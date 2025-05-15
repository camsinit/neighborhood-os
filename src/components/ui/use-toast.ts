
/**
 * Re-export the toast hook from our central implementation
 * 
 * This maintains the existing API used in the codebase
 * while allowing us to switch toast libraries if needed
 */
import { toast } from 'sonner';

// For backwards compatibility
export function useToast() {
  return {
    toast,
    toasts: [], // for compatibility
  };
}

// Export toast function directly
export { toast };
