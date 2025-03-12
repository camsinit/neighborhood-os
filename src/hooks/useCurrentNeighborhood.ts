
import { useNeighborhood } from "@/contexts/neighborhood";

/**
 * Custom hook to get the current neighborhood ID and throw an error if none is selected
 * @returns The current neighborhood ID
 * @throws Error if no neighborhood is selected
 */
export const useCurrentNeighborhood = () => {
  const { currentNeighborhood } = useNeighborhood();
  
  if (!currentNeighborhood?.id) {
    throw new Error("No neighborhood selected");
  }
  
  return currentNeighborhood.id;
};
