
/**
 * Custom hook to fetch and manage neighborhood data for a user
 * This hook encapsulates all the data fetching logic for neighborhoods
 * 
 * UPDATED: Now works with the new security definer functions and fixed RLS policies
 */
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";

// Define the Neighborhood interface for type safety
export interface Neighborhood {
  id: string;
  name: string;
  joined_at: string;
}

/**
 * Custom hook that fetches neighborhoods for the current user
 * Handles all API calls and state management related to neighborhoods
 * @returns Object containing neighborhoods data, loading state, and error information
 */
export const useUserNeighborhoods = () => {
  // Get the current user from Supabase Auth
  const user = useUser();

  // State for neighborhoods, loading status, and any error
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to add a user to a neighborhood using new security functions
  const addUserToNeighborhood = async (userId: string, neighborhoodName: string) => {
    try {
      // First, find the neighborhood ID by name
      const {
        data: neighborhoods,
        error: neighborhoodError
      } = await supabase.from('neighborhoods').select('id').eq('name', neighborhoodName).limit(1);
      
      if (neighborhoodError) throw neighborhoodError;
      
      if (!neighborhoods || neighborhoods.length === 0) {
        toast.error(`Neighborhood "${neighborhoodName}" not found`);
        return;
      }
      
      const neighborhoodId = neighborhoods[0].id;

      // Check if user already has access using the new security definer function
      const { data: hasAccess, error: accessError } = await supabase
        .rpc('check_neighborhood_access', {
          user_uuid: userId,
          neighborhood_uuid: neighborhoodId
        });
      
      if (accessError) throw accessError;
      
      if (hasAccess) {
        toast.info(`User already has access to "${neighborhoodName}"`);
        return;
      }

      // Add the user as a member using direct insert (RLS will handle permissions)
      const { error: addError } = await supabase
        .from('neighborhood_members')
        .insert({
          user_id: userId,
          neighborhood_id: neighborhoodId,
          status: 'active'
        });
      
      if (addError) throw addError;

      // Show success message
      toast.success(`User added to "${neighborhoodName}" successfully!`);

      // If the current user is the one being added, refresh the neighborhoods list
      if (user && user.id === userId) {
        refreshNeighborhoods();
      }
    } catch (err) {
      console.error("[UserNeighborhoods] Error adding user to neighborhood:", err);
      toast.error("Failed to add user to neighborhood");
    }
  };

  // Function to refresh the neighborhoods data using new security definer functions
  const refreshNeighborhoods = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("[UserNeighborhoods] Fetching neighborhoods for user:", user.id);

      // Use the new get_user_accessible_neighborhoods function
      const { data: accessibleNeighborhoods, error: accessError } = await supabase
        .rpc('get_user_accessible_neighborhoods', { user_uuid: user.id });

      if (accessError) {
        console.warn("[UserNeighborhoods] Error getting accessible neighborhoods:", accessError);
        throw accessError;
      }

      if (accessibleNeighborhoods && accessibleNeighborhoods.length > 0) {
        // Extract neighborhood IDs from the new return format {neighborhood_id, access_type}
        const neighborhoodIds = accessibleNeighborhoods.map(n => n.neighborhood_id);
        
        // Get details for all accessible neighborhoods using the new RLS policy
        const { data: neighborhoodDetails, error: detailsError } = await supabase
          .from('neighborhoods')
          .select('id, name, created_at')
          .in('id', neighborhoodIds);

        if (detailsError) {
          console.warn("[UserNeighborhoods] Error getting neighborhood details:", detailsError);
          throw detailsError;
        }

        // Transform the data to match our interface
        const allNeighborhoods: Neighborhood[] = neighborhoodDetails?.map(n => ({
          id: n.id,
          name: n.name,
          joined_at: n.created_at || new Date().toISOString()
        })) || [];
        
        setNeighborhoods(allNeighborhoods);
      } else {
        setNeighborhoods([]);
      }
    } catch (err: any) {
      console.error("[UserNeighborhoods] Error fetching neighborhoods:", err);
      setError(err instanceof Error ? err.message : "Failed to load your neighborhoods");
      toast.error("Failed to load your neighborhoods");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch neighborhoods when component mounts or user changes
  useEffect(() => {
    refreshNeighborhoods();
  }, [user]);

  return { 
    neighborhoods, 
    isLoading, 
    error, 
    addUserToNeighborhood,
    refreshNeighborhoods
  };
};
