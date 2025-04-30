
/**
 * Utility functions for neighborhood membership operations
 * 
 * These functions use security definer functions to avoid recursive RLS issues.
 * They have been updated to fix recursion problems in RLS policies.
 */
import { supabase } from '@/integrations/supabase/client';

/**
 * Check if a user is a member of a specific neighborhood
 * 
 * @param userId - The ID of the user to check
 * @param neighborhoodId - The ID of the neighborhood to check
 * @returns Promise that resolves to true if the user is a member, false otherwise
 */
export const checkNeighborhoodMembership = async (
  userId: string, 
  neighborhoodId: string
): Promise<boolean> => {
  try {
    console.log(`[checkNeighborhoodMembership] Checking if user ${userId} is a member of ${neighborhoodId}`);
    
    // Direct query approach to avoid recursion
    const { data, error } = await supabase
      .from('neighborhood_members')
      .select('id')
      .eq('user_id', userId)
      .eq('neighborhood_id', neighborhoodId)
      .eq('status', 'active')
      .maybeSingle();
      
    if (error) {
      // Log the error but don't throw - return false instead
      console.error("[checkNeighborhoodMembership] Query error:", error);
      return false;
    }
    
    // Return true if we found a record, false otherwise
    return !!data;
  } catch (error) {
    console.error("[checkNeighborhoodMembership] Unexpected error:", error);
    return false;
  }
};

/**
 * Check if a user created a specific neighborhood
 * 
 * @param userId - The ID of the user to check
 * @param neighborhoodId - The ID of the neighborhood to check
 * @returns Promise that resolves to true if the user created the neighborhood, false otherwise
 */
export const checkUserCreatedNeighborhood = async (
  userId: string,
  neighborhoodId: string
): Promise<boolean> => {
  try {
    console.log(`[checkUserCreatedNeighborhood] Checking if user ${userId} created neighborhood ${neighborhoodId}`);
    
    // Direct query approach - simple and avoids recursion
    const { data, error } = await supabase
      .from('neighborhoods')
      .select('id')
      .eq('id', neighborhoodId)
      .eq('created_by', userId)
      .maybeSingle();
      
    if (error) {
      // Log the error but don't throw - return false instead
      console.error("[checkUserCreatedNeighborhood] Query error:", error);
      return false;
    }
    
    // Return true if we found a record, false otherwise
    return !!data;
  } catch (error) {
    console.error("[checkUserCreatedNeighborhood] Unexpected error:", error);
    return false;
  }
};

/**
 * Add a user to a neighborhood
 * 
 * @param userId - The ID of the user to add
 * @param neighborhoodId - The ID of the neighborhood to add the user to
 * @returns Promise that resolves to true if successful, false otherwise
 */
export const addNeighborhoodMember = async (
  userId: string,
  neighborhoodId: string
): Promise<boolean> => {
  try {
    console.log(`[addNeighborhoodMember] Adding user ${userId} to neighborhood ${neighborhoodId}`);
    
    // First check if the user is already a member
    const isMember = await checkNeighborhoodMembership(userId, neighborhoodId);
    
    if (isMember) {
      console.log("[addNeighborhoodMember] User is already a member");
      return true; // Already a member, consider it success
    }
    
    // Direct insert - simple and avoids recursion
    const { error } = await supabase
      .from('neighborhood_members')
      .insert({
        user_id: userId,
        neighborhood_id: neighborhoodId,
        status: 'active'
      });
      
    if (error) {
      console.error("[addNeighborhoodMember] Insert error:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("[addNeighborhoodMember] Unexpected error:", error);
    return false;
  }
};
