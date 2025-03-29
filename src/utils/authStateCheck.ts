
/**
 * Utility function to check and log the current authentication state
 * This can be used for debugging issues with RLS policies
 */
import { supabase } from "@/integrations/supabase/client";

/**
 * Checks the current authentication state and returns diagnostic information
 * @returns Object with authentication state information
 */
export async function checkAuthState() {
  try {
    // Get the current session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    // Check if we can get user data
    const { data: userData, error: userError } = await supabase
      .from('auth_users_view')
      .select('id, email')
      .limit(1);
    
    // Log detailed debug information
    console.log("[Auth Check] Current authentication state:", {
      hasSession: !!session,
      userId: session?.user?.id,
      accessToken: session?.access_token ? "Present" : "Missing",
      tokenExpiry: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : "Unknown",
      error: error?.message,
      userData: userData,
      userDataError: userError?.message,
      timestamp: new Date().toISOString()
    });
    
    return {
      authenticated: !!session,
      userId: session?.user?.id,
      accessToken: !!session?.access_token,
      dbAccess: !!userData && !userError,
      error: error?.message || userError?.message
    };
  } catch (err) {
    console.error("[Auth Check] Error checking auth state:", err);
    return {
      authenticated: false,
      error: err instanceof Error ? err.message : "Unknown error checking auth state"
    };
  }
}

/**
 * A wrapper function to run a Supabase query with enhanced error logging
 * to help diagnose RLS issues
 */
export async function runWithAuthCheck(queryFn: () => Promise<any>, context: string = "unknown") {
  const authState = await checkAuthState();
  console.log(`[Auth Check] Running query in context "${context}" with auth state:`, authState);
  
  try {
    const result = await queryFn();
    console.log(`[Auth Check] Query success in "${context}":`, {
      hasData: !!result.data,
      dataCount: Array.isArray(result.data) ? result.data.length : (result.data ? 1 : 0),
      hasError: !!result.error
    });
    return result;
  } catch (error) {
    console.error(`[Auth Check] Query failed in "${context}":`, error);
    throw error;
  }
}
