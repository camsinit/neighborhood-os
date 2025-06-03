/**
 * Neighborhood fetching utilities
 * 
 * UPDATED: Now uses direct queries instead of removed security definer functions
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
 * Fetch all neighborhoods accessible to the current user using direct queries
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

    // First, get neighborhoods the user created
    const { data: createdNeighborhoods, error: createdError } = await supabase
      .from('neighborhoods')
      .select('id, name, created_by')
      .eq('created_by', user.id);
    
    if (createdError) {
      console.error("[fetchAccessibleNeighborhoods] Error getting created neighborhoods:", createdError);
      return [];
    }

    // Then, get neighborhoods the user is a member of
    const { data: memberData, error: memberError } = await supabase
      .from('neighborhood_members')
      .select(`
        neighborhood_id,
        neighborhoods:neighborhood_id (
          id,
          name,
          created_by
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (memberError) {
      console.error("[fetchAccessibleNeighborhoods] Error getting member neighborhoods:", memberError);
      return [];
    }

    // Combine created neighborhoods and member neighborhoods
    const allNeighborhoods: Neighborhood[] = [
      ...(createdNeighborhoods || []),
      ...(memberData?.map(member => member.neighborhoods).filter(Boolean) || [])
    ];

    // Remove duplicates based on id
    const uniqueNeighborhoods = allNeighborhoods.filter((neighborhood, index, self) =>
      index === self.findIndex(n => n.id === neighborhood.id)
    );
    
    console.log(`[fetchAccessibleNeighborhoods] Found ${uniqueNeighborhoods.length} accessible neighborhoods`);
    
    return uniqueNeighborhoods as Neighborhood[];
  } catch (error) {
    console.error("[fetchAccessibleNeighborhoods] Unexpected error:", error);
    return [];
  }
};

/**
 * Fetch members of a specific neighborhood using direct query
 * 
 * @param neighborhoodId - The ID of the neighborhood to get members for
 * @returns Array of user IDs who are members of the neighborhood
 */
export const fetchNeighborhoodMembers = async (neighborhoodId: string): Promise<string[]> => {
  try {
    // Use direct query to get neighborhood members
    const { data, error } = await supabase
      .from('neighborhood_members')
      .select('user_id')
      .eq('neighborhood_id', neighborhoodId)
      .eq('status', 'active');
    
    if (error) {
      console.error("[fetchNeighborhoodMembers] Error:", error.message);
      return [];
    }
    
    const memberIds = data?.map(member => member.user_id) || [];
    console.log(`[fetchNeighborhoodMembers] Found ${memberIds.length} members for neighborhood ${neighborhoodId}`);
    
    return memberIds;
  } catch (error) {
    console.error("[fetchNeighborhoodMembers] Unexpected error:", error);
    return [];
  }
};

/**
 * Check if a user has access to a specific neighborhood using security function
 * 
 * @param userId - The ID of the user to check (not used - function uses auth.uid() internally)
 * @param neighborhoodId - The ID of the neighborhood 
 * @returns True if the user has access, false otherwise
 */
export const checkNeighborhoodAccess = async (userId: string, neighborhoodId: string): Promise<boolean> => {
  try {
    // Fixed: Only pass neighborhood_uuid parameter since function uses auth.uid() internally
    const { data: hasAccess, error } = await supabase
      .rpc('check_neighborhood_access', {
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
