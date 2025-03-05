
/**
 * Hook for handling errors during neighborhood fetch
 * 
 * This module provides error handling logic for the neighborhood fetch process
 */
import { useCallback } from 'react';

/**
 * Hook for handling neighborhood fetch errors
 * 
 * @returns Error handling functions
 */
export const useFetchErrorHandler = () => {
  /**
   * Handle errors that occur during neighborhood fetch
   * 
   * @param err - The error that occurred
   * @param userId - The ID of the user (if available)
   * @param currentAttempt - The current fetch attempt number
   * @param setError - Function to update error state
   * @param setCurrentNeighborhood - Function to reset current neighborhood
   * @param setIsLoading - Function to update loading state
   */
  const handleFetchError = useCallback((
    err: any,
    userId: string | undefined,
    currentAttempt: number,
    setError: (error: Error | null) => void,
    setCurrentNeighborhood: (neighborhood: any) => void,
    setIsLoading: (loading: boolean) => void
  ) => {
    // Handle unexpected errors
    console.error("[useFetchErrorHandler] Error fetching neighborhood:", {
      error: err,
      userId,
      fetchAttempt: currentAttempt
    });
    
    // Set error for UI to display
    setError(err instanceof Error ? err : new Error('Failed to fetch neighborhood'));
    
    // Reset current neighborhood in case of error
    setCurrentNeighborhood(null);
    
    // Always mark loading as complete
    setIsLoading(false);
  }, []);
  
  /**
   * Handle client initialization errors
   * 
   * @param client - The client to check
   * @param fetchAttempts - The current fetch attempt count
   * @param setError - Function to update error state
   * @param setIsLoading - Function to update loading state
   * @returns True if client is valid, false otherwise
   */
  const handleClientError = useCallback((
    client: any,
    fetchAttempts: number,
    setError: (error: Error | null) => void,
    setIsLoading: (loading: boolean) => void
  ): boolean => {
    if (!client || !client.rpc) {
      console.error("[useFetchErrorHandler] Supabase client is invalid:", { 
        clientExists: !!client,
        rpcExists: !!(client && client.rpc),
        fetchAttempt: fetchAttempts
      });
      setError(new Error("Supabase client is not properly initialized"));
      setIsLoading(false);
      return false;
    }
    return true;
  }, []);
  
  return {
    handleFetchError,
    handleClientError
  };
};
