
/**
 * Re-export the toast hook from our central implementation
 * 
 * This maintains the existing API used in the codebase
 * while allowing us to switch toast libraries if needed
 */
import { useToast, toast } from "@/hooks/use-toast";

export { useToast, toast };
