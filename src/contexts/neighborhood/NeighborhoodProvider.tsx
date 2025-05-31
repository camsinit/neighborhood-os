
/**
 * Simplified Neighborhood Context Provider
 * 
 * This provider has been streamlined to remove core contributor functionality
 * and work with the simplified database security model.
 */
import React, { createContext, useContext } from 'react';
import { User } from '@supabase/supabase-js';
import { useNeighborhoodData } from './useNeighborhoodData';
import { Neighborhood, NeighborhoodContextType } from './types';
import { useUser } from '@supabase/auth-helpers-react';

// Create the context with a default value
const NeighborhoodContext = createContext<NeighborhoodContextType>({
  currentNeighborhood: null,
  userNeighborhoods: [], // Added default empty array
  isLoading: true,
  error: null,
  setCurrentNeighborhood: () => {},
  switchNeighborhood: () => {}, // Added default function
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
 * Manages neighborhood data and provides it to child components
 */
export const NeighborhoodProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  // Get the current authenticated user
  const user = useUser();
  
  // Initialize the neighborhood data hook
  const { 
    currentNeighborhood,
    userNeighborhoods, // Get userNeighborhoods from the hook
    isLoading, 
    error,
    setCurrentNeighborhood,
    switchNeighborhood, // Get switchNeighborhood function from the hook
    refreshNeighborhoodData,
  } = useNeighborhoodData(user);

  // Create the context value with the updated data model
  const contextValue: NeighborhoodContextType = {
    currentNeighborhood,
    userNeighborhoods, // Include userNeighborhoods in context
    isLoading,
    error,
    setCurrentNeighborhood,
    switchNeighborhood, // Include switchNeighborhood in context
    refreshNeighborhoodData,
  };

  return (
    <NeighborhoodContext.Provider value={contextValue}>
      {children}
    </NeighborhoodContext.Provider>
  );
};
