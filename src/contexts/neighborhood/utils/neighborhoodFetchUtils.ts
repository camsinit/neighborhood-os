
/**
 * Utility functions for fetching neighborhood data
 * 
 * These functions handle retrieving neighborhood information using
 * security definer functions to avoid RLS recursion
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

    // First try using the get_user_created_neighborhoods function
    try {
      // Use a type assertion for the entire response instead of the method name
      // This avoids the TypeScript error while still allowing the function to be called
      const response = await supabase.rpc(
        'get_user_created_neighborhoods',
        { user_uuid: userId }
      );
      
      // TypeScript doesn't know about the response structure, so we'll cast it
      const { data: neighborhoods, error: rpcError } = response as unknown as { 
        data: Neighborhood[] | null; 
        error: any;
      };
      
      if (!rpcError) {
        return { data: neighborhoods, error: null };
      }
    } catch (rpcErr) {
      console.warn("[NeighborhoodUtils] RPC get_user_created_neighborhoods failed, falling back to direct query:", rpcErr);
    }

    // Otherwise, use a more direct query approach to avoid RLS recursion
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

    // First, try to use the get_all_neighborhoods_safe RPC function
    try {
      const response = await supabase.rpc('get_all_neighborhoods_safe');
      
      // Use type assertion on the response
      const { data: allNeighborhoodsData, error: allNeighborhoodsError } = 
        response as unknown as { data: Neighborhood[] | null; error: any };
      
      if (!allNeighborhoodsError && allNeighborhoodsData) {
        return allNeighborhoodsData;
      }
    } catch (rpcErr) {
      console.warn("[NeighborhoodUtils] RPC function get_all_neighborhoods_safe failed, falling back:", rpcErr);
    }

    // Fall back to getting current user
    // Get the current user ID first to avoid the Promise<string> error
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id || '';
    
    // Try the core contributor function with the user ID
    if (userId) {
      try {
        const response = await supabase.rpc('get_all_neighborhoods_for_core_contributor', {
          user_uuid: userId // Now passing a string, not a Promise
        });
        
        // Use type assertion on the response
        const { data: allNeighborhoodsData, error: allNeighborhoodsError } = 
          response as unknown as { data: Neighborhood[] | null; error: any };
        
        if (!allNeighborhoodsError && allNeighborhoodsData) {
          return allNeighborhoodsData;
        }
      } catch (rpcErr) {
        console.warn("[NeighborhoodUtils] Core contributor RPC failed:", rpcErr);
      }
    }

    // Final fallback to direct query
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
 * Uses the security definer function to avoid RLS recursion
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
    
    // If no created neighborhoods, try to get neighborhoods via the RPC function
    try {
      const response = await supabase.rpc('get_user_neighborhoods', { 
        user_uuid: userId 
      });
      
      // Use type assertion on the response
      const { data: userNeighborhoods, error: userNeighborhoodsError } = 
        response as unknown as { data: Neighborhood[] | null; error: any };
      
      if (!userNeighborhoodsError && userNeighborhoods) {
        return userNeighborhoods;
      }
    } catch (rpcErr) {
      console.warn("[NeighborhoodUtils] RPC function get_user_neighborhoods failed, falling back to direct query:", rpcErr);
    }
    
    // As a last resort, try direct query to neighborhood_members
    try {
      console.log("[NeighborhoodUtils] Falling back to direct query for user neighborhoods");
      
      // First try to get memberships
      const response = await supabase.rpc(
        'get_user_neighborhood_memberships',
        { user_uuid: userId }
      );
    
      // Use type assertion on the response
      const { data: memberships, error: membershipError } = response as unknown as {
        data: { neighborhood_id: string }[] | null;
        error: any;
      };
    
      if (membershipError) {
        console.error("[NeighborhoodUtils] Error fetching user memberships via RPC:", membershipError);
        
        // If RPC fails, try direct query
        const { data: directMemberships, error: directMembershipError } = await supabase
          .from('neighborhood_members')
          .select('neighborhood_id')
          .eq('user_id', userId)
          .eq('status', 'active');
          
        if (directMembershipError) {
          console.error("[NeighborhoodUtils] Error fetching user memberships:", directMembershipError);
          return [];
        }
        
        if (!directMemberships || directMemberships.length === 0) {
          return [];
        }
        
        // Get the neighborhood details for each membership
        const neighborhoodIds = directMemberships.map(m => m.neighborhood_id);
        
        const { data: neighborhoods, error: neighborhoodsError } = await supabase
          .from('neighborhoods')
          .select('id, name')
          .in('id', neighborhoodIds);
          
        if (neighborhoodsError) {
          console.error("[NeighborhoodUtils] Error fetching neighborhood details:", neighborhoodsError);
          return [];
        }
        
        return neighborhoods as Neighborhood[];
      }
      
      if (!memberships || memberships.length === 0) {
        return [];
      }
      
      // Get the neighborhood details for each membership from RPC
      const neighborhoodIds = memberships.map(m => m.neighborhood_id);
      
      const { data: neighborhoods, error: neighborhoodsError } = await supabase
        .from('neighborhoods')
        .select('id, name')
        .in('id', neighborhoodIds);
        
      if (neighborhoodsError) {
        console.error("[NeighborhoodUtils] Error fetching neighborhood details:", neighborhoodsError);
        return [];
      }
      
      return neighborhoods as Neighborhood[];
    } catch (err) {
      console.error("[NeighborhoodUtils] Error in direct membership query:", err);
      return [];
    }
  } catch (err) {
    console.error("[NeighborhoodUtils] Error in fetchUserNeighborhoods:", err);
    return [];
  }
}

/**
 * Fetch neighborhood members using direct query to avoid RLS recursion
 * 
 * @param neighborhoodId - The ID of the neighborhood to get members for
 * @returns Promise that resolves to an array of user IDs
 */
export async function fetchNeighborhoodMembers(neighborhoodId: string): Promise<string[]> {
  try {
    // Validate supabase client
    if (!supabase) {
      console.error("[NeighborhoodUtils] Supabase client is not available");
      return [];
    }
    
    // First try using the get_neighborhood_members_safe RPC function
    try {
      const response = await supabase.rpc('get_neighborhood_members_safe', {
        neighborhood_uuid: neighborhoodId
      });
      
      // Use type assertion on the response
      const { data: memberIds, error: membersError } = 
        response as unknown as { data: string[] | null; error: any };
      
      if (!membersError && memberIds) {
        return Array.isArray(memberIds) ? memberIds : [];
      }
    } catch (rpcErr) {
      console.warn("[NeighborhoodUtils] RPC function get_neighborhood_members_safe failed, falling back to direct query:", rpcErr);
    }
    
    // Fall back to direct query
    const { data, error } = await supabase
      .from('neighborhood_members')
      .select('user_id')
      .eq('neighborhood_id', neighborhoodId)
      .eq('status', 'active');
    
    if (error) {
      console.error("[NeighborhoodUtils] Error fetching neighborhood members:", error);
      return [];
    }
    
    return data.map(member => member.user_id);
  } catch (err) {
    console.error("[NeighborhoodUtils] Error in fetchNeighborhoodMembers:", err);
    return [];
  }
}
