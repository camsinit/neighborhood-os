
/**
 * Neighborhood fetching utilities
 * 
 * These utilities use direct table queries since RLS is temporarily disabled.
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
    
    // Use direct table query instead of RPC since RLS is disabled
    const { data, error } = await supabase
      .from('neighborhoods')
      .select('id, name')
      .eq('created_by', userId);
    
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
    
    // First get the current user's ID
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn("[fetchAllNeighborhoods] No authenticated user found");
      return [];
    }
    
    // Use direct table queries since RLS is disabled
    // First get created neighborhoods
    const { data: createdData, error: createdError } = await supabase
      .from('neighborhoods')
      .select('id, name')
      .eq('created_by', user.id);
    
    if (createdError) {
      console.error("[fetchAllNeighborhoods] Error fetching created neighborhoods:", createdError.message);
      return [];
    }
    
    // Then get member neighborhoods
    const { data: memberData, error: memberError } = await supabase
      .from('neighborhood_members')
      .select('neighborhood_id, neighborhoods!inner(id, name)')
      .eq('user_id', user.id)
      .eq('status', 'active');
    
    if (memberError) {
      console.error("[fetchAllNeighborhoods] Error fetching member neighborhoods:", memberError.message);
      return [];
    }
    
    // Combine the results
    const neighborhoods: Neighborhood[] = [
      ...(createdData || []),
      ...(memberData?.map(m => ({
        id: m.neighborhoods.id,
        name: m.neighborhoods.name
      })) || [])
    ];
    
    console.log(`[fetchAllNeighborhoods] Found ${neighborhoods.length} accessible neighborhoods`);
    
    return neighborhoods;
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
    
    // With RLS disabled, we can use direct table query
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
    // With RLS disabled, we can use direct table query
    const { data, error } = await supabase
      .from('core_contributors')
      .select('can_access_all_neighborhoods')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error("[checkCoreContributorAccess] Error:", error.message);
      return false;
    }
    
    return !!data?.can_access_all_neighborhoods;
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
    // Check if user is core contributor with access
    const isContributor = await checkCoreContributorAccess(userId);
    
    if (!isContributor) {
      return [];
    }
    
    // With RLS disabled, we can query neighborhoods directly
    const { data, error } = await supabase
      .from('neighborhoods')
      .select('id, name')
      .order('name', { ascending: true });
    
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
