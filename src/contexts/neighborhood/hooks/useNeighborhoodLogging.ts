
import { useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { Neighborhood } from '../types';

/**
 * Hook to handle logging for neighborhood data
 * 
 * This hook centralizes all the debugging logs for neighborhood operations
 * to keep the main hook cleaner and more focused.
 * 
 * @param state Current state of neighborhood data to log
 */
export function useNeighborhoodLogging(state: {
  currentNeighborhood: Neighborhood | null;
  isLoading: boolean;
  error: Error | null;
  isCoreContributor: boolean;
  allNeighborhoods: Neighborhood[];
  user: User | null;
  fetchAttempts: number;
}) {
  const { 
    currentNeighborhood, 
    isLoading, 
    error, 
    isCoreContributor, 
    allNeighborhoods, 
    user, 
    fetchAttempts 
  } = state;

  // Log state changes for debugging
  useEffect(() => {
    console.log("[useNeighborhoodData] State updated:", {
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
}
