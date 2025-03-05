
/**
 * Hook for neighborhood fetch strategies
 * 
 * This module contains the core logic for how to fetch neighborhood data
 * in different scenarios (core contributor, neighborhood creator, member)
 */
import { User } from '@supabase/supabase-js';
import { Neighborhood } from '../../types';
import { 
  fetchCreatedNeighborhoods, 
  checkCoreContributorAccess,
  fetchAllNeighborhoodsForCoreContributor,
  checkNeighborhoodMembership,
  fetchAllNeighborhoods,
  getUserNeighborhoods 
} from '../../neighborhoodUtils';

/**
 * Checks if user is a core contributor and fetches all neighborhoods if they are
 * 
 * @param userId - The user's ID
 * @param setIsCoreContributor - Function to update core contributor status
 * @param setAllNeighborhoods - Function to update available neighborhoods
 * @param setCurrentNeighborhood - Function to update current neighborhood
 * @param currentNeighborhood - Current neighborhood state
 * @param currentAttempt - Current fetch attempt number for logging
 * @returns Whether the user is a core contributor
 */
export const checkCoreContributorStrategy = async (
  userId: string,
  setIsCoreContributor: (isCore: boolean) => void,
  setAllNeighborhoods: (neighborhoods: Neighborhood[]) => void,
  setCurrentNeighborhood: (neighborhood: Neighborhood | null) => void,
  currentNeighborhood: Neighborhood | null,
  currentAttempt: number
): Promise<boolean> => {
  // Check if the user is a core contributor with access to all neighborhoods
  console.log(`[useFetchStrategy] Checking if user is core contributor (attempt ${currentAttempt})`);
  const isContributor = await checkCoreContributorAccess(userId);
  setIsCoreContributor(isContributor);
  
  // If they are a core contributor, fetch all neighborhoods
  if (isContributor) {
    console.log("[useFetchStrategy] User is a core contributor with access to all neighborhoods", {
      fetchAttempt: currentAttempt
    });
    
    // Fetch all neighborhoods using the security definer function
    const neighborhoods = await fetchAllNeighborhoodsForCoreContributor(userId);
    setAllNeighborhoods(neighborhoods);
    
    // If we have neighborhoods and no current one is set, set the first one as current
    if (neighborhoods.length > 0 && !currentNeighborhood) {
      console.log(`[useFetchStrategy] Setting first neighborhood for core contributor (attempt ${currentAttempt})`, {
        neighborhood: neighborhoods[0]
      });
      setCurrentNeighborhood(neighborhoods[0]);
    }
  }
  
  return isContributor;
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
