
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

    // This query is safe with our updated RLS policies - filtering by created_by is not subject to recursion
    const { data, error } = await supabase
      .from('neighborhoods')
      .select('id, name, created_by')
      .eq('created_by', userId)
      .order('created_at', { ascending: false })
      .limit(1);
          
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
    
    // With our fixed RLS policies, core contributors and neighborhood creators can access this
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

    // Try direct query first - this is where we typically see recursion
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
 * SIMPLIFIED approach - try to get user's neighborhoods directly
 * This avoids the neighbor check loop
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

    console.log("[NeighborhoodUtils] Trying simpler approach: direct fetch of user neighborhoods", { userId });
    
    // Try the RPF function first if it exists
    if (supabase.rpc) {
      try {
        const { data, error } = await supabase.rpc('get_user_neighborhoods', {
          user_uuid: userId
        });
        
        if (!error && data) {
          console.log("[NeighborhoodUtils] Successfully got neighborhoods using RPC function", {
            count: data.length,
            neighborhoods: data
          });
          return data;
        } else if (error) {
          console.error("[NeighborhoodUtils] RPC error:", error);
        }
      } catch (rpcError) {
        console.error("[NeighborhoodUtils] RPC call failed:", rpcError);
      }
    }

    // Direct query as fallback - JOIN approach
    console.log("[NeighborhoodUtils] Trying JOIN approach");
    try {
      const { data: joinData, error: joinError } = await supabase
        .from('neighborhoods')
        .select(`
          id, 
          name, 
          created_by
        `)
        .eq('created_by', userId);
      
      // Also try to get neighborhoods where user is a member
      // This is a separate query to avoid recursion in the JOIN
      const { data: memberData, error: memberError } = await supabase
        .from('neighborhood_members')
        .select(`
          neighborhood_id
        `)
        .eq('user_id', userId)
        .eq('status', 'active');
        
      if (joinError) {
        console.error("[NeighborhoodUtils] JOIN query error:", joinError);
      }
      
      if (memberError) {
        console.error("[NeighborhoodUtils] Member query error:", memberError);
      }
      
      // Combine results from both queries
      const createdNeighborhoods = joinData || [];
      
      // Get full neighborhood details for memberships
      let memberNeighborhoods: Neighborhood[] = [];
      if (memberData && memberData.length > 0) {
        const neighborhoodIds = memberData.map(m => m.neighborhood_id);
        
        const { data: neighborhoods, error: nhError } = await supabase
          .from('neighborhoods')
          .select('id, name, created_by')
          .in('id', neighborhoodIds);
          
        if (neighborhoods) {
          memberNeighborhoods = neighborhoods;
        }
        
        if (nhError) {
          console.error("[NeighborhoodUtils] Error fetching member neighborhoods:", nhError);
        }
      }
      
      // Combine the results, ensuring no duplicates
      const allNeighborhoods = [...createdNeighborhoods];
      memberNeighborhoods.forEach(nh => {
        if (!allNeighborhoods.some(existing => existing.id === nh.id)) {
          allNeighborhoods.push(nh);
        }
      });
      
      console.log("[NeighborhoodUtils] Combined neighborhood results:", {
        created: createdNeighborhoods.length,
        member: memberNeighborhoods.length,
        total: allNeighborhoods.length
      });
      
      return allNeighborhoods;
    } catch (joinQueryError) {
      console.error("[NeighborhoodUtils] JOIN query execution error:", joinQueryError);
    }
    
    // If all else fails, return empty array
    return [];
  } catch (err) {
    console.error("[NeighborhoodUtils] Error in getUserNeighborhoods:", err);
    return [];
  }
}

/**
 * Utility function to check if a user is a core contributor with access to all neighborhoods
 * 
 * @param userId - The ID of the user to check
 * @returns Promise that resolves to true if the user is a core contributor with access, false otherwise
 */
export async function checkCoreContributorAccess(userId: string): Promise<boolean> {
  try {
    // Validate supabase client
    if (!supabase || !supabase.rpc) {
      console.error("[NeighborhoodUtils] Supabase client or RPC method is not available");
      return false;
    }

    console.log("[NeighborhoodUtils] Checking core contributor access", { userId });
    
    // Use our security definer function to check if the user is a core contributor with access
    const { data: hasAccess, error } = await supabase
      .rpc('user_is_core_contributor_with_access', {
        user_uuid: userId
      }) as { data: boolean | null, error: any };
      
    if (error) {
      console.error("[NeighborhoodUtils] Error checking core contributor access:", error);
      return false;
    }
    
    console.log("[NeighborhoodUtils] Core contributor check result:", { 
      isContributor: !!hasAccess,
      userId
    });
      
    return !!hasAccess;
  } catch (err) {
    console.error("[NeighborhoodUtils] Error in checkCoreContributorAccess:", err);
    return false;
  }
}

/**
 * Utility function to fetch all neighborhoods for a core contributor
 * This is only accessible to users with core contributor access
 * 
 * @param userId - The ID of the core contributor
 * @returns Promise that resolves to an array of all neighborhoods if the user has access
 */
export async function fetchAllNeighborhoodsForCoreContributor(userId: string): Promise<Neighborhood[]> {
  try {
    // Validate supabase client
    if (!supabase || !supabase.rpc) {
      console.error("[NeighborhoodUtils] Supabase client or RPC method is not available");
      return [];
    }

    console.log("[NeighborhoodUtils] Fetching neighborhoods for core contributor", { userId });
    
    // Use our security definer function to get all neighborhoods for a core contributor
    const { data, error } = await supabase
      .rpc('get_all_neighborhoods_for_core_contributor', {
        user_uuid: userId
      }) as { data: Neighborhood[] | null, error: any };
      
    if (error) {
      console.error("[NeighborhoodUtils] Error fetching neighborhoods for core contributor:", error);
      return [];
    }
    
    console.log("[NeighborhoodUtils] Core contributor neighborhoods result:", { 
      count: data?.length,
      userId
    });
      
    return data || [];
  } catch (err) {
    console.error("[NeighborhoodUtils] Error in fetchAllNeighborhoodsForCoreContributor:", err);
    return [];
  }
}
