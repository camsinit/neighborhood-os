
import { useEffect } from 'react';

/**
 * Hook to provide safety timeouts for loading states
 * 
 * This hook sets up timeouts to prevent infinite loading states by
 * automatically setting loading to false after a period of time.
 * 
 * @param isLoading Current loading state
 * @param setIsLoading Function to update loading state
 * @param setError Function to update error state
 */
export function useSafetyTimeouts(
  isLoading: boolean,
  setIsLoading: (loading: boolean) => void,
  setError: (error: Error | null) => void
) {
  // Add a safety timeout to ensure loading state is eventually cleared
  useEffect(() => {
    // If we're in loading state, set a safety timeout
    if (isLoading) {
      const safetyTimer = setTimeout(() => {
        if (isLoading) {
          console.warn("[useSafetyTimeouts] Safety timeout triggered - fetch operation took too long");
          setIsLoading(false);
          setError(new Error("Neighborhood data fetch timed out"));
        }
      }, 10000); // 10 second timeout
      
      return () => {
        clearTimeout(safetyTimer);
      };
    }
  }, [isLoading, setIsLoading, setError]);
}
