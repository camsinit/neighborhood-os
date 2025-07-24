/**
 * Enhanced neighborhood data hook
 * 
 * Now supports URL-based neighborhood selection for super admins
 * while maintaining single neighborhood per user for regular users.
 */
import { User } from '@supabase/supabase-js';
import { useNeighborhoodStatus } from './hooks/useNeighborhoodStatus';
import { useFetchNeighborhood } from './hooks/useFetchNeighborhood';
import { useFetchNeighborhoodById } from './hooks/useFetchNeighborhoodById';
import { useAuthStabilizer } from './hooks/useAuthStabilizer';
import { useNeighborhoodMonitor } from './hooks/useNeighborhoodMonitor';
import { useEffect } from 'react';
import { Neighborhood } from './types';

/**
 * Enhanced hook that handles fetching and managing neighborhood data
 * 
 * @param user - The current authenticated user
 * @param neighborhoodIdFromUrl - Neighborhood ID from URL params (for super admin)
 * @param isSuperAdmin - Whether the user has super admin privileges
 * @returns Object containing neighborhood data and loading state
 */
export function useNeighborhoodData(
  user: User | null, 
  neighborhoodIdFromUrl?: string | null, 
  isSuperAdmin?: boolean
) {
  // Initialize status tracking
  const statusHook = useNeighborhoodStatus();
  const {
    isLoading, setIsLoading,
    error, setError,
    fetchAttempts,
    refreshNeighborhoodData,
    startFetch,
    completeFetch,
    handleFetchError
  } = statusHook;
  
  // Wait for auth to stabilize
  const isAuthStable = useAuthStabilizer(user);
  
  // Initialize regular neighborhood data fetching (for non-super-admin or fallback)
  const regularNeighborhoodHook = useFetchNeighborhood(
    isAuthStable ? user : null,
    fetchAttempts,
    { startFetch, completeFetch, handleFetchError, setIsLoading }
  );
  
  // Initialize super admin neighborhood data fetching (by ID)
  const superAdminNeighborhoodHook = useFetchNeighborhoodById(
    isAuthStable ? user : null,
    neighborhoodIdFromUrl,
    isSuperAdmin || false,
    { startFetch, completeFetch, handleFetchError, setIsLoading }
  );
  
  // Determine which mode to use
  const shouldUseSuperAdminMode = isSuperAdmin && neighborhoodIdFromUrl;
  
  // Select the appropriate neighborhood data based on mode
  const currentNeighborhood = shouldUseSuperAdminMode 
    ? superAdminNeighborhoodHook.currentNeighborhood 
    : regularNeighborhoodHook.currentNeighborhood;
  
  const setCurrentNeighborhood = shouldUseSuperAdminMode 
    ? superAdminNeighborhoodHook.setCurrentNeighborhood 
    : regularNeighborhoodHook.setCurrentNeighborhood;

  // Add debugging for the problematic user
  useEffect(() => {
    if (user?.id === '74bf3085-8275-4eb2-a721-8c8e91b3d3d8') {
      console.log('[DEBUG - User 74bf...] useNeighborhoodData - enhanced mode:', {
        currentNeighborhood,
        isLoading,
        error,
        shouldUseSuperAdminMode,
        neighborhoodIdFromUrl,
        isSuperAdmin,
        timestamp: new Date().toISOString()
      });
    }
  }, [currentNeighborhood, isLoading, error, user?.id, shouldUseSuperAdminMode, neighborhoodIdFromUrl, isSuperAdmin]);
  
  // Set up monitoring and safety timeouts
  useNeighborhoodMonitor({
    currentNeighborhood,
    isLoading,
    error,
    user,
    fetchAttempts,
    setIsLoading,
    setError
  });

  // Main effect to fetch neighborhood data
  useEffect(() => {
    if (isAuthStable) {
      const forceRefresh = fetchAttempts > 0;
      
      if (shouldUseSuperAdminMode) {
        // Use super admin mode - fetch by ID
        superAdminNeighborhoodHook.fetchNeighborhoodById(forceRefresh);
      } else {
        // Use regular mode - fetch user's neighborhood
        regularNeighborhoodHook.fetchNeighborhood(forceRefresh);
      }
    }
  }, [
    isAuthStable, 
    user, 
    fetchAttempts, 
    shouldUseSuperAdminMode,
    neighborhoodIdFromUrl,
    regularNeighborhoodHook.fetchNeighborhood,
    superAdminNeighborhoodHook.fetchNeighborhoodById
  ]);

  // Enhanced refresh function that handles both modes
  const enhancedRefreshNeighborhoodData = () => {
    if (shouldUseSuperAdminMode) {
      superAdminNeighborhoodHook.fetchNeighborhoodById(true);
    } else {
      regularNeighborhoodHook.fetchNeighborhood(true);
    }
  };

  // Return enhanced state and functions
  return { 
    currentNeighborhood,
    isLoading, 
    error,
    setCurrentNeighborhood,
    refreshNeighborhoodData: enhancedRefreshNeighborhoodData
  };
}