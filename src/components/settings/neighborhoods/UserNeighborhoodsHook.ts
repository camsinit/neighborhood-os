/**
 * Custom hook to fetch and manage neighborhood data for a user
 * This hook encapsulates all the data fetching logic for neighborhoods
 * 
 * UPDATED: Now uses direct queries instead of removed security definer functions
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

  // Helper function to add a user to a neighborhood using direct queries
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

      // Check if user already has access using direct query - fixed parameter names
      const { data: hasAccess, error: accessError } = await supabase
        .rpc('check_neighborhood_access', {
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

  // Function to refresh the neighborhoods data using direct queries
  const refreshNeighborhoods = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("[UserNeighborhoods] Fetching neighborhoods for user:", user.id);

      // First, get neighborhoods the user created
      const { data: createdNeighborhoods, error: createdError } = await supabase
        .from('neighborhoods')
        .select('id, name, created_at')
        .eq('created_by', user.id);

      if (createdError) {
        console.warn("[UserNeighborhoods] Error getting created neighborhoods:", createdError);
        throw createdError;
      }

      // Then, get neighborhoods the user is a member of
      const { data: memberData, error: memberError } = await supabase
        .from('neighborhood_members')
        .select(`
          neighborhood_id,
          joined_at,
          neighborhoods:neighborhood_id (
            id,
            name,
            created_at
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (memberError) {
        console.warn("[UserNeighborhoods] Error getting user neighborhoods:", memberError);
        throw memberError;
      }

      // Combine created neighborhoods and member neighborhoods
      const allNeighborhoods: Neighborhood[] = [
        ...(createdNeighborhoods?.map(n => ({
          id: n.id,
          name: n.name,
          joined_at: n.created_at || new Date().toISOString()
        })) || []),
        ...(memberData?.map(member => ({
          id: member.neighborhoods.id,
          name: member.neighborhoods.name,
          joined_at: member.joined_at || new Date().toISOString()
        })).filter(Boolean) || [])
      ];

      // Remove duplicates based on id
      const uniqueNeighborhoods = allNeighborhoods.filter((neighborhood, index, self) =>
        index === self.findIndex(n => n.id === neighborhood.id)
      );

      setNeighborhoods(uniqueNeighborhoods);
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
