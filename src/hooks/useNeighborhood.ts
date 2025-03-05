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
import { useState, useEffect, useCallback } from 'react';
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
  
  // Additional status information
  isBackgroundRefreshing: boolean;
}

// Helper function to add more detailed error logging
const logError = (context: string, error: any, additionalInfo?: Record<string, any>) => {
  console.error(`[useNeighborhood] Error in ${context}:`, 
    error?.message || error,
    {
      errorCode: error?.code,
      errorDetails: error?.details,
      ...additionalInfo
    }
  );
};

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
  
  // Track if a background refresh is happening
  const [isBackgroundRefreshing, setIsBackgroundRefreshing] = useState(false);

  // Helper function to fetch neighborhood data
  const fetchNeighborhoodData = useCallback(async () => {
    if (!user) {
      console.log("[useNeighborhood] No user found, skipping neighborhood fetch");
      return null;
    }

    try {
      // First check if user is a core contributor with access to all neighborhoods
      console.log("[useNeighborhood] Checking core contributor access for user:", user.id);
      const { data: hasAccess, error: coreError } = await supabase
        .rpc('user_is_core_contributor_with_access', {
          user_uuid: user.id
        });
        
      if (coreError) {
        logError("checking core contributor access", coreError, { userId: user.id });
        throw coreError;
      }
      
      // Set core contributor status
      setIsCoreContributor(!!hasAccess);
      console.log("[useNeighborhood] Core contributor status:", !!hasAccess);
      
      // Check if the user created a neighborhood
      console.log("[useNeighborhood] Checking if user created neighborhoods");
      const { data: createdNeighborhoods, error: createdError } = await supabase
        .from('neighborhoods')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })
        .limit(1);
        
      if (createdError) {
        logError("checking created neighborhoods", createdError, { userId: user.id });
        throw createdError;
      }
      
      // If they created a neighborhood, return it
      if (createdNeighborhoods && createdNeighborhoods.length > 0) {
        console.log("[useNeighborhood] Found neighborhood created by user:", {
          neighborhoodId: createdNeighborhoods[0].id,
          neighborhoodName: createdNeighborhoods[0].name
        });
        return createdNeighborhoods[0] as Neighborhood;
      }
      
      // Otherwise, check neighborhood membership
      console.log("[useNeighborhood] Checking neighborhood membership");
      const { data: memberNeighborhoods, error: memberError } = await supabase
        .rpc('get_user_neighborhoods', {
          user_uuid: user.id
        });
        
      if (memberError) {
        logError("checking neighborhood membership", memberError, { userId: user.id });
        throw memberError;
      }
      
      // Return the first neighborhood they're a member of
      if (memberNeighborhoods && memberNeighborhoods.length > 0) {
        console.log("[useNeighborhood] Found neighborhood membership:", {
          neighborhoodId: memberNeighborhoods[0].id,
          neighborhoodName: memberNeighborhoods[0].name
        });
        return memberNeighborhoods[0] as Neighborhood;
      }
      
      // If no neighborhood found, return null
      console.log("[useNeighborhood] No neighborhood found for user");
      return null;
    } catch (err) {
      logError("fetching neighborhood", err, { userId: user?.id });
      throw err;
    }
  }, [user]);

  // Main query to fetch the current user's neighborhood
  const {
    data: neighborhoodData,
    isLoading,
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ['current-neighborhood', user?.id],
    queryFn: fetchNeighborhoodData,
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000,   // Keep unused data in cache for 10 minutes
    retry: 2,                 // Retry failed requests twice
    // Error handling
    onError: (err: Error) => {
      setError(err);
      console.error("[useNeighborhood] Error fetching neighborhood:", err.message);
      
      // Show toast notification for user feedback
      toast.error("Unable to load neighborhood data", {
        description: "Please try refreshing the page or contact support if the problem persists.",
        duration: 5000
      });
    }
  });

  // Query to get all available neighborhoods (for core contributors)
  const { 
    data: availableNeighborhoods = [],
    refetch: refetchAvailableNeighborhoods 
  } = useQuery({
    queryKey: ['available-neighborhoods', user?.id, isCoreContributor],
    queryFn: async () => {
      if (!user || !isCoreContributor) {
        return [];
      }

      try {
        console.log("[useNeighborhood] Fetching all neighborhoods for core contributor");
        // Fetch all neighborhoods for core contributors
        const { data, error } = await supabase
          .rpc('get_all_neighborhoods_for_core_contributor', {
            user_uuid: user.id
          });
          
        if (error) {
          logError("fetching all neighborhoods", error, { userId: user.id });
          throw error;
        }
        
        return data || [] as Neighborhood[];
      } catch (err) {
        logError("fetching available neighborhoods", err, { userId: user?.id });
        return [];
      }
    },
    enabled: !!user && isCoreContributor,
    staleTime: 5 * 60 * 1000
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

  // Background refresh function that doesn't trigger loading state
  const backgroundRefresh = useCallback(async () => {
    if (isBackgroundRefreshing) return;
    
    setIsBackgroundRefreshing(true);
    console.log("[useNeighborhood] Starting background refresh");
    
    try {
      await refetch({ cancelRefetch: false });
      if (isCoreContributor) {
        await refetchAvailableNeighborhoods({ cancelRefetch: false });
      }
      console.log("[useNeighborhood] Background refresh completed successfully");
    } catch (err) {
      console.error("[useNeighborhood] Background refresh failed:", err);
    } finally {
      setIsBackgroundRefreshing(false);
    }
  }, [refetch, refetchAvailableNeighborhoods, isCoreContributor, isBackgroundRefreshing]);

  // Set up periodic background refresh
  useEffect(() => {
    if (!user) return;
    
    // Refresh data in the background every 5 minutes
    const intervalId = setInterval(() => {
      backgroundRefresh();
    }, 5 * 60 * 1000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [user, backgroundRefresh]);

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
      isRefetching,
      isBackgroundRefreshing
    });
  }, [neighborhoodData, isLoading, isCoreContributor, availableNeighborhoods, error, user, isRefetching, isBackgroundRefreshing]);

  // Return a cleaned-up, simple interface
  return {
    neighborhood: neighborhoodData || null,
    isLoading,
    error,
    refreshNeighborhood: refetch,
    setCurrentNeighborhood: setCurrentNeighborhoodMutation.mutate,
    isCoreContributor,
    availableNeighborhoods,
    isBackgroundRefreshing
  };
}

// Export a convenient alias for the hook
export default useNeighborhood;
