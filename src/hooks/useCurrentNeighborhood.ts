
/**
 * Custom hook to get the current neighborhood ID
 * 
 * This updated version handles cases where no neighborhood is selected gracefully
 * and returns a Neighborhood object instead of just the ID
 */
import { useNeighborhood } from "@/contexts/neighborhood";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { Neighborhood } from "@/contexts/neighborhood/types";
import { createLogger } from "@/utils/logger";

const logger = createLogger('CurrentNeighborhood');

/**
 * Custom hook to get the current neighborhood
 * UPDATED VERSION: Returns the complete neighborhood object (or null) instead of just the ID
 * 
 * @returns The current neighborhood or null if none selected
 */
export const useCurrentNeighborhood = (): Neighborhood | null => {
  // Get the neighborhood context from the provider
  const { currentNeighborhood } = useNeighborhood();
  
  // Get the current authenticated user
  const user = useUser();
  
  // State to store debugging information
  const [debugInfo, setDebugInfo] = useState<any>(null);
  
  // Check authentication context on mount - this helps diagnose RLS issues
  useEffect(() => {
    const checkAuthContext = async () => {
      try {
        // Verify Supabase authentication context with direct query
        const { data: authResult } = await supabase
          .from('auth_users_view')
          .select('id')
          .limit(1);
        
        // Store debug information
        setDebugInfo({
          authContext: authResult?.[0]?.id === user?.id ? 'Valid' : 'Mismatch',
          userID: user?.id,
          neighborhoodID: currentNeighborhood?.id,
          timestamp: new Date().toISOString()
        });
        
        // Only log if there's a problem
        if (!authResult || authResult[0]?.id !== user?.id) {
          logger.warn("Auth Context Check Failed:", {
            authContextExists: !!authResult,
            authUserId: authResult?.[0]?.id,
            currentUserId: user?.id,
            neighborhoodID: currentNeighborhood?.id
          });
        }
      } catch (error) {
        logger.error("Auth context check failed:", error);
      }
    };
    
    // Only run this check if we have both a user and neighborhood
    if (user && currentNeighborhood?.id) {
      checkAuthContext();
    }
  }, [user, currentNeighborhood]);
  
  // UPDATED: Return the entire neighborhood object (or null) instead of just the ID
  if (!currentNeighborhood?.id) {
    logger.debug("No neighborhood selected - returning null");
    return null;
  }
  
  logger.debug("Valid neighborhood found:", { 
    neighborhoodId: currentNeighborhood.id,
    neighborhoodName: currentNeighborhood.name
  });
  
  return currentNeighborhood;
};
