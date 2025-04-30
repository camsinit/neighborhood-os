
/**
 * Utility functions for neighborhood membership operations
 * 
 * These functions use security definer functions to avoid recursive RLS issues.
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
    // Try to use the security definer function
    const { data, error } = await supabase
      .rpc('user_is_neighborhood_member', {
        user_uuid: userId,
        neighborhood_uuid: neighborhoodId
      });
      
    if (error) {
      console.error("[checkNeighborhoodMembership] RPC error:", error);
      
      // Fall back to direct query if RPC fails
      const { data: memberData, error: memberError } = await supabase
        .from('neighborhood_members')
        .select('neighborhood_id')
        .eq('user_id', userId)
        .eq('neighborhood_id', neighborhoodId)
        .eq('status', 'active')
        .maybeSingle();
        
      if (memberError) {
        console.error("[checkNeighborhoodMembership] Fallback query error:", memberError);
        return false;
      }
      
      return !!memberData;
    }
    
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
    // Try to use a security definer function
    const { data, error } = await supabase
      .rpc('user_created_neighborhood', {
        user_uuid: userId,
        neighborhood_uuid: neighborhoodId
      });
      
    if (error) {
      console.error("[checkUserCreatedNeighborhood] RPC error:", error);
      
      // Fall back to direct query if RPC fails
      const { data: neighborhoodData, error: neighborhoodError } = await supabase
        .from('neighborhoods')
        .select('id')
        .eq('id', neighborhoodId)
        .eq('created_by', userId)
        .maybeSingle();
        
      if (neighborhoodError) {
        console.error("[checkUserCreatedNeighborhood] Fallback query error:", neighborhoodError);
        return false;
      }
      
      return !!neighborhoodData;
    }
    
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
    // Try to use a security definer function
    const { data, error } = await supabase
      .rpc('add_neighborhood_member', {
        user_uuid: userId,
        neighborhood_uuid: neighborhoodId
      });
      
    if (error) {
      console.error("[addNeighborhoodMember] RPC error:", error);
      
      // Fall back to direct insert if RPC fails
      const { error: insertError } = await supabase
        .from('neighborhood_members')
        .insert({
          user_id: userId,
          neighborhood_id: neighborhoodId,
          status: 'active'
        });
        
      if (insertError) {
        console.error("[addNeighborhoodMember] Fallback insert error:", insertError);
        return false;
      }
      
      return true;
    }
    
    return !!data;
  } catch (error) {
    console.error("[addNeighborhoodMember] Unexpected error:", error);
    return false;
  }
};
