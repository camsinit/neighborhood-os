/**
 * Neighborhood fetching utilities
 * 
 * These utilities have been simplified to work without Row Level Security (RLS)
 * and core contributor functionality.
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
    // Simple direct query to get neighborhoods created by user
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
 * Fetch all neighborhoods (simplified version)
 * 
 * This function no longer requires core contributor access
 * and simply returns all neighborhoods in the database.
 * 
 * @returns Array of all neighborhoods
 */
export const fetchAllNeighborhoods = async (): Promise<Neighborhood[]> => {
  try {
    // Now we can just fetch all neighborhoods directly without checking permissions
    const { data, error } = await supabase
      .from("neighborhoods")
      .select("id, name, created_by");
    
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
 * No-op function that always returns false
 * 
 * This is a placeholder for the removed core contributor check functionality
 * 
 * @param userId - The ID of the user to check
 * @returns Always returns false
 */
export const checkCoreContributorAccess = async (userId: string): Promise<boolean> => {
  // This function now always returns false as core contributor functionality has been removed
  console.log("[checkCoreContributorAccess] Core contributor functionality disabled");
  return false;
};

/**
 * No-op function that returns an empty array
 * 
 * This is a placeholder for the removed core contributor neighborhood access
 * 
 * @param userId - The ID of the user
 * @returns Always returns an empty array
 */
export const fetchAllNeighborhoodsForCoreContributor = async (userId: string): Promise<Neighborhood[]> => {
  // This function now always returns an empty array as core contributor functionality has been removed
  console.log("[fetchAllNeighborhoodsForCoreContributor] Core contributor functionality disabled");
  return [];
};

/**
 * Legacy function for compatibility - will create RPC functions if needed
 */
export async function createRequiredRPCFunctions(): Promise<void> {
  // This would normally be done in a migration, but we'll add it here as a backup
  console.log("[NeighborhoodUtils] Creating required RPC functions is meant to be done in migrations");
  // No-op in the simplified version
}
