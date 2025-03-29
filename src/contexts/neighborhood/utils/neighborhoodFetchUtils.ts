
/**
 * Neighborhood fetching utilities
 * 
 * These utilities have been updated to work with our security definer functions
 * and avoid the infinite recursion issues in RLS policies.
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
    // Try direct query with the user_created_neighborhood function to avoid recursion
    console.log(`[fetchCreatedNeighborhoods] Fetching neighborhoods created by user ${userId}`);
    
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
 * Fetch all neighborhoods (using our security definer function)
 * 
 * Uses the get_all_neighborhoods_safe RPC function to bypass RLS
 * for authorized users.
 * 
 * @returns Array of all neighborhoods
 */
export const fetchAllNeighborhoods = async (): Promise<Neighborhood[]> => {
  try {
    // Use the security definer RPC function
    const { data, error } = await supabase
      .rpc("get_all_neighborhoods_safe");
    
    if (error) {
      console.error("[fetchAllNeighborhoods] Error:", error.message);
      return [];
    }
    
    console.log(`[fetchAllNeighborhoods] Found ${data?.length || 0} neighborhoods`);
    
    return data as Neighborhood[];
  } catch (error) {
    console.error("[fetchAllNeighborhoods] Unexpected error:", error);
    return [];
  }
};

/**
 * Fetch members of a specific neighborhood
 * 
 * Uses our security definer function to avoid recursion
 * 
 * @param neighborhoodId - The ID of the neighborhood to get members for
 * @returns Array of user IDs who are members of the neighborhood
 */
export const fetchNeighborhoodMembers = async (neighborhoodId: string): Promise<string[]> => {
  try {
    // Use our security definer function
    const { data, error } = await supabase
      .rpc("get_neighborhood_members_safe", { neighborhood_uuid: neighborhoodId });
    
    if (error) {
      console.error("[fetchNeighborhoodMembers] Error:", error.message);
      return [];
    }
    
    console.log(`[fetchNeighborhoodMembers] Found ${data?.length || 0} members for neighborhood ${neighborhoodId}`);
    
    return data || [];
  } catch (error) {
    console.error("[fetchNeighborhoodMembers] Unexpected error:", error);
    return [];
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
    // Use a security definer function if available
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
    // Use a dedicated RPC function
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
