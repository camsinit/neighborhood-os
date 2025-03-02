
import { supabase } from '@/integrations/supabase/client';
import { Neighborhood } from './types';

/**
 * Utility function to check if a user has created any neighborhoods
 * 
 * @param userId - The ID of the user to check
 * @returns Promise that resolves to an array of neighborhoods created by the user
 */
export async function fetchCreatedNeighborhoods(userId: string): Promise<Neighborhood[]> {
  // This is safe because we're not using the problematic neighborhood_members table
  const { data, error } = await supabase
    .from('neighborhoods')
    .select('id, name, created_by')
    .eq('created_by', userId)
    .order('created_at', { ascending: false })
    .limit(1);
        
  if (error) {
    console.error("[NeighborhoodUtils] Error checking created neighborhoods:", error);
    throw error;
  }
  
  return data || [];
}

/**
 * Utility function to check if a user is a member of a specific neighborhood
 * Uses a security definer function to avoid RLS recursion
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
    // Use our security definer function that avoids the RLS recursion
    const { data, error } = await supabase
      .rpc('user_is_neighborhood_member', {
        user_uuid: userId,
        neighborhood_uuid: neighborhoodId
      });
        
    if (error) {
      console.error(`[NeighborhoodUtils] Error checking membership for neighborhood ${neighborhoodId}:`, error);
      return false;
    }
    
    return data === true;
  } catch (err) {
    console.error("[NeighborhoodUtils] Error in checkNeighborhoodMembership:", err);
    return false;
  }
}

/**
 * Utility function to fetch all neighborhoods in the system
 * 
 * @returns Promise that resolves to an array of all neighborhoods
 */
export async function fetchAllNeighborhoods(): Promise<Neighborhood[]> {
  const { data, error } = await supabase
    .from('neighborhoods')
    .select('id, name, created_by');
  
  if (error) {
    console.error("[NeighborhoodUtils] Error fetching all neighborhoods:", error);
    throw error;
  }
  
  return data || [];
}
