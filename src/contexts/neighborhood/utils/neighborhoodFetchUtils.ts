
/**
 * Neighborhood fetching utilities
 * 
 * UPDATED: Now works with simplified RLS policies and the new get_user_neighborhood_ids function
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
    
    // Direct query with new RLS policies handling access
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
 * Fetch all neighborhoods accessible to the current user
 * 
 * Uses the new simplified approach with direct table queries
 * 
 * @returns Array of neighborhoods accessible to the user
 */
export const fetchAccessibleNeighborhoods = async (): Promise<Neighborhood[]> => {
  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error("[fetchAccessibleNeighborhoods] Auth error:", authError);
      return [];
    }

    // Use the simplified helper function to get neighborhood IDs
    const { data: neighborhoodIds, error } = await supabase
      .rpc("get_user_neighborhood_ids", { user_uuid: user.id });
    
    if (error) {
      console.error("[fetchAccessibleNeighborhoods] Error:", error.message);
      return [];
    }
    
    if (!neighborhoodIds || neighborhoodIds.length === 0) {
      console.log("[fetchAccessibleNeighborhoods] No accessible neighborhoods found");
      return [];
    }

    // Get full details for accessible neighborhoods
    const { data: neighborhoodDetails, error: detailsError } = await supabase
      .from('neighborhoods')
      .select('id, name, created_by')
      .in('id', neighborhoodIds);

    if (detailsError) {
      console.error("[fetchAccessibleNeighborhoods] Error getting details:", detailsError);
      return [];
    }
    
    console.log(`[fetchAccessibleNeighborhoods] Found ${neighborhoodDetails?.length || 0} accessible neighborhoods`);
    
    return neighborhoodDetails as Neighborhood[];
  } catch (error) {
    console.error("[fetchAccessibleNeighborhoods] Unexpected error:", error);
    return [];
  }
};

/**
 * Fetch members of a specific neighborhood using direct table query
 * 
 * @param neighborhoodId - The ID of the neighborhood to get members for
 * @returns Array of user IDs who are members of the neighborhood
 */
export const fetchNeighborhoodMembers = async (neighborhoodId: string): Promise<string[]> => {
  try {
    // Direct query to neighborhood_members table - RLS will handle access control
    const { data, error } = await supabase
      .from("neighborhood_members")
      .select("user_id")
      .eq("neighborhood_id", neighborhoodId)
      .eq("status", "active");
    
    if (error) {
      console.error("[fetchNeighborhoodMembers] Error:", error.message);
      return [];
    }
    
    const userIds = data?.map(member => member.user_id) || [];
    console.log(`[fetchNeighborhoodMembers] Found ${userIds.length} members for neighborhood ${neighborhoodId}`);
    
    return userIds;
  } catch (error) {
    console.error("[fetchNeighborhoodMembers] Unexpected error:", error);
    return [];
  }
};

/**
 * Check if a user has access to a specific neighborhood using direct table queries
 * 
 * @param userId - The ID of the user to check
 * @param neighborhoodId - The ID of the neighborhood 
 * @returns True if the user has access, false otherwise
 */
export const checkNeighborhoodAccess = async (userId: string, neighborhoodId: string): Promise<boolean> => {
  try {
    // Check if user is a member
    const { data: memberData, error: memberError } = await supabase
      .from('neighborhood_members')
      .select('id')
      .eq('user_id', userId)
      .eq('neighborhood_id', neighborhoodId)
      .eq('status', 'active')
      .limit(1);
    
    if (memberError) {
      console.error("[checkNeighborhoodAccess] Member check error:", memberError.message);
      return false;
    }
    
    if (memberData && memberData.length > 0) {
      return true;
    }
    
    // Check if user created the neighborhood
    const { data: creatorData, error: creatorError } = await supabase
      .from('neighborhoods')
      .select('id')
      .eq('id', neighborhoodId)
      .eq('created_by', userId)
      .limit(1);
    
    if (creatorError) {
      console.error("[checkNeighborhoodAccess] Creator check error:", creatorError.message);
      return false;
    }
    
    return creatorData && creatorData.length > 0;
  } catch (error) {
    console.error("[checkNeighborhoodAccess] Error:", error);
    return false;
  }
};
