/**
 * useNeighborhood Hook
 * 
 * This hook serves as the primary interface for accessing neighborhood data throughout the application.
 * It provides a simplified API for fetching, updating, and managing neighborhood information.
 * 
 * @returns Object containing neighborhood data and utility functions
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Neighborhood } from '@/contexts/neighborhood/types';

// Define the return type of the hook
export interface UseNeighborhoodReturn {
  // Core data
  neighborhood: Neighborhood | null;
  isLoading: boolean;
  error: Error | null;
  
  // Utility functions
  refreshNeighborhood: () => void;
  setCurrentNeighborhood: (neighborhood: Neighborhood) => void;
  
  // Admin/contributor functionality
  isCoreContributor: boolean;
  availableNeighborhoods: Neighborhood[];
}

/**
 * Custom hook for working with neighborhood data
 * 
 * This simplified hook centralizes neighborhood fetching logic
 * and provides a clean interface for components to use.
 */
export function useNeighborhood(): UseNeighborhoodReturn {
  // Get the current authenticated user
  const user = useUser();
  
  // Query client for cache management
  const queryClient = useQueryClient();
  
  // Local state for error tracking
  const [error, setError] = useState<Error | null>(null);
  
  // Track if we're a core contributor with access to all neighborhoods
  const [isCoreContributor, setIsCoreContributor] = useState(false);

  // Main query to fetch the current user's neighborhood
  const {
    data: neighborhoodData,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['current-neighborhood', user?.id],
    queryFn: async () => {
      if (!user) {
        console.log("[useNeighborhood] No user found, skipping neighborhood fetch");
        return null;
      }

      try {
        // First check if user is a core contributor with access to all neighborhoods
        const { data: hasAccess, error: coreError } = await supabase
          .rpc('user_is_core_contributor_with_access', {
            user_uuid: user.id
          });
          
        if (coreError) {
          console.error("[useNeighborhood] Error checking core contributor access:", coreError);
          throw coreError;
        }
        
        // Set core contributor status
        setIsCoreContributor(!!hasAccess);
        
        // Check if the user created a neighborhood
        const { data: createdNeighborhoods, error: createdError } = await supabase
          .from('neighborhoods')
          .select('*')
          .eq('created_by', user.id)
          .order('created_at', { ascending: false })
          .limit(1);
          
        if (createdError) {
          console.error("[useNeighborhood] Error checking created neighborhoods:", createdError);
          throw createdError;
        }
        
        // If they created a neighborhood, return it
        if (createdNeighborhoods && createdNeighborhoods.length > 0) {
          return createdNeighborhoods[0] as Neighborhood;
        }
        
        // Otherwise, check neighborhood membership
        const { data: memberNeighborhoods, error: memberError } = await supabase
          .rpc('get_user_neighborhoods', {
            user_uuid: user.id
          });
          
        if (memberError) {
          console.error("[useNeighborhood] Error checking neighborhood membership:", memberError);
          throw memberError;
        }
        
        // Return the first neighborhood they're a member of
        if (memberNeighborhoods && memberNeighborhoods.length > 0) {
          return memberNeighborhoods[0] as Neighborhood;
        }
        
        // If no neighborhood found, return null
        return null;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch neighborhood'));
        console.error("[useNeighborhood] Error fetching neighborhood:", err);
        throw err;
      }
    },
    enabled: !!user,
  });

  // Query to get all available neighborhoods (for core contributors)
  const { data: availableNeighborhoods = [] } = useQuery({
    queryKey: ['available-neighborhoods', user?.id, isCoreContributor],
    queryFn: async () => {
      if (!user || !isCoreContributor) {
        return [];
      }

      try {
        // Fetch all neighborhoods for core contributors
        const { data, error } = await supabase
          .rpc('get_all_neighborhoods_for_core_contributor', {
            user_uuid: user.id
          });
          
        if (error) {
          console.error("[useNeighborhood] Error fetching all neighborhoods:", error);
          throw error;
        }
        
        return data || [] as Neighborhood[];
      } catch (err) {
        console.error("[useNeighborhood] Error fetching available neighborhoods:", err);
        return [];
      }
    },
    enabled: !!user && isCoreContributor,
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

  // Debugging helper - log state changes
  useEffect(() => {
    console.log("[useNeighborhood] Current neighborhood state:", {
      neighborhoodId: neighborhoodData?.id,
      neighborhoodName: neighborhoodData?.name,
      isLoading,
      isCoreContributor,
      availableNeighborhoodCount: availableNeighborhoods?.length || 0,
      hasError: !!error,
      userId: user?.id,
    });
  }, [neighborhoodData, isLoading, isCoreContributor, availableNeighborhoods, error, user]);

  // Return a cleaned-up, simple interface
  return {
    neighborhood: neighborhoodData || null,
    isLoading,
    error,
    refreshNeighborhood: refetch,
    setCurrentNeighborhood: setCurrentNeighborhoodMutation.mutate,
    isCoreContributor,
    availableNeighborhoods,
  };
}

// Export a convenient alias for the hook
export default useNeighborhood;
