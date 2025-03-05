/**
 * Custom hook for React Query-based neighborhood data fetching
 * 
 * This hook encapsulates all the React Query logic for neighborhood data
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@supabase/auth-helpers-react';
import { Neighborhood } from '@/contexts/neighborhood/types';
import { toast } from 'sonner';
import { 
  checkCoreContributorStatus, 
  fetchCreatedNeighborhoods, 
  fetchNeighborhoodMembership,
  fetchAllNeighborhoodsForContributor 
} from './utils/fetchers';
import { logError, logDebug } from './utils/errorLogging';

/**
 * Hook for neighborhood data querying with React Query
 * 
 * @returns Object containing all neighborhood queries
 */
export const useNeighborhoodQueries = () => {
  // Get the current authenticated user
  const user = useUser();
  
  // Query client for cache management
  const queryClient = useQueryClient();
  
  // Query function to fetch the neighborhood data
  const fetchNeighborhoodData = async () => {
    if (!user) {
      logDebug("No user found, skipping neighborhood fetch");
      return null;
    }

    try {
      // Check if user is a core contributor
      const isCoreContributor = await checkCoreContributorStatus(user.id);
      
      // Check if the user created a neighborhood
      const { data: createdNeighborhoods, error: createdError } = await fetchCreatedNeighborhoods(user.id);
        
      if (createdError) {
        logError("checking created neighborhoods", createdError, { userId: user.id });
        throw createdError;
      }
      
      // If they created a neighborhood, return it
      if (createdNeighborhoods && createdNeighborhoods.length > 0) {
        logDebug("Found neighborhood created by user:", {
          neighborhoodId: createdNeighborhoods[0].id,
          neighborhoodName: createdNeighborhoods[0].name
        });
        return createdNeighborhoods[0];
      }
      
      // Otherwise, check neighborhood membership
      const memberNeighborhoods = await fetchNeighborhoodMembership(user.id);
      
      // Return the first neighborhood they're a member of
      if (memberNeighborhoods && memberNeighborhoods.length > 0) {
        logDebug("Found neighborhood membership:", {
          neighborhoodId: memberNeighborhoods[0].id,
          neighborhoodName: memberNeighborhoods[0].name
        });
        return memberNeighborhoods[0];
      }
      
      // If no neighborhood found, return null
      logDebug("No neighborhood found for user");
      return null;
    } catch (err) {
      logError("fetching neighborhood", err, { userId: user?.id });
      throw err;
    }
  };

  // Main query for the current neighborhood
  const neighborhoodQuery = useQuery({
    queryKey: ['current-neighborhood', user?.id],
    queryFn: fetchNeighborhoodData,
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000,   // Keep unused data in cache for 10 minutes
    retry: 2                  // Retry failed requests twice
  });

  // Function to check if user is a core contributor
  const checkCoreContributor = async () => {
    if (!user) return false;
    return checkCoreContributorStatus(user.id);
  };

  // Query to check if user is a core contributor
  const coreContributorQuery = useQuery({
    queryKey: ['core-contributor', user?.id],
    queryFn: checkCoreContributor,
    enabled: !!user
  });

  // Query to get all available neighborhoods for core contributors
  const availableNeighborhoodsQuery = useQuery({
    queryKey: ['available-neighborhoods', user?.id, coreContributorQuery.data],
    queryFn: async () => {
      if (!user || !coreContributorQuery.data) {
        return [];
      }
      return fetchAllNeighborhoodsForContributor(user.id);
    },
    enabled: !!user && !!coreContributorQuery.data
  });

  // Mutation to set the current neighborhood
  const setCurrentNeighborhoodMutation = useMutation({
    mutationFn: async (neighborhood: Neighborhood) => {
      // In a real app, you might save this to user preferences
      // For now, we just update the React Query cache
      queryClient.setQueryData(['current-neighborhood', user?.id], neighborhood);
      return neighborhood;
    },
    onSuccess: (data) => {
      toast.success(`Switched to ${data.name} neighborhood`);
      
      // Invalidate any queries that depend on the current neighborhood
      queryClient.invalidateQueries({ queryKey: ['neighborhood-content'] });
      queryClient.invalidateQueries({ queryKey: ['neighborhood-members'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['safety-updates'] });
      queryClient.invalidateQueries({ queryKey: ['goods-exchange'] });
      queryClient.invalidateQueries({ queryKey: ['skills-exchange'] });
      queryClient.invalidateQueries({ queryKey: ['care-requests'] });
    },
  });

  return {
    neighborhoodQuery,
    coreContributorQuery,
    availableNeighborhoodsQuery,
    setCurrentNeighborhoodMutation
  };
};
