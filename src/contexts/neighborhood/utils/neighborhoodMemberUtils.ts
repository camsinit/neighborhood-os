
/**
 * Utility functions for neighborhood membership operations
 * 
 * These functions handle user membership checks and operations
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * Utility function to check if a user is a member of a specific neighborhood
 * Uses a direct query approach to avoid RLS recursion
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
    // Validate supabase client
    if (!supabase) {
      console.error("[NeighborhoodUtils] Supabase client is not available");
      return false;
    }

    // Use a direct query with explicit typing
    const { data, error } = await supabase
      .from('neighborhood_members')
      .select('user_id')
      .eq('user_id', userId)
      .eq('neighborhood_id', neighborhoodId)
      .eq('status', 'active')
      .single();
            
    if (error) {
      console.error(`[NeighborhoodUtils] Error checking membership for ${neighborhoodId}:`, error);
      return false;
    }
            
    return !!data;
  } catch (err) {
    console.error("[NeighborhoodUtils] Error in checkNeighborhoodMembership:", err);
    return false;
  }
}

/**
 * Utility function to add a user to a neighborhood
 * Uses the RPC function to safely add a member
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
    // Validate supabase client
    if (!supabase) {
      console.error("[NeighborhoodUtils] Supabase client is not available");
      return false;
    }

    // Call the RPC function
    const { data, error } = await supabase.rpc(
      'add_neighborhood_member',
      {
        user_uuid: userId,
        neighborhood_uuid: neighborhoodId
      }
    );

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
    // Validate supabase client
    if (!supabase) {
      console.error("[NeighborhoodUtils] Supabase client is not available");
      return false;
    }

    // Use a direct query
    const { data, error } = await supabase
      .from('neighborhoods')
      .select('id')
      .eq('id', neighborhoodId)
      .eq('created_by', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Not found error
        return false;
      }
      console.error("[NeighborhoodUtils] Error checking if user created neighborhood:", error);
      return false;
    }

    return !!data;
  } catch (err) {
    console.error("[NeighborhoodUtils] Error in checkUserCreatedNeighborhood:", err);
    return false;
  }
}
