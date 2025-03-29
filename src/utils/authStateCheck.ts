
/**
 * Authentication state checking utilities
 * 
 * Simplified to work with the direct data access model without RLS
 */
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type QueryFunction<T> = () => Promise<T>;

/**
 * Run a query with auth check to handle missing auth context
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
    // First check if auth context is available
    const { data: authCheck, error: authError } = await supabase
      .from('auth_users_view')
      .select('id')
      .limit(1);
      
    if (authError) {
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
