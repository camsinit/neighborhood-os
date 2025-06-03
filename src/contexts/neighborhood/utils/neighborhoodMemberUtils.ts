/**
 * Utility functions for neighborhood membership operations
 * 
 * UPDATED: Now uses the correct parameter names for security definer functions
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * Utility function to check if a user is a member of a specific neighborhood
 * Uses the security definer function with correct parameter names
 * 
 * @param userId - The ID of the user to check (not used - function uses auth.uid() internally)
 * @param neighborhoodId - The ID of the neighborhood to check
 * @returns Promise that resolves to true if the user is a member, false otherwise
 */
export async function checkNeighborhoodMembership(
  userId: string, 
  neighborhoodId: string
): Promise<boolean> {
  try {
    // Fixed: Only pass neighborhood_uuid parameter since function uses auth.uid() internally
    const { data: hasAccess, error } = await supabase
      .rpc('check_neighborhood_access', {
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
