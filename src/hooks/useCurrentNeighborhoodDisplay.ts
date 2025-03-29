
/**
 * Hook to get the current neighborhood's display information
 * 
 * This is a simplified version that doesn't rely on core contributor privileges
 */
import { useNeighborhood } from "@/contexts/neighborhood";
import { useState, useEffect } from "react";

interface NeighborhoodDisplayInfo {
  id: string | null;
  name: string | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Custom hook that provides properly formatted display info for the current neighborhood
 * 
 * @returns Neighborhood display information and loading state
 */
export const useCurrentNeighborhoodDisplay = (): NeighborhoodDisplayInfo => {
  // Get neighborhood data from context
  const { 
    currentNeighborhood, 
    isLoading, 
    error 
  } = useNeighborhood();
  
  // State to store formatted display info
  const [displayInfo, setDisplayInfo] = useState<NeighborhoodDisplayInfo>({
    id: null,
    name: null,
    isLoading: true,
    error: null
  });
  
  // Update display info when neighborhood data changes
  useEffect(() => {
    setDisplayInfo({
      id: currentNeighborhood?.id || null,
      name: currentNeighborhood?.name || null,
      isLoading,
      error
    });
  }, [currentNeighborhood, isLoading, error]);
  
  return displayInfo;
};
