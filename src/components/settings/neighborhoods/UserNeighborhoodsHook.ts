
/**
 * Custom hook to fetch and manage neighborhood data for a user
 * 
 * UPDATED: Uses simplified queries to avoid RLS recursion issues
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
 * UPDATED: Uses simple, direct queries that won't cause RLS recursion
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

  // Function to refresh the neighborhoods data using simple queries
  const refreshNeighborhoods = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      logger.debug('Fetching neighborhoods for user:', user.id);

      // Step 1: Get memberships using simple query (no recursion)
      const { data: memberships, error: membershipError } = await supabase
        .from('neighborhood_members')
        .select('neighborhood_id')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (membershipError) {
        logger.error('Error fetching memberships:', membershipError);
        throw membershipError;
      }

      // Step 2: Get created neighborhoods using simple query (no recursion)
      const { data: createdNeighborhoods, error: createdError } = await supabase
        .from('neighborhoods')
        .select('id, name, created_at')
        .eq('created_by', user.id);

      if (createdError) {
        logger.error('Error fetching created neighborhoods:', createdError);
        throw createdError;
      }

      // Step 3: Combine membership and created neighborhood IDs
      const membershipIds = memberships?.map(m => m.neighborhood_id) || [];
      const createdIds = createdNeighborhoods?.map(n => n.id) || [];
      const allNeighborhoodIds = [...new Set([...membershipIds, ...createdIds])];

      if (allNeighborhoodIds.length > 0) {
        // Step 4: Get details for all neighborhoods using simple query (no recursion)
        const { data: neighborhoodDetails, error: detailsError } = await supabase
          .from('neighborhoods')
          .select('id, name, created_at')
          .in('id', allNeighborhoodIds);

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
