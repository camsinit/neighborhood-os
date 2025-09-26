
/**
 * Enhanced Neighborhood Context Provider
 * 
 * Now supports URL-based neighborhood selection for super admins
 * while maintaining single neighborhood per user for regular users.
 */
import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { User } from '@supabase/supabase-js';
import { useParams, useLocation } from 'react-router-dom';
import { useNeighborhoodData } from './useNeighborhoodData';
import { Neighborhood, NeighborhoodContextType } from './types';
import { useUser } from '@supabase/auth-helpers-react';
import { useSuperAdminAccess } from '@/hooks/useSuperAdminAccess';

// Create the context with a default value
const NeighborhoodContext = createContext<NeighborhoodContextType>({
  currentNeighborhood: null,
  isLoading: true,
  error: null,
  setCurrentNeighborhood: () => {},
  refreshNeighborhoodData: () => {},
});

/**
 * Custom hook to access the neighborhood context
 * @returns The neighborhood context
 */
export const useNeighborhood = () => useContext(NeighborhoodContext);

/**
 * Enhanced neighborhood provider component
 * 
 * Now supports URL-based neighborhood selection for super admins
 */
export const NeighborhoodProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  // Get the current authenticated user
  const user = useUser();

  // Get current location and URL params
  const location = useLocation();
  const params = useParams();
  const neighborhoodIdFromUrl = params.neighborhoodId;

  // Check if user is super admin
  const { isSuperAdmin, isLoading: isLoadingSuperAdmin } = useSuperAdminAccess();

  // Add enhanced debug logging for URL parameter changes (for problematic user)
  useEffect(() => {
    if (user?.id === '74bf3085-8275-4eb2-a721-8c8e91b3d3d8') {
      console.log('[DEBUG - User 74bf...] NeighborhoodProvider - URL params changed:', {
        fullPath: location.pathname,
        search: location.search,
        allParams: params,
        neighborhoodIdFromUrl,
        isSuperAdmin,
        isLoadingSuperAdmin,
        timestamp: new Date().toISOString()
      });
    }
  }, [location.pathname, location.search, neighborhoodIdFromUrl, isSuperAdmin, isLoadingSuperAdmin, user?.id]);

  // Initialize the neighborhood data hook with URL awareness
  const { 
    currentNeighborhood,
    isLoading, 
    error,
    setCurrentNeighborhood,
    refreshNeighborhoodData,
  } = useNeighborhoodData(user, neighborhoodIdFromUrl, isSuperAdmin);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue: NeighborhoodContextType = useMemo(() => ({
    currentNeighborhood,
    isLoading: isLoading || isLoadingSuperAdmin,
    error,
    setCurrentNeighborhood,
    refreshNeighborhoodData,
  }), [currentNeighborhood, isLoading, isLoadingSuperAdmin, error, setCurrentNeighborhood, refreshNeighborhoodData]);

  return (
    <NeighborhoodContext.Provider value={contextValue}>
      {children}
    </NeighborhoodContext.Provider>
  );
};
