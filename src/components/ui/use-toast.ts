
/**
 * Re-export our centralized toast implementation
 * 
 * This ensures components using the shadcn pattern automatically use our
 * standardized Sonner implementation
 */
import { toast, useToast } from '@/hooks/use-toast';

// Export for component usage
export { toast, useToast };

// No types to re-export since we're handling all types in the main implementation
