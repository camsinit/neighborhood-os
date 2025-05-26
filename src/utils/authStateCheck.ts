
/**
 * Authentication state checking utilities
 * 
 * SIMPLIFIED: With clean RLS policies, we don't need complex auth checking
 */
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type QueryFunction<T> = () => Promise<T>;

/**
 * Run a query with basic auth check
 * 
 * With clean RLS, this is much simpler - just check if user is authenticated
 * 
 * @param queryFn Function that performs the actual Supabase query
 * @param operationName Name of the operation (for logging)
 * @returns The query result
 */
export const runWithAuthCheck = async <T>(
  queryFn: QueryFunction<T>, 
  operationName = 'query'
): Promise<T> => {
  try {
    // Simple auth check - get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
      
    if (authError || !user) {
      console.warn(`[${operationName}] Auth check failed:`, authError);
      
      // Try refreshing the session if auth check fails
      const { error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        console.error(`[${operationName}] Could not refresh session:`, refreshError);
        toast.error("Authentication error. Try refreshing the page.");
        throw new Error("Authentication context lost");
      }
    }
    
    // If we get here, auth should be good - run the actual query
    return await queryFn();
  } catch (error) {
    console.error(`[${operationName}] Query failed:`, error);
    throw error;
  }
};
