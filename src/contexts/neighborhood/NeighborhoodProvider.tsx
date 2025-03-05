
import { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { NeighborhoodContextType } from './types';
import { useNeighborhoodData } from './useNeighborhoodData';

// Create the context with default values
const NeighborhoodContext = createContext<NeighborhoodContextType>({
  currentNeighborhood: null,
  isLoading: true,
  error: null,
  allNeighborhoods: [],
  setCurrentNeighborhood: () => {},
  refreshNeighborhoodData: () => {} // Added default for refresh function
});

/**
 * NeighborhoodProvider component
 * 
 * This component fetches the user's active neighborhood membership
 * and provides it to all child components through the context.
 * 
 * @param children - Child components that will have access to the context
 */
export function NeighborhoodProvider({ children }: { children: React.ReactNode }) {
  // Get the current authenticated user
  const user = useUser();
  
  // State to track authentication stabilizing
  const [isAuthStable, setIsAuthStable] = useState(false);
  
  // Wait for auth to stabilize before fetching neighborhood data
  useEffect(() => {
    // If we have a definite user state (either logged in or definitely not logged in),
    // mark auth as stable
    if (user !== undefined) {
      // Small delay to ensure auth is fully processed
      const timer = setTimeout(() => {
        setIsAuthStable(true);
        console.log("[NeighborhoodProvider] Auth state stabilized:", { 
          isLoggedIn: !!user, 
          userId: user?.id
        });
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [user]);
  
  // Use our custom hook to fetch and manage neighborhood data
  const neighborhoodData = useNeighborhoodData(isAuthStable ? user : null);
  
  // Log provider state for debugging
  useEffect(() => {
    console.log("[NeighborhoodProvider] Current state:", {
      isAuthStable,
      hasUser: !!user,
      userId: user?.id,
      neighborhoodLoading: neighborhoodData.isLoading,
      hasNeighborhood: !!neighborhoodData.currentNeighborhood
    });
  }, [isAuthStable, user, neighborhoodData]);

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
