
/**
 * Re-export the toast hook from our central implementation
 * 
 * This maintains the existing API used in the codebase
 * while allowing us to switch toast libraries if needed
 */
import { toast, useToast } from '@/hooks/use-toast';

// Export toast function and hook directly
export { toast, useToast };
