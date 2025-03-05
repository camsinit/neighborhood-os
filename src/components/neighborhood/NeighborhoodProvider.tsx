
/**
 * NeighborhoodProvider Component
 * 
 * This is a thin wrapper around the useNeighborhood hook to make neighborhood data
 * available through React Context. This allows components to access neighborhood data
 * without having to pass props through multiple levels.
 */
import { createContext, useContext, ReactNode } from 'react';
import { useNeighborhood } from '@/hooks/useNeighborhood';
import { UseNeighborhoodReturn } from '@/hooks/neighborhood/types';

// Create the context with a default value
const NeighborhoodContext = createContext<UseNeighborhoodReturn | undefined>(undefined);

/**
 * NeighborhoodProvider component
 * 
 * Provides neighborhood data to all child components through context.
 */
export function NeighborhoodProvider({ children }: { children: ReactNode }) {
  // Use our custom hook to get neighborhood data
  const neighborhoodData = useNeighborhood();
  
  // Provide the neighborhood data to child components
  return (
    <NeighborhoodContext.Provider value={neighborhoodData}>
      {children}
    </NeighborhoodContext.Provider>
  );
}

/**
 * useNeighborhoodContext hook
 * 
 * A custom hook for consuming the NeighborhoodContext
 */
export function useNeighborhoodContext() {
  const context = useContext(NeighborhoodContext);
  if (context === undefined) {
    throw new Error('useNeighborhoodContext must be used within a NeighborhoodProvider');
  }
  return context;
}
