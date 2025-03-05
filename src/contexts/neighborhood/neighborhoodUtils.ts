
/**
 * Utility functions for neighborhood data
 * 
 * These functions handle API calls to Supabase for neighborhood-related operations
 * that avoid RLS recursion issues
 */

import { supabase } from '@/integrations/supabase/client';
import { Neighborhood } from './types';

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

    // Log that we're making this request
    console.log("[NeighborhoodUtils] Checking if user created neighborhoods", { userId });

    // Use direct query to neighborhoods - this avoids the recursion issues with policies
    // since we're filtering by created_by which is indexed and simpler to query
    const { data, error } = await supabase
      .from('neighborhoods')
      .select('id, name, created_by')
      .eq('created_by', userId)
      .order('created_at', { ascending: false });
          
    if (error) {
      console.error("[NeighborhoodUtils] Error checking created neighborhoods:", error);
      return { data: null, error };
    }
    
    console.log("[NeighborhoodUtils] Created neighborhoods result:", { 
      found: data && data.length > 0, 
      count: data?.length,
      neighborhoods: data 
    });
    
    return { data, error: null };
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

    console.log("[NeighborhoodUtils] Fetching all neighborhoods");
    
    // With our fixed RLS policies, neighborhood creators can access this
    const { data, error } = await supabase
      .from('neighborhoods')
      .select('id, name, created_by');
    
    if (error) {
      console.error("[NeighborhoodUtils] Error fetching all neighborhoods:", error);
      return [];
    }
    
    console.log("[NeighborhoodUtils] All neighborhoods result:", { 
      count: data?.length,
      error: error 
    });
    
    return data || [];
  } catch (err) {
    console.error("[NeighborhoodUtils] Error in fetchAllNeighborhoods:", err);
    return [];
  }
}

/**
 * Utility function to check if a user is a member of a specific neighborhood
 * Uses direct API call to avoid RLS recursion
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
    if (!supabase || !supabase.rpc) {
      console.error("[NeighborhoodUtils] Supabase client or RPC method is not available");
      return false;
    }

    console.log("[NeighborhoodUtils] Checking neighborhood membership with direct query", { 
      userId,
      neighborhoodId
    });

    // Try direct query first - using auth.uid() should avoid recursion issues
    const { data: membershipData, error: membershipError } = await supabase
      .from('neighborhood_members')
      .select('id')
      .eq('user_id', userId)
      .eq('neighborhood_id', neighborhoodId)
      .eq('status', 'active')
      .single();
      
    // Log the result or error
    if (membershipError) {
      console.error(`[NeighborhoodUtils] Error checking membership with direct query:`, {
        error: membershipError,
        message: membershipError.message,
        hint: membershipError.hint,
        details: membershipError.details,
        code: membershipError.code
      });
    } else {
      console.log(`[NeighborhoodUtils] Direct membership query successful:`, {
        isMember: !!membershipData
      });
      return !!membershipData;
    }
    
    // Fall back to RPC if available (which should avoid recursion)
    console.log("[NeighborhoodUtils] Falling back to RPC method");
    const { data: isMember, error } = await supabase
      .rpc('user_is_neighborhood_member', {
        user_uuid: userId,
        neighborhood_uuid: neighborhoodId
      }) as { data: boolean | null, error: any };
            
    if (error) {
      console.error(`[NeighborhoodUtils] Error checking membership with RPC for ${neighborhoodId}:`, error);
      return false;
    }
    
    console.log(`[NeighborhoodUtils] Membership check result:`, {
      isMember: !!isMember,
      userId,
      neighborhoodId
    });
            
    return !!isMember;
  } catch (err) {
    console.error("[NeighborhoodUtils] Error in checkNeighborhoodMembership:", err);
    return false;
  }
}

/**
 * SIMPLIFIED approach - try to get user's neighborhoods directly using our new RPC function
 * This avoids the neighbor check loop and recursion issues
 * 
 * @param userId - The ID of the user to check
 * @returns Promise that resolves to array of neighborhoods
 */
export async function getUserNeighborhoods(userId: string): Promise<Neighborhood[]> {
  try {
    // Validate supabase client
    if (!supabase) {
      console.error("[NeighborhoodUtils] Supabase client is not available");
      return [];
    }

    console.log("[NeighborhoodUtils] Using get_user_neighborhoods RPC function", { userId });
    
    // Try the RPC function that we just created in our SQL migration
    if (supabase.rpc) {
      try {
        const { data, error } = await supabase.rpc('get_user_neighborhoods', {
          user_uuid: userId
        });
        
        if (!error && data) {
          console.log("[NeighborhoodUtils] Successfully got neighborhoods using get_user_neighborhoods RPC function", {
            count: data.length,
            neighborhoods: data
          });
          // The RPC function returns the proper data structure, so we can directly cast to Neighborhood[]
          return data as Neighborhood[];
        } else if (error) {
          console.error("[NeighborhoodUtils] RPC error:", error);
        }
      } catch (rpcError) {
        console.error("[NeighborhoodUtils] RPC call failed:", rpcError);
      }
    }

    // Fall back to direct query if RPC fails
    console.log("[NeighborhoodUtils] RPC function failed, falling back to direct queries");
    
    // Try to get neighborhoods user created
    try {
      const { data: createdData, error: createdError } = await supabase
        .from('neighborhoods')
        .select('id, name, created_by')
        .eq('created_by', userId);
      
      if (createdError) {
        console.error("[NeighborhoodUtils] Error fetching created neighborhoods:", createdError);
      } else if (createdData && createdData.length > 0) {
        console.log("[NeighborhoodUtils] Found neighborhoods created by user:", {
          count: createdData.length
        });
        return createdData as Neighborhood[];
      }
      
      // Try to get memberships directly
      const { data: membershipData, error: membershipError } = await supabase
        .from('neighborhood_members')
        .select('neighborhood_id')
        .eq('user_id', userId)
        .eq('status', 'active');
      
      if (membershipError) {
        console.error("[NeighborhoodUtils] Error fetching memberships:", membershipError);
        return [];
      }
      
      if (!membershipData || membershipData.length === 0) {
        console.log("[NeighborhoodUtils] No neighborhood memberships found");
        return [];
      }
      
      // Get neighborhood details for the memberships
      const neighborhoodIds = membershipData.map(m => m.neighborhood_id);
      const { data: neighborhoods, error: nhError } = await supabase
        .from('neighborhoods')
        .select('id, name, created_by')
        .in('id', neighborhoodIds);
      
      if (nhError) {
        console.error("[NeighborhoodUtils] Error fetching member neighborhoods:", nhError);
        return [];
      }
      
      if (neighborhoods) {
        console.log("[NeighborhoodUtils] Found membership neighborhoods:", {
          count: neighborhoods.length
        });
        // Use type assertion since we know the structure matches
        return neighborhoods as Neighborhood[];
      }
    } catch (directQueryError) {
      console.error("[NeighborhoodUtils] Direct query execution error:", directQueryError);
    }
    
    // If all else fails, return empty array
    return [];
  } catch (err) {
    console.error("[NeighborhoodUtils] Error in getUserNeighborhoods:", err);
    return [];
  }
}
