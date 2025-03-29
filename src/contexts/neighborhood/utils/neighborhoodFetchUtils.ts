
/**
 * Neighborhood fetching utilities
 * 
 * These utilities have been simplified to work without Row Level Security (RLS)
 * and core contributor functionality.
 */
import { supabase } from "@/integrations/supabase/client";
import { Neighborhood } from "../types";

/**
 * Fetch a specific neighborhood by ID
 * 
 * @param neighborhoodId The ID of the neighborhood to fetch
 * @returns The neighborhood data or null if not found
 */
export const fetchNeighborhoodById = async (neighborhoodId: string): Promise<Neighborhood | null> => {
  try {
    console.log("[fetchNeighborhoodById] Fetching neighborhood:", neighborhoodId);
    
    // Simple direct query now that RLS is disabled
    const { data, error } = await supabase
      .from("neighborhoods")
      .select("*")
      .eq("id", neighborhoodId)
      .single();
    
    if (error) {
      console.error("[fetchNeighborhoodById] Error:", error.message);
      return null;
    }
    
    if (!data) {
      console.log("[fetchNeighborhoodById] No neighborhood found with ID:", neighborhoodId);
      return null;
    }
    
    console.log("[fetchNeighborhoodById] Success, found neighborhood:", data.name);
    
    return {
      id: data.id,
      name: data.name,
      created_by: data.created_by
    };
  } catch (error) {
    console.error("[fetchNeighborhoodById] Unexpected error:", error);
    return null;
  }
};

/**
 * Fetch neighborhood members
 * 
 * @param neighborhoodId The ID of the neighborhood to fetch members for
 * @returns Array of member user IDs
 */
export const fetchNeighborhoodMembers = async (neighborhoodId: string): Promise<string[]> => {
  try {
    console.log("[fetchNeighborhoodMembers] Fetching members for:", neighborhoodId);
    
    // Direct query since RLS is disabled
    const { data, error } = await supabase
      .from("neighborhood_members")
      .select("user_id")
      .eq("neighborhood_id", neighborhoodId)
      .eq("status", "active");
    
    if (error) {
      console.error("[fetchNeighborhoodMembers] Error:", error.message);
      return [];
    }
    
    const memberIds = data.map(item => item.user_id);
    console.log(`[fetchNeighborhoodMembers] Found ${memberIds.length} members`);
    
    return memberIds;
  } catch (error) {
    console.error("[fetchNeighborhoodMembers] Unexpected error:", error);
    return [];
  }
};

/**
 * Check if a user is a member of a neighborhood
 * 
 * @param userId The user ID to check
 * @param neighborhoodId The neighborhood ID to check
 * @returns Boolean indicating if the user is a member
 */
export const isUserMemberOfNeighborhood = async (userId: string, neighborhoodId: string): Promise<boolean> => {
  if (!userId || !neighborhoodId) return false;
  
  try {
    // Check if user is the creator
    const { data: neighborhood, error: neighborhoodError } = await supabase
      .from("neighborhoods")
      .select("created_by")
      .eq("id", neighborhoodId)
      .single();
      
    if (neighborhood && neighborhood.created_by === userId) {
      return true;
    }
    
    // Check if user is a member
    const { data, error } = await supabase
      .from("neighborhood_members")
      .select("id")
      .eq("neighborhood_id", neighborhoodId)
      .eq("user_id", userId)
      .eq("status", "active")
      .limit(1);
    
    return data && data.length > 0;
  } catch (error) {
    console.error("[isUserMemberOfNeighborhood] Error:", error);
    return false;
  }
};
