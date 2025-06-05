
/**
 * Simplified Neighborhood Context Provider
 * 
 * This provider has been streamlined to support only one neighborhood per user.
 * Removed core contributor functionality and multiple neighborhood switching.
 */
import React, { createContext, useContext } from 'react';
import { User } from '@supabase/supabase-js';
import { useNeighborhoodData } from './useNeighborhoodData';
import { Neighborhood, NeighborhoodContextType } from './types';
import { useUser } from '@supabase/auth-helpers-react';

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
 * Neighborhood provider component
 * 
 * Manages single neighborhood data and provides it to child components
 */
export const NeighborhoodProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  // Get the current authenticated user
  const user = useUser();
  
  // Initialize the neighborhood data hook - simplified version
  const { 
    currentNeighborhood,
    isLoading, 
    error,
    setCurrentNeighborhood,
    refreshNeighborhoodData,
  } = useNeighborhoodData(user);

  // Create the context value with the simplified data model
  const contextValue: NeighborhoodContextType = {
    currentNeighborhood,
    isLoading,
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
