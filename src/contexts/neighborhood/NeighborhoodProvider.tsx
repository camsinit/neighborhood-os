
/**
 * Enhanced Neighborhood Context Provider
 * 
 * Now supports URL-based neighborhood selection for super admins
 * while maintaining single neighborhood per user for regular users.
 */
import React, { createContext, useContext } from 'react';
import { User } from '@supabase/supabase-js';
import { useParams } from 'react-router-dom';
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
  
  // Get neighborhood ID from URL params (for super admin routing)
  const params = useParams();
  const neighborhoodIdFromUrl = params.neighborhoodId;
  
  // Check if user is super admin
  const { isSuperAdmin, isLoading: isLoadingSuperAdmin } = useSuperAdminAccess();
  
  // Initialize the neighborhood data hook with URL awareness
  const { 
    currentNeighborhood,
    isLoading, 
    error,
    setCurrentNeighborhood,
    refreshNeighborhoodData,
  } = useNeighborhoodData(user, neighborhoodIdFromUrl, isSuperAdmin);

  // Create the context value with enhanced data model
  const contextValue: NeighborhoodContextType = {
    currentNeighborhood,
    isLoading: isLoading || isLoadingSuperAdmin,
    error,
    setCurrentNeighborhood,
    refreshNeighborhoodData,
  };

  return (
    <NeighborhoodContext.Provider value={contextValue}>
      {children}
    </NeighborhoodContext.Provider>
  );
};
