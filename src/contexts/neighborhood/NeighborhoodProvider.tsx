
import { createContext, useContext } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { NeighborhoodContextType } from './types';
import { useNeighborhoodData } from './useNeighborhoodData';

// Create the context with default values - removed isCoreContributor and allNeighborhoods
const NeighborhoodContext = createContext<NeighborhoodContextType>({
  currentNeighborhood: null,
  isLoading: true,
  error: null,
  setCurrentNeighborhood: () => {},
  refreshNeighborhoodData: () => {} 
});

/**
 * NeighborhoodProvider component
 * 
 * This component fetches the user's active neighborhood membership
 * and provides it to all child components through the context.
 * Core contributor "God Mode" functionality has been removed.
 * 
 * @param children - Child components that will have access to the context
 */
export function NeighborhoodProvider({ children }: { children: React.ReactNode }) {
  // Get the current authenticated user
  const user = useUser();
  
  // Use our refactored hook to fetch and manage neighborhood data
  const neighborhoodData = useNeighborhoodData(user);

  // Provide the context values to child components
  return (
    <NeighborhoodContext.Provider value={neighborhoodData}>
      {children}
    </NeighborhoodContext.Provider>
  );
}

/**
 * useNeighborhood hook
 * 
 * A custom hook for consuming the NeighborhoodContext
 * Components can use this to access information about the user's neighborhood
 */
export function useNeighborhood() {
  const context = useContext(NeighborhoodContext);
  if (context === undefined) {
    throw new Error('useNeighborhood must be used within a NeighborhoodProvider');
  }
  return context;
}
