
/**
 * Utility functions for neighborhood membership operations
 * 
 * UPDATED: Now uses the new security definer functions to avoid RLS recursion
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * Utility function to check if a user is a member of a specific neighborhood
 * Uses the new security definer function to avoid recursion
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
    // Use the new security definer function to check access
    const { data: hasAccess, error } = await supabase
      .rpc('check_neighborhood_access', {
        user_uuid: userId,
        neighborhood_uuid: neighborhoodId
      });
            
    if (error) {
      console.error(`[NeighborhoodUtils] Error checking access for ${neighborhoodId}:`, error);
      return false;
    }
            
    return !!hasAccess;
  } catch (err) {
    console.error("[NeighborhoodUtils] Error in checkNeighborhoodMembership:", err);
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
    // Direct insert with the new RLS policies handling permissions
    const { data, error } = await supabase
      .from('neighborhood_members')
      .insert({
        user_id: userId,
        neighborhood_id: neighborhoodId,
        status: 'active'
      })
      .select('id')
      .single();

    if (error) {
      console.error("[NeighborhoodUtils] Error adding neighborhood member:", error);
      return false;
    }

    return !!data;
  } catch (err) {
    console.error("[NeighborhoodUtils] Error in addNeighborhoodMember:", err);
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
    // Direct query to neighborhoods table - new RLS policies handle this properly
    const { data, error } = await supabase
      .from('neighborhoods')
      .select('id')
      .eq('id', neighborhoodId)
      .eq('created_by', userId)
      .maybeSingle();

    if (error) {
      console.error("[NeighborhoodUtils] Error checking if user created neighborhood:", error);
      return false;
    }

    return !!data;
  } catch (err) {
    console.error("[NeighborhoodUtils] Error in checkUserCreatedNeighborhood:", err);
    return false;
  }
}
