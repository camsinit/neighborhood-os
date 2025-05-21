
/**
 * Custom hook to fetch and manage neighborhood data for a user
 * This hook encapsulates all the data fetching logic for neighborhoods
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

  // Helper function to add a user to a neighborhood
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

      // Check if user is already a member
      // Use the function call with 'any' type annotation to bypass TypeScript checking
      const response = await (supabase.rpc as any)('user_is_neighborhood_member', {
        user_uuid: userId,
        neighborhood_uuid: neighborhoodId
      });
      
      // Use type assertion for the RPC response
      const { data: isMember, error: membershipCheckError } = response as unknown as {
        data: boolean | null;
        error: Error | null;
      };
      
      if (membershipCheckError) throw membershipCheckError;
      
      if (isMember) {
        toast.info(`User is already a member of "${neighborhoodName}"`);
        return;
      }

      // Add the user as a member using RPC function
      // Use the function call with 'any' type annotation to bypass TypeScript checking
      const addMemberResponse = await (supabase.rpc as any)('add_neighborhood_member', {
        user_uuid: userId,
        neighborhood_uuid: neighborhoodId
      });
      
      // Use type assertion for the RPC response
      const { error: addError } = addMemberResponse as unknown as {
        data: boolean | null;
        error: Error | null;
      };
      
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

  // Function to refresh the neighborhoods data
  const refreshNeighborhoods = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("[UserNeighborhoods] Fetching neighborhoods for user:", user.id);

      // First check if the user created any neighborhoods directly
      const {
        data: createdNeighborhoods,
        error: createdError
      } = await supabase.from('neighborhoods').select('id, name').eq('created_by', user.id);
      
      if (createdError) {
        console.warn("[UserNeighborhoods] Error checking created neighborhoods:", createdError);
      }

      // If user created neighborhoods, use those
      if (createdNeighborhoods && createdNeighborhoods.length > 0) {
        const formattedNeighborhoods = createdNeighborhoods.map(item => ({
          id: item.id,
          name: item.name,
          joined_at: new Date().toISOString() // Default value since we don't have joined_at for creators
        }));
        
        setNeighborhoods(formattedNeighborhoods);
        setIsLoading(false);
        return;
      }

      // Call RPC function that safely checks membership
      // Use the function call with 'any' type annotation to bypass TypeScript checking
      const response = await (supabase.rpc as any)('get_user_neighborhoods', {
        user_uuid: user.id
      });
      
      // Use type assertion for the RPC response
      const { data: membershipData, error: membershipError } = response as unknown as {
        data: Neighborhood[] | null;
        error: Error | null;
      };
      
      if (membershipError) {
        throw membershipError;
      }
      
      if (membershipData) {
        setNeighborhoods(membershipData);
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
