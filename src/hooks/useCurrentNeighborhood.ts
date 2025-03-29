
import { useNeighborhood } from "@/contexts/neighborhood";

/**
 * Custom hook to get the current neighborhood ID and throw an error if none is selected
 * This is a critical hook used throughout the application to ensure proper neighborhood context
 * 
 * @returns The current neighborhood ID
 * @throws Error if no neighborhood is selected
 */
export const useCurrentNeighborhood = () => {
  // Get the neighborhood context from the provider
  const { currentNeighborhood, isCoreContributor } = useNeighborhood();
  
  // Log the current neighborhood status with enhanced details for better debugging
  console.log("[useCurrentNeighborhood] Checking neighborhood context:", { 
    hasNeighborhood: !!currentNeighborhood?.id,
    neighborhoodId: currentNeighborhood?.id,
    neighborhoodName: currentNeighborhood?.name,
    isCoreContributor: isCoreContributor,
    timestamp: new Date().toISOString(),
    stack: new Error().stack?.split('\n').slice(1, 3).join('\n') // Get stack trace to see where it's being called from
  });
  
  // If no neighborhood is selected, log detailed error information and throw an error
  if (!currentNeighborhood?.id) {
    // Enhance error logging with more context
    console.error("[useCurrentNeighborhood] ⚠️ NO NEIGHBORHOOD SELECTED - RLS WILL FAIL ⚠️", {
      neighborhoodContext: JSON.stringify(currentNeighborhood, null, 2),
      isCoreContributor: isCoreContributor,
      calledFrom: new Error().stack?.split('\n').slice(1, 5).join('\n'), // More detailed stack trace
      timestamp: new Date().toISOString()
    });
    
    // Throw a more descriptive error
    throw new Error("No neighborhood selected - this will cause RLS policies to block data access");
  }
  
  // If we get here, we have a valid neighborhood ID, so log success and return it
  console.log("[useCurrentNeighborhood] ✅ Valid neighborhood found:", { 
    neighborhoodId: currentNeighborhood.id,
    neighborhoodName: currentNeighborhood.name,
    isCoreContributor: isCoreContributor,
    timestamp: new Date().toISOString()
  });
  
  return currentNeighborhood.id;
};
