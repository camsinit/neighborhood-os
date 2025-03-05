
import { createContext, useContext, useState, useEffect } from 'react';
import { useUser, useSessionContext } from '@supabase/auth-helpers-react';
import { NeighborhoodContextType } from './types';
import { useNeighborhoodData } from './useNeighborhoodData';

// Create the context with default values
const NeighborhoodContext = createContext<NeighborhoodContextType>({
  currentNeighborhood: null,
  isLoading: true,
  error: null,
  isCoreContributor: false,
  allNeighborhoods: [],
  setCurrentNeighborhood: () => {},
  refreshNeighborhoodData: () => {} // Added default for refresh function
});

/**
 * NeighborhoodProvider component
 * 
 * This component fetches the user's active neighborhood membership
 * and provides it to all child components through the context.
 * It also provides "God Mode" access for core contributors.
 * 
 * @param children - Child components that will have access to the context
 */
export function NeighborhoodProvider({ children }: { children: React.ReactNode }) {
  // Get the current authenticated user and session information
  const user = useUser();
  const { isLoading: sessionLoading } = useSessionContext();
  
  // State to track authentication stabilizing
  const [isAuthStable, setIsAuthStable] = useState(false);
  
  // Wait for auth to stabilize before fetching neighborhood data
  useEffect(() => {
    // If we have a definite user state (either logged in or definitely not logged in)
    // and session loading is complete, mark auth as stable
    if (!sessionLoading) {
      // Small delay to ensure auth is fully processed
      const timer = setTimeout(() => {
        setIsAuthStable(true);
        console.log("[NeighborhoodProvider] Auth state stabilized:", { 
          isLoggedIn: !!user, 
          userId: user?.id,
          sessionLoading
        });
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [user, sessionLoading]);
  
  // Use our custom hook to fetch and manage neighborhood data
  // Only pass the user when auth is stable AND we have a user
  const neighborhoodData = useNeighborhoodData(isAuthStable && user ? user : null);
  
  // Log provider state for debugging
  useEffect(() => {
    console.log("[NeighborhoodProvider] Current state:", {
      isAuthStable,
      hasUser: !!user,
      userId: user?.id,
      sessionLoading,
      neighborhoodLoading: neighborhoodData.isLoading,
      hasNeighborhood: !!neighborhoodData.currentNeighborhood,
      error: neighborhoodData.error?.message
    });
  }, [isAuthStable, user, sessionLoading, neighborhoodData]);

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
 * and, for core contributors, the God Mode functionality
 */
export function useNeighborhood() {
  const context = useContext(NeighborhoodContext);
  if (context === undefined) {
    throw new Error('useNeighborhood must be used within a NeighborhoodProvider');
  }
  return context;
}
