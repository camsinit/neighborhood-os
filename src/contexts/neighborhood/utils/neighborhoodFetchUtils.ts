
/**
 * Neighborhood fetching utilities
 * 
 * These utilities have been simplified to eliminate recursion issues and improve reliability.
 * Each function is focused on a specific task with clear error handling.
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
    // Log the operation for debugging
    console.log(`[fetchCreatedNeighborhoods] Fetching neighborhoods created by user ${userId}`);
    
    // Use direct table query with proper error handling
    const { data, error } = await supabase
      .from('neighborhoods')
      .select('id, name')
      .eq('created_by', userId);
    
    if (error) {
      // Log the error for debugging
      console.error("[fetchCreatedNeighborhoods] Error:", error.message);
      return { data: null, error };
    }
    
    // Log success for debugging
    console.log(`[fetchCreatedNeighborhoods] Found ${data?.length || 0} neighborhoods created by user ${userId}`);
    
    return { 
      data: data as Neighborhood[],
      error: null 
    };
  } catch (error: any) {
    // Handle unexpected errors
    console.error("[fetchCreatedNeighborhoods] Unexpected error:", error);
    return { 
      data: null, 
      error: new Error(error.message || "Unknown error in fetchCreatedNeighborhoods") 
    };
  }
};

/**
 * Fetch all neighborhoods that the current user has access to
 * 
 * @returns Promise with array of all neighborhoods the user can access
 */
export const fetchAllNeighborhoods = async (): Promise<Neighborhood[]> => {
  try {
    // Log the operation
    console.log("[fetchAllNeighborhoods] Fetching all accessible neighborhoods");
    
    // First get the current user's ID
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Handle case where user is not authenticated
      console.warn("[fetchAllNeighborhoods] No authenticated user found");
      return [];
    }
    
    // First try to use our RPC function for better performance
    try {
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_user_neighborhoods_simple', { user_uuid: user.id });
        
      if (!rpcError && rpcData && rpcData.length > 0) {
        console.log(`[fetchAllNeighborhoods] Found ${rpcData.length} neighborhoods via RPC`);
        return rpcData as Neighborhood[];
      }
    } catch (rpcErr) {
      console.warn("[fetchAllNeighborhoods] RPC error, falling back to direct queries:", rpcErr);
    }
    
    // Fall back to direct queries if RPC fails
    // First get created neighborhoods
    const { data: createdData, error: createdError } = await supabase
      .from('neighborhoods')
      .select('id, name')
      .eq('created_by', user.id);
    
    if (createdError) {
      console.error("[fetchAllNeighborhoods] Error fetching created neighborhoods:", createdError.message);
      return [];
    }
    
    // Then get neighborhoods the user is a member of
    const { data: memberData, error: memberError } = await supabase
      .from('neighborhood_members')
      .select('neighborhood_id, neighborhoods!inner(id, name)')
      .eq('user_id', user.id)
      .eq('status', 'active');
    
    if (memberError) {
      console.error("[fetchAllNeighborhoods] Error fetching member neighborhoods:", memberError.message);
      return [];
    }
    
    // Combine the results into a single list of neighborhoods
    const neighborhoods: Neighborhood[] = [
      ...(createdData || []),
      ...(memberData?.map(m => ({
        id: m.neighborhoods.id,
        name: m.neighborhoods.name
      })) || [])
    ];
    
    // Log success and return the results
    console.log(`[fetchAllNeighborhoods] Found ${neighborhoods.length} accessible neighborhoods`);
    return neighborhoods;
  } catch (error: any) {
    // Handle unexpected errors
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
    // Log the operation
    console.log(`[fetchUserMemberships] Fetching memberships for user ${userId}`);
    
    // Direct query to get memberships
    const { data, error } = await supabase
      .from('neighborhood_members')
      .select('neighborhood_id')
      .eq('user_id', userId)
      .eq('status', 'active');
        
    if (error) {
      console.error("[fetchUserMemberships] Error:", error.message);
      return { data: null, error };
    }
    
    // Log success
    console.log(`[fetchUserMemberships] Found ${data?.length || 0} memberships for user ${userId}`);
    return { data, error: null };
  } catch (error: any) {
    // Handle unexpected errors
    console.error("[fetchUserMemberships] Unexpected error:", error);
    return { 
      data: null, 
      error: new Error(error.message || "Unknown error in fetchUserMemberships") 
    };
  }
};
