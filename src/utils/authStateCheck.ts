
/**
 * Auth state checking utilities
 * 
 * These functions help diagnose authentication state issues
 */
import { supabase } from "@/integrations/supabase/client";

/**
 * Check the current authentication context
 * 
 * This is useful for diagnosing RLS-related issues
 * 
 * @param context - Optional context name for logging
 * @returns Promise resolving to an object with auth state information
 */
export async function checkAuthState(context: string = 'general') {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    // Check context by attempting a simple query on the auth_users_view
    const { data: authContext, error: authError } = await supabase
      .from('auth_users_view')
      .select('id')
      .limit(1);
    
    const state = {
      context,
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      hasAuthContext: !!authContext,
      authContextError: authError ? authError.message : null,
      timestamp: new Date().toISOString()
    };
    
    console.info("[AuthStateCheck]", state);
    return state;
  } catch (error) {
    console.error("[AuthStateCheck] Error checking auth state:", error);
    return { 
      context, 
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString() 
    };
  }
}

/**
 * Run a function with authentication context checking
 * 
 * This wraps a function with auth state checking before and after
 * to help diagnose RLS issues
 * 
 * @param fn - The function to run
 * @param context - Context name for logging
 * @returns Result of the function
 */
export async function runWithAuthCheck<T>(
  fn: () => Promise<T>,
  context: string
): Promise<T> {
  try {
    // Check auth state before function
    await checkAuthState(`${context}-before`);
    
    // Run the function
    const result = await fn();
    
    // Check auth state after function
    await checkAuthState(`${context}-after`);
    
    return result;
  } catch (error) {
    console.error(`[${context}] Error with auth check:`, error);
    throw error;
  }
}
