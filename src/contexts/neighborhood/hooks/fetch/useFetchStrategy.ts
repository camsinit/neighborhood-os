
/**
 * Hook for neighborhood fetch strategies
 * 
 * This module contains the core logic for how to fetch neighborhood data
 * in different scenarios (neighborhood creator, member)
 */
import { User } from '@supabase/supabase-js';
import { Neighborhood } from '../../types';
import { 
  fetchCreatedNeighborhoods, 
  fetchAllNeighborhoods,
  checkNeighborhoodMembership,
  getUserNeighborhoods 
} from '../../neighborhoodUtils';

/**
 * Hook to provide neighborhood fetch strategies
 * 
 * @returns Object containing neighborhood fetch strategy functions
 */
export const useFetchStrategy = () => {
  /**
   * Fetch all neighborhoods a user is a member of using the RPC function
   * 
   * @param userId - The ID of the user to fetch neighborhoods for
   * @returns Array of neighborhoods the user is a member of
   */
  const fetchUserNeighborhoods = async (userId: string): Promise<Neighborhood[]> => {
    // Get all neighborhoods in one go using our RPC helper function
    console.log(`[useFetchStrategy] Using RPC-based neighborhood fetch for user ${userId}`);
    return await getUserNeighborhoods(userId);
  };

  return {
    fetchUserNeighborhoods
  };
};

// Also export the standalone strategy functions for direct use
export { 
  checkCreatedNeighborhoodStrategy,
  checkMembershipStrategy,
  legacyCheckMembershipStrategy
};

/**
 * Checks if user created any neighborhoods and uses the first one found
 * 
 * @param userId - The ID of the user to check
 * @param setCurrentNeighborhood - Function to update current neighborhood
 * @param currentAttempt - Current fetch attempt number for logging
 * @returns True if a created neighborhood was found, false otherwise
 */
export const checkCreatedNeighborhoodStrategy = async (
  userId: string,
  setCurrentNeighborhood: (neighborhood: Neighborhood | null) => void,
  currentAttempt: number
): Promise<boolean> => {
  // Check if the user created any neighborhoods using our utility function
  console.log(`[useFetchStrategy] Checking if user created neighborhoods (attempt ${currentAttempt})`);
  const { data: createdNeighborhoods, error: createdError } = await fetchCreatedNeighborhoods(userId);
  
  if (createdError) {
    console.warn("[useFetchStrategy] Error checking created neighborhoods:", createdError);
  }
  
  // If user created a neighborhood, use it
  if (createdNeighborhoods && createdNeighborhoods.length > 0) {
    console.log("[useFetchStrategy] Found user-created neighborhood:", {
      neighborhood: createdNeighborhoods[0],
      userId,
      fetchAttempt: currentAttempt
    });
    
    setCurrentNeighborhood(createdNeighborhoods[0]);
    return true;
  }
  
  return false;
};

/**
 * Simplified strategy - check all neighborhood memberships in one go
 * This is our updated approach to avoid recursion issues using RPC
 * 
 * @param userId - The ID of the user to check
 * @param setCurrentNeighborhood - Function to update current neighborhood
 * @param currentAttempt - Current fetch attempt number for logging
 * @returns True if membership found, false otherwise
 */
export const checkMembershipStrategy = async (
  userId: string,
  setCurrentNeighborhood: (neighborhood: Neighborhood | null) => void,
  currentAttempt: number
): Promise<boolean> => {
  console.log(`[useFetchStrategy] Using RPC-based membership check (attempt ${currentAttempt})`);

  // Get all neighborhoods in one go using our RPC helper function
  const neighborhoods = await getUserNeighborhoods(userId);
  
  if (!neighborhoods || neighborhoods.length === 0) {
    console.log(`[useFetchStrategy] No neighborhoods found for user (attempt ${currentAttempt})`);
    setCurrentNeighborhood(null);
    return false;
  }
  
  console.log(`[useFetchStrategy] Found ${neighborhoods.length} neighborhoods for user (attempt ${currentAttempt})`);
  
  // Just use the first one as the current neighborhood
  setCurrentNeighborhood(neighborhoods[0]);
  return true;
};

/**
 * Legacy membership check strategy - kept for fallback
 * 
 * @param userId - The ID of the user to check
 * @param setCurrentNeighborhood - Function to update current neighborhood
 * @param currentAttempt - Current fetch attempt number for logging
 * @returns True if membership found, false otherwise
 */
export const legacyCheckMembershipStrategy = async (
  userId: string,
  setCurrentNeighborhood: (neighborhood: Neighborhood | null) => void,
  currentAttempt: number
): Promise<boolean> => {
  // Get all neighborhoods to check membership
  console.log(`[useFetchStrategy] Fetching all neighborhoods to check membership (attempt ${currentAttempt})`);
  const neighborhoods = await fetchAllNeighborhoods();
  
  if (!neighborhoods || neighborhoods.length === 0) {
    console.log(`[useFetchStrategy] No neighborhoods found (attempt ${currentAttempt})`);
    setCurrentNeighborhood(null);
    return false;
  }
  
  console.log(`[useFetchStrategy] Found ${neighborhoods.length} neighborhoods, checking membership (attempt ${currentAttempt})`);
  
  // For each neighborhood, check if user is a member using our safe function
  for (const neighborhood of neighborhoods) {
    console.log(`[useFetchStrategy] Checking membership for neighborhood ${neighborhood.id} (attempt ${currentAttempt})`);
    const isMember = await checkNeighborhoodMembership(userId, neighborhood.id);
          
    if (isMember) {
      console.log("[useFetchStrategy] Found user membership in neighborhood:", {
        neighborhood: neighborhood,
        userId: userId,
        fetchAttempt: currentAttempt
      });
          
      setCurrentNeighborhood(neighborhood);
      return true;
    }
  }
  
  return false;
};
