
import { useNeighborhood } from "@/contexts/neighborhood";

/**
 * Custom hook to get the current neighborhood ID and throw an error if none is selected
 * @returns The current neighborhood ID
 * @throws Error if no neighborhood is selected
 */
export const useCurrentNeighborhood = () => {
  // Get the neighborhood context from the provider
  const { currentNeighborhood } = useNeighborhood();
  
  // Log the current neighborhood status to help with debugging
  console.log("[useCurrentNeighborhood] Checking neighborhood:", { 
    hasNeighborhood: !!currentNeighborhood?.id,
    neighborhoodId: currentNeighborhood?.id,
    neighborhoodName: currentNeighborhood?.name,
    timestamp: new Date().toISOString()
  });
  
  // If no neighborhood is selected, throw an error
  if (!currentNeighborhood?.id) {
    console.error("[useCurrentNeighborhood] No neighborhood selected, throwing error");
    throw new Error("No neighborhood selected");
  }
  
  // If we get here, we have a valid neighborhood ID, so return it
  console.log("[useCurrentNeighborhood] Valid neighborhood found:", { 
    neighborhoodId: currentNeighborhood.id,
    timestamp: new Date().toISOString()
  });
  
  return currentNeighborhood.id;
};
