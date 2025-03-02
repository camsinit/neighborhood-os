
/**
 * Utility functions for neighborhood data
 * 
 * These functions handle API calls to Supabase for neighborhood-related operations
 */

import { supabase } from '@/integrations/supabase/client';
import { Neighborhood } from './types';

/**
 * Utility function to check if a user has created any neighborhoods
 * 
 * @param userId - The ID of the user to check
 * @returns Promise that resolves to an array of neighborhoods created by the user
 */
export async function fetchCreatedNeighborhoods(userId: string): Promise<Neighborhood[]> {
  try {
    // This query is safe because we're just querying the neighborhoods table directly
    // No access to neighborhood_members which causes the recursion issue
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
  } catch (err) {
    console.error("[NeighborhoodUtils] Error in fetchCreatedNeighborhoods:", err);
    return [];
  }
}

/**
 * Utility function to get all members of a neighborhood
 * Uses our safe security definer function to avoid RLS recursion
 * 
 * @param neighborhoodId - The ID of the neighborhood to check
 * @returns Promise that resolves to an array of user IDs who are members
 */
export async function fetchNeighborhoodMembers(neighborhoodId: string): Promise<string[]> {
  try {
    // Call our new security definer function instead of directly querying the table
    const { data, error } = await supabase
      .rpc('get_neighborhood_members_safe', { 
        neighborhood_uuid: neighborhoodId 
      });
        
    if (error) {
      console.error(`[NeighborhoodUtils] Error fetching members for neighborhood ${neighborhoodId}:`, error);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error("[NeighborhoodUtils] Error in fetchNeighborhoodMembers:", err);
    return [];
  }
}

/**
 * Utility function to check if a user is a member of a specific neighborhood
 * Uses our safe approach to avoid RLS recursion
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
    const members = await fetchNeighborhoodMembers(neighborhoodId);
    return members.includes(userId);
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
  try {
    const { data, error } = await supabase
      .from('neighborhoods')
      .select('id, name, created_by');
    
    if (error) {
      console.error("[NeighborhoodUtils] Error fetching all neighborhoods:", error);
      throw error;
    }
    
    return data || [];
  } catch (err) {
    console.error("[NeighborhoodUtils] Error in fetchAllNeighborhoods:", err);
    return [];
  }
}
