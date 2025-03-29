
/**
 * Neighborhood fetch utility functions
 * 
 * These utilities handle safe fetching of neighborhood data using
 * the security definer functions to avoid RLS recursion issues
 */
import { supabase } from "@/integrations/supabase/client";
import { Neighborhood } from "../types";

/**
 * Fetch neighborhoods created by a user
 * 
 * Uses a security definer function to safely get neighborhoods without RLS recursion
 * 
 * @param userId - The ID of the user to check
 * @returns Promise resolving to the user's created neighborhoods
 */
export async function fetchCreatedNeighborhoods(userId: string) {
  // This function fetches neighborhoods that were created by this user
  try {
    // Direct query - this is safe because the neighborhoods table has a policy for created_by
    return await supabase
      .from('neighborhoods')
      .select('id, name')
      .eq('created_by', userId);
  } catch (error) {
    console.error("[NeighborhoodFetchUtils] Error fetching created neighborhoods:", error);
    throw error;
  }
}

/**
 * Check if a user is a core contributor with access to all neighborhoods
 * 
 * @param userId - The ID of the user to check
 * @returns Promise resolving to true if the user is a core contributor
 */
export async function checkCoreContributorAccess(userId: string): Promise<boolean> {
  try {
    // Use the new function we created in the migration
    const { data, error } = await supabase.rpc(
      'user_is_core_contributor_with_access',
      { user_uuid: userId }
    );

    if (error) throw error;
    return !!data;
  } catch (err) {
    // Log error but don't halt execution
    console.warn("[NeighborhoodFetchUtils] Error checking core contributor status:", err);
    return false;
  }
}

/**
 * Fetch all neighborhoods (for core contributors)
 * 
 * This is safe because it uses a security definer function
 * 
 * @returns Promise resolving to all neighborhoods
 */
export async function fetchAllNeighborhoods(): Promise<Neighborhood[]> {
  try {
    const { data, error } = await supabase.rpc('get_all_neighborhoods_safe');
    
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("[NeighborhoodFetchUtils] Error fetching all neighborhoods:", err);
    return [];
  }
}

/**
 * Fetch all neighborhoods for a core contributor
 * 
 * @param userId - The ID of the core contributor
 * @returns Promise resolving to all neighborhoods if the user is a core contributor
 */
export async function fetchAllNeighborhoodsForCoreContributor(
  userId: string
): Promise<Neighborhood[]> {
  try {
    const { data, error } = await supabase.rpc(
      'get_all_neighborhoods_for_core_contributor',
      { user_uuid: userId }
    );
    
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("[NeighborhoodFetchUtils] Error fetching neighborhoods for core contributor:", err);
    return [];
  }
}

/**
 * Fetch members of a neighborhood
 * 
 * Uses a security definer function to avoid RLS recursion
 * 
 * @param neighborhoodId - The ID of the neighborhood
 * @returns Promise resolving to an array of user IDs
 */
export async function fetchNeighborhoodMembers(neighborhoodId: string): Promise<string[]> {
  try {
    // Use our new simple member function from the migration
    const { data, error } = await supabase.rpc(
      'get_neighborhood_members_simple',
      { neighborhood_uuid: neighborhoodId }
    );
    
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("[NeighborhoodFetchUtils] Error fetching neighborhood members:", err);
    return [];
  }
}

/**
 * Get user's neighborhoods using the new simplified RPC function
 * 
 * @param userId - The ID of the user
 * @returns Promise resolving to the user's neighborhoods
 */
export async function fetchUserNeighborhoods(userId: string): Promise<Neighborhood[]> {
  try {
    // Use our new simple neighborhood function from the migration
    const { data, error } = await supabase.rpc(
      'get_user_neighborhoods_simple',
      { user_uuid: userId }
    );
    
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("[NeighborhoodFetchUtils] Error fetching user neighborhoods:", err);
    return [];
  }
}
