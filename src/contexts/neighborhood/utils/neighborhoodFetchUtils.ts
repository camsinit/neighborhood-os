
/**
 * Neighborhood fetching utilities
 * 
 * These utilities use our new security definer functions to avoid recursion.
 */
import { supabase } from "@/integrations/supabase/client";
import { Neighborhood } from "../types";

/**
 * Fetch neighborhoods created by a specific user
 * 
 * @param userId - The ID of the user
 * @returns The neighborhoods created by the user
 */
export const fetchCreatedNeighborhoods = async (userId: string): Promise<{
  data: Neighborhood[] | null;
  error: Error | null;
}> => {
  try {
    console.log(`[fetchCreatedNeighborhoods] Fetching neighborhoods created by user ${userId}`);
    
    // Direct query to neighborhoods table - should be protected by RLS
    const { data, error } = await supabase
      .from("neighborhoods")
      .select("id, name, created_by")
      .eq("created_by", userId);
    
    if (error) {
      console.error("[fetchCreatedNeighborhoods] Error:", error.message);
      return { data: null, error };
    }
    
    console.log(`[fetchCreatedNeighborhoods] Found ${data?.length || 0} neighborhoods created by user ${userId}`);
    
    return { 
      data: data as Neighborhood[],
      error: null 
    };
  } catch (error: any) {
    console.error("[fetchCreatedNeighborhoods] Unexpected error:", error);
    return { 
      data: null, 
      error: new Error(error.message || "Unknown error in fetchCreatedNeighborhoods") 
    };
  }
};

/**
 * Fetch all neighborhoods (for authorized users)
 * 
 * @returns Promise with array of all neighborhoods the user can access
 */
export const fetchAllNeighborhoods = async (): Promise<Neighborhood[]> => {
  try {
    console.log("[fetchAllNeighborhoods] Fetching all accessible neighborhoods");
    
    // Use the get_user_neighborhoods_simple RPC function added in the migrations
    const { data, error } = await supabase
      .rpc('get_user_neighborhoods_simple', {
        user_uuid: supabase.auth.getUser().then(res => res.data.user?.id)
      });
    
    if (error) {
      console.error("[fetchAllNeighborhoods] Error:", error.message);
      return [];
    }
    
    console.log(`[fetchAllNeighborhoods] Found ${data?.length || 0} accessible neighborhoods`);
    return data as Neighborhood[] || [];
  } catch (error: any) {
    console.error("[fetchAllNeighborhoods] Unexpected error:", error);
    return [];
  }
};

/**
 * Fetch user memberships for a specific user
 * 
 * @param userId - The ID of the user
 * @returns Neighborhood memberships
 */
export const fetchUserMemberships = async (userId: string): Promise<{
  data: { neighborhood_id: string }[] | null;
  error: Error | null;
}> => {
  try {
    console.log(`[fetchUserMemberships] Fetching memberships for user ${userId}`);
    
    // Use our simplified RPC function if available
    try {
      const { data, error } = await supabase
        .rpc('get_user_neighborhood_memberships', { 
          user_uuid: userId 
        });
        
      if (!error && data) {
        console.log(`[fetchUserMemberships] Found ${data.length} memberships via RPC`);
        return { data, error: null };
      }
    } catch (rpcErr) {
      console.warn("[fetchUserMemberships] RPC error, falling back to direct query:", rpcErr);
    }
    
    // Fall back to direct query
    const { data, error } = await supabase
      .from('neighborhood_members')
      .select('neighborhood_id')
      .eq('user_id', userId)
      .eq('status', 'active');
      
    if (error) {
      console.error("[fetchUserMemberships] Error:", error.message);
      return { data: null, error };
    }
    
    console.log(`[fetchUserMemberships] Found ${data?.length || 0} memberships for user ${userId}`);
    
    return { data, error: null };
  } catch (error: any) {
    console.error("[fetchUserMemberships] Unexpected error:", error);
    return { 
      data: null, 
      error: new Error(error.message || "Unknown error in fetchUserMemberships") 
    };
  }
};

/**
 * Check if a user is a core contributor with access to all neighborhoods
 * 
 * @param userId - The ID of the user to check
 * @returns True if the user is a core contributor with access, false otherwise
 */
export const checkCoreContributorAccess = async (userId: string): Promise<boolean> => {
  try {
    // Use our security definer function
    const { data, error } = await supabase
      .rpc("user_is_core_contributor_with_access", { user_uuid: userId });
    
    if (error) {
      console.error("[checkCoreContributorAccess] Error:", error.message);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error("[checkCoreContributorAccess] Error:", error);
    return false;
  }
};

/**
 * Fetch all neighborhoods for a core contributor
 * 
 * @param userId - The ID of the core contributor
 * @returns Array of all neighborhoods if the user is a core contributor, empty array otherwise
 */
export const fetchAllNeighborhoodsForCoreContributor = async (userId: string): Promise<Neighborhood[]> => {
  try {
    // Use our security definer function
    const { data, error } = await supabase
      .rpc("get_all_neighborhoods_for_core_contributor", { user_uuid: userId });
    
    if (error) {
      console.error("[fetchAllNeighborhoodsForCoreContributor] Error:", error.message);
      return [];
    }
    
    return data as Neighborhood[] || [];
  } catch (error) {
    console.error("[fetchAllNeighborhoodsForCoreContributor] Error:", error);
    return [];
  }
};
