
/**
 * Utility functions for fetching neighborhood data
 * 
 * These functions handle retrieving neighborhood information
 */

import { supabase } from '@/integrations/supabase/client';
import { Neighborhood } from '../types';

/**
 * Utility function to check if a user has created any neighborhoods
 * This approach avoids the RLS recursion by using a direct query pattern
 * 
 * @param userId - The ID of the user to check
 * @returns Promise that resolves to an array of neighborhoods created by the user
 */
export async function fetchCreatedNeighborhoods(userId: string): Promise<{ data: Neighborhood[] | null, error: any }> {
  try {
    // Validate supabase client
    if (!supabase) {
      console.error("[NeighborhoodUtils] Supabase client is not available");
      return { data: null, error: new Error("Supabase client is not available") };
    }

    // Instead of RPC function that may not exist, use a direct query
    const { data, error } = await supabase
      .from('neighborhoods')
      .select('id, name')
      .eq('created_by', userId)
      .order('created_at', { ascending: false });
          
    if (error) {
      console.error("[NeighborhoodUtils] Error checking created neighborhoods:", error);
      return { data: null, error };
    }
    
    return { data: data as Neighborhood[], error: null };
  } catch (err) {
    console.error("[NeighborhoodUtils] Error in fetchCreatedNeighborhoods:", err);
    return { data: null, error: err };
  }
}

/**
 * Utility function to fetch all neighborhoods in the system
 * 
 * @returns Promise that resolves to an array of all neighborhoods
 */
export async function fetchAllNeighborhoods(): Promise<Neighborhood[]> {
  try {
    // Validate supabase client
    if (!supabase) {
      console.error("[NeighborhoodUtils] Supabase client is not available");
      return [];
    }

    // Use a direct query instead of RPC
    const { data, error } = await supabase
      .from('neighborhoods')
      .select('id, name')
      .order('name');
    
    if (error) {
      console.error("[NeighborhoodUtils] Error fetching all neighborhoods:", error);
      return [];
    }
    
    return data as Neighborhood[];
  } catch (err) {
    console.error("[NeighborhoodUtils] Error in fetchAllNeighborhoods:", err);
    return [];
  }
}

/**
 * Utility function to get a user's neighborhood memberships
 * 
 * @param userId - The ID of the user to check
 * @returns Promise that resolves to an array of neighborhoods the user is a member of
 */
export async function fetchUserNeighborhoods(userId: string): Promise<Neighborhood[]> {
  try {
    // Validate supabase client
    if (!supabase) {
      console.error("[NeighborhoodUtils] Supabase client is not available");
      return [];
    }

    // First try to get neighborhoods created by the user
    const { data: createdNeighborhoods, error: createdError } = await fetchCreatedNeighborhoods(userId);
    if (createdNeighborhoods && createdNeighborhoods.length > 0) {
      return createdNeighborhoods;
    }

    // If no created neighborhoods, get neighborhoods the user is a member of
    const { data, error } = await supabase
      .from('neighborhood_members')
      .select(`
        neighborhood_id,
        neighborhoods:neighborhood_id (id, name)
      `)
      .eq('user_id', userId)
      .eq('status', 'active');

    if (error) {
      console.error("[NeighborhoodUtils] Error fetching user neighborhoods:", error);
      return [];
    }

    // Transform the data to match the Neighborhood interface
    return data.map((item: any) => ({
      id: item.neighborhoods.id,
      name: item.neighborhoods.name,
      joined_at: new Date().toISOString() // Default since we don't have this from the query
    }));
  } catch (err) {
    console.error("[NeighborhoodUtils] Error in fetchUserNeighborhoods:", err);
    return [];
  }
}
