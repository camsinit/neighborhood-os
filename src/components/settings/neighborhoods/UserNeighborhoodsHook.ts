
/**
 * Custom hook to fetch and manage neighborhood data for a user
 * 
 * UPDATED: Now uses the new simplified helper function
 */
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { createLogger } from "@/utils/logger";

const logger = createLogger('UserNeighborhoodsHook');

// Define the Neighborhood interface for type safety
export interface Neighborhood {
  id: string;
  name: string;
  joined_at: string;
}

/**
 * Custom hook that fetches neighborhoods for the current user
 * UPDATED: Now uses the new simplified helper function
 * 
 * @returns Object containing neighborhoods data, loading state, and error information
 */
export const useUserNeighborhoods = () => {
  // Get the current user from Supabase Auth
  const user = useUser();

  // State for neighborhoods, loading status, and any error
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to add a user to a neighborhood using simple queries
  const addUserToNeighborhood = async (userId: string, neighborhoodName: string) => {
    try {
      // Step 1: Find the neighborhood ID by name using simple query
      const { data: neighborhoods, error: neighborhoodError } = await supabase
        .from('neighborhoods')
        .select('id')
        .eq('name', neighborhoodName)
        .limit(1);
      
      if (neighborhoodError) throw neighborhoodError;
      
      if (!neighborhoods || neighborhoods.length === 0) {
        toast.error(`Neighborhood "${neighborhoodName}" not found`);
        return;
      }
      
      const neighborhoodId = neighborhoods[0].id;

      // Step 2: Check if user already has access using simple query
      const { data: existingMembership, error: membershipError } = await supabase
        .from('neighborhood_members')
        .select('id')
        .eq('user_id', userId)
        .eq('neighborhood_id', neighborhoodId)
        .eq('status', 'active')
        .limit(1);
      
      if (membershipError) throw membershipError;
      
      if (existingMembership && existingMembership.length > 0) {
        toast.info(`User already has access to "${neighborhoodName}"`);
        return;
      }

      // Step 3: Add the user as a member using simple insert
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
      logger.error('Error adding user to neighborhood:', err);
      toast.error("Failed to add user to neighborhood");
    }
  };

  // Function to refresh the neighborhoods data using the new helper function
  const refreshNeighborhoods = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      logger.debug('Fetching neighborhoods for user:', user.id);

      // Use the new simplified helper function
      const { data: neighborhoodIds, error: idsError } = await supabase
        .rpc('get_user_neighborhood_ids', { user_uuid: user.id });

      if (idsError) {
        logger.error('Error fetching neighborhood IDs:', idsError);
        throw idsError;
      }

      if (neighborhoodIds && neighborhoodIds.length > 0) {
        // Get details for all neighborhoods
        const { data: neighborhoodDetails, error: detailsError } = await supabase
          .from('neighborhoods')
          .select('id, name, created_at')
          .in('id', neighborhoodIds);

        if (detailsError) {
          logger.error('Error fetching neighborhood details:', detailsError);
          throw detailsError;
        }

        // Transform the data to match our interface
        const allNeighborhoods: Neighborhood[] = neighborhoodDetails?.map(n => ({
          id: n.id,
          name: n.name,
          joined_at: n.created_at || new Date().toISOString()
        })) || [];
        
        logger.debug('Successfully fetched neighborhoods:', allNeighborhoods);
        setNeighborhoods(allNeighborhoods);
      } else {
        logger.debug('No neighborhoods found for user');
        setNeighborhoods([]);
      }
    } catch (err: any) {
      logger.error('Error fetching neighborhoods:', err);
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
