
/**
 * Custom hook to get the current neighborhood ID
 * 
 * This updated version handles cases where no neighborhood is selected gracefully
 * and returns a Neighborhood object instead of just the ID
 */
import { useNeighborhood } from "@/contexts/neighborhood";
import { useUser } from "@supabase/auth-helpers-react";
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
