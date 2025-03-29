/**
 * Hook for monitoring neighborhood data loading state
 *
 * This simplified version removes core contributor functionality.
 */
import { useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { Neighborhood } from '../types';

/**
 * Props for the useNeighborhoodMonitor hook
 */
interface UseNeighborhoodMonitorProps {
  currentNeighborhood: Neighborhood | null;
  isLoading: boolean;
  error: Error | null;
  user: User | null;
  fetchAttempts: number;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: Error | null) => void;
}

/**
 * Custom hook that monitors neighborhood data loading state
 * and prevents infinite loading
 * 
 * @param props - The props for the hook
 */
export function useNeighborhoodMonitor({
  currentNeighborhood,
  isLoading,
  error,
  user,
  fetchAttempts,
  setIsLoading,
  setError
}: UseNeighborhoodMonitorProps) {
  // Log state changes for debugging
  useEffect(() => {
    console.log("[useNeighborhoodMonitor] State updated:", {
      currentNeighborhood,
      isLoading,
      error: error?.message || null,
      userId: user?.id,
      fetchAttempts,
      timestamp: new Date().toISOString()
    });
  }, [currentNeighborhood, isLoading, error, user, fetchAttempts]);
  
  // Add a safety timeout to ensure loading state is eventually cleared
  useEffect(() => {
    // Skip if not loading
    if (!isLoading) {
      return;
    }
    
    // Add a safety timeout to ensure loading state is eventually cleared
    // even if the fetch operation gets stuck
    const safetyTimer = setTimeout(() => {
      if (isLoading) {
        console.warn("[useNeighborhoodMonitor] Safety timeout triggered - fetch operation took too long");
        setIsLoading(false);
        setError(new Error("Neighborhood data fetch timed out"));
      }
    }, 10000); // 10 second timeout
    
    return () => {
      clearTimeout(safetyTimer);
    };
  }, [isLoading, setIsLoading, setError]);
}
