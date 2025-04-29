
/**
 * Utility functions for neighborhood membership operations
 * 
 * These functions use our new security definer functions to avoid recursion.
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * Utility function to check if a user is a member of a specific neighborhood
 * 
 * @param userId - The ID of the user to check
 * @param neighborhoodId - The ID of the neighborhood to check
 * @returns Promise that resolves to true if the user is a member, false otherwise
 */
export async function checkNeighborhoodMembership(
  userId: string, 
  neighborhoodId: string
): Promise<boolean> {
  try {
    // Call our security definer function
    const { data, error } = await supabase
      .rpc('user_is_neighborhood_member', {
        user_uuid: userId,
        neighborhood_uuid: neighborhoodId
      });
            
    if (error) {
      console.error(`[checkNeighborhoodMembership] Error checking membership for ${neighborhoodId}:`, error);
      return false;
    }
            
    return !!data;
  } catch (err) {
    console.error("[checkNeighborhoodMembership] Error:", err);
    return false;
  }
}

/**
 * Utility function to add a user to a neighborhood
 * 
 * @param userId - The ID of the user to add
 * @param neighborhoodId - The ID of the neighborhood to add the user to
 * @returns Promise that resolves to true if successful, false otherwise
 */
export async function addNeighborhoodMember(
  userId: string,
  neighborhoodId: string
): Promise<boolean> {
  try {
    // Use our add_neighborhood_member function
    const { data, error } = await supabase
      .rpc('add_neighborhood_member', {
        user_uuid: userId,
        neighborhood_uuid: neighborhoodId
      });

    if (error) {
      console.error("[addNeighborhoodMember] Error:", error);
      return false;
    }

    return !!data;
  } catch (err) {
    console.error("[addNeighborhoodMember] Error:", err);
    return false;
  }
}

/**
 * Check if a user has created a specific neighborhood
 * 
 * @param userId - The ID of the user to check
 * @param neighborhoodId - The ID of the neighborhood to check
 * @returns Promise that resolves to true if the user created the neighborhood, false otherwise
 */
export async function checkUserCreatedNeighborhood(
  userId: string,
  neighborhoodId: string
): Promise<boolean> {
  try {
    // Call our security definer function
    const { data, error } = await supabase
      .rpc('user_created_neighborhood', {
        user_uuid: userId,
        neighborhood_uuid: neighborhoodId
      });

    if (error) {
      console.error("[checkUserCreatedNeighborhood] Error:", error);
      return false;
    }

    return !!data;
  } catch (err) {
    console.error("[checkUserCreatedNeighborhood] Error:", err);
    return false;
  }
}
