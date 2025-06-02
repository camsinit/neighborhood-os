
/**
 * Neighborhood fetching utilities
 * 
 * UPDATED: Now works with the new security definer functions and fixed RLS policies
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
 * Uses the new security definer function to get user-accessible neighborhoods
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

    // Use the new security definer function
    const { data: accessibleNeighborhoods, error } = await supabase
      .rpc("get_user_accessible_neighborhoods", { user_uuid: user.id });
    
    if (error) {
      console.error("[fetchAccessibleNeighborhoods] Error:", error.message);
      return [];
    }
    
    if (!accessibleNeighborhoods || accessibleNeighborhoods.length === 0) {
      console.log("[fetchAccessibleNeighborhoods] No accessible neighborhoods found");
      return [];
    }

    // Extract neighborhood IDs and get full details
    const neighborhoodIds = accessibleNeighborhoods.map(n => n.neighborhood_id);
    
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
 * Fetch members of a specific neighborhood using the new security definer function
 * 
 * @param neighborhoodId - The ID of the neighborhood to get members for
 * @returns Array of user IDs who are members of the neighborhood
 */
export const fetchNeighborhoodMembers = async (neighborhoodId: string): Promise<string[]> => {
  try {
    // Use the new security definer function
    const { data, error } = await supabase
      .rpc("get_neighborhood_members_direct", { neighborhood_uuid: neighborhoodId });
    
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
 * Check if a user has access to a specific neighborhood using new security function
 * 
 * @param userId - The ID of the user to check
 * @param neighborhoodId - The ID of the neighborhood 
 * @returns True if the user has access, false otherwise
 */
export const checkNeighborhoodAccess = async (userId: string, neighborhoodId: string): Promise<boolean> => {
  try {
    const { data: hasAccess, error } = await supabase
      .rpc('check_neighborhood_access', {
        user_uuid: userId,
        neighborhood_uuid: neighborhoodId
      });
    
    if (error) {
      console.error("[checkNeighborhoodAccess] Error:", error.message);
      return false;
    }
    
    return !!hasAccess;
  } catch (error) {
    console.error("[checkNeighborhoodAccess] Error:", error);
    return false;
  }
};
