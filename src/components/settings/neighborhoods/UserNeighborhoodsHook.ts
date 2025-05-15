
/**
 * Custom hook to fetch and manage neighborhood data for a user
 * This hook encapsulates all the data fetching logic for neighborhoods
 */
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { createLogger } from "@/utils/logger";

// Initialize logger
const logger = createLogger('UserNeighborhoodsHook');

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
      logger.info("Adding user to neighborhood", { userId, neighborhoodName });
      
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
      const { data: isMember, error: membershipCheckError } = await supabase.rpc(
        'user_is_neighborhood_member',
        {
          user_uuid: userId,
          neighborhood_uuid: neighborhoodId
        }
      );
      
      if (membershipCheckError) throw membershipCheckError;
      
      if (isMember) {
        toast.info(`User is already a member of "${neighborhoodName}"`);
        return;
      }

      // Add the user as a member
      const { error: addError } = await supabase.rpc(
        'add_neighborhood_member',
        {
          user_uuid: userId,
          neighborhood_uuid: neighborhoodId
        }
      );
      
      if (addError) throw addError;

      // Show success message
      toast.success(`User added to "${neighborhoodName}" successfully!`);

      // If the current user is the one being added, refresh the neighborhoods list
      if (user && user.id === userId) {
        refreshNeighborhoods();
      }
    } catch (err) {
      logger.error("Error adding user to neighborhood:", err);
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
      
      logger.info("Fetching neighborhoods for user:", user.id);

      // Get user's neighborhoods using RPC function
      const { data: membershipData, error: membershipError } = await supabase.rpc(
        'get_user_neighborhoods',
        {
          user_uuid: user.id
        }
      );
      
      if (membershipError) {
        throw membershipError;
      }
      
      if (membershipData) {
        setNeighborhoods(membershipData);
      } else {
        setNeighborhoods([]);
      }
    } catch (err: any) {
      logger.error("Error fetching neighborhoods:", err);
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
