
/**
 * Hook for monitoring neighborhood data and safety timeouts
 * 
 * This hook provides logging and timeout safety mechanisms for
 * neighborhood data operations.
 */
import { useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { Neighborhood } from '../types';

/**
 * Hook that monitors neighborhood data changes and provides safety timeouts
 * 
 * @param props - The monitoring properties
 */
export function useNeighborhoodMonitor({
  currentNeighborhood,
  isLoading, 
  error, 
  isCoreContributor, 
  allNeighborhoods,
  user,
  fetchAttempts,
  setIsLoading,
  setError
}: {
  currentNeighborhood: Neighborhood | null;
  isLoading: boolean;
  error: Error | null;
  isCoreContributor: boolean;
  allNeighborhoods: Neighborhood[];
  user: User | null | undefined;
  fetchAttempts: number;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: Error | null) => void;
}) {
  // Log state changes for debugging
  useEffect(() => {
    console.log("[useNeighborhoodMonitor] State updated:", {
      currentNeighborhood,
      isLoading,
      error: error?.message || null,
      isCoreContributor,
      neighborhoodCount: allNeighborhoods.length,
      userId: user?.id,
      fetchAttempts,
      timestamp: new Date().toISOString()
    });
  }, [currentNeighborhood, isLoading, error, isCoreContributor, allNeighborhoods, user, fetchAttempts]);
  
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
