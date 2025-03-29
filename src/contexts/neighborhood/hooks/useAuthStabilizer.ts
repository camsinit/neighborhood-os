
/**
 * Hook for stabilizing authentication state
 *
 * This hook ensures that we only proceed with neighborhood data fetching
 * once the authentication state has properly stabilized.
 */
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';

/**
 * Custom hook to stabilize authentication state
 * 
 * @param user - The current user from auth context
 * @returns Boolean indicating if auth state is stable
 */
export function useAuthStabilizer(user: User | null | undefined) {
  // State to track authentication stabilizing
  const [isAuthStable, setIsAuthStable] = useState(false);
  
  // Wait for auth to stabilize before fetching neighborhood data
  useEffect(() => {
    // If we have a definite user state (either logged in or definitely not logged in),
    // mark auth as stable
    if (user !== undefined) {
      // Small delay to ensure auth is fully processed
      const timer = setTimeout(() => {
        setIsAuthStable(true);
        console.log("[useAuthStabilizer] Auth state stabilized:", { 
          isLoggedIn: !!user, 
          userId: user?.id
        });
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [user]);

  return isAuthStable;
}
