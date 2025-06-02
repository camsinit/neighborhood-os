
/**
 * Main neighborhood data hook
 * 
 * Updated to work with simplified RLS policies - no complex functions needed
 */
import { User } from '@supabase/supabase-js';
import { useNeighborhoodStatus } from './hooks/useNeighborhoodStatus';
import { useFetchNeighborhood } from './hooks/useFetchNeighborhood';
import { useAuthStabilizer } from './hooks/useAuthStabilizer';
import { useNeighborhoodMonitor } from './hooks/useNeighborhoodMonitor';
import { useEffect, useState, useCallback } from 'react';
import { Neighborhood } from './types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Custom hook that handles fetching and managing neighborhood data
 * Updated to use simple queries that work with our simplified RLS policies
 * 
 * @param user - The current authenticated user
 * @returns Object containing neighborhood data and loading state
 */
export function useNeighborhoodData(user: User | null) {
  // Initialize status tracking
  const statusHook = useNeighborhoodStatus();
  const {
    isLoading, setIsLoading,
    error, setError,
    fetchAttempts,
    refreshNeighborhoodData,
    startFetch,
    completeFetch,
    handleFetchError
  } = statusHook;
  
  // State for neighborhoods
  const [currentNeighborhood, setCurrentNeighborhood] = useState<Neighborhood | null>(null);
  const [userNeighborhoods, setUserNeighborhoods] = useState<Neighborhood[]>([]);
  
  // Wait for auth to stabilize
  const isAuthStable = useAuthStabilizer(user);

  // Function to fetch user's neighborhoods using simple queries
  const fetchUserNeighborhoods = useCallback(async () => {
    if (!user?.id) {
      setUserNeighborhoods([]);
      setCurrentNeighborhood(null);
      return;
    }

    try {
      setIsLoading(true);
      
      // Fetch all neighborhoods the user is a member of using simple query
      const { data: memberData, error: memberError } = await supabase
        .from('neighborhood_members')
        .select(`
          neighborhood_id,
          neighborhoods:neighborhood_id (
            id,
            name,
            created_by
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (memberError) {
        console.error('Error fetching user neighborhoods:', memberError);
        setError(memberError);
        return;
      }

      // Extract neighborhood data from the join
      const neighborhoods = memberData
        ?.map(member => member.neighborhoods)
        .filter(Boolean) as Neighborhood[];

      setUserNeighborhoods(neighborhoods || []);
      
      // Set the first neighborhood as current if none is set
      if (neighborhoods && neighborhoods.length > 0 && !currentNeighborhood) {
        setCurrentNeighborhood(neighborhoods[0]);
      }
      
      setError(null);
    } catch (error) {
      console.error('Error in fetchUserNeighborhoods:', error);
      setError(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, currentNeighborhood, setIsLoading, setError]);

  // Function to switch to a different neighborhood
  const switchNeighborhood = useCallback(async (neighborhoodId: string) => {
    const targetNeighborhood = userNeighborhoods.find(n => n.id === neighborhoodId);
    if (targetNeighborhood) {
      setCurrentNeighborhood(targetNeighborhood);
      toast.success(`Switched to ${targetNeighborhood.name}`);
    }
  }, [userNeighborhoods]);
  
  // Set up monitoring and safety timeouts
  useNeighborhoodMonitor({
    currentNeighborhood,
    isLoading,
    error,
    user,
    fetchAttempts,
    setIsLoading,
    setError
  });

  // Main effect to fetch neighborhood data
  useEffect(() => {
    if (isAuthStable) {
      fetchUserNeighborhoods();
    }
  }, [isAuthStable, fetchUserNeighborhoods]);

  // Return updated state and functions
  return { 
    currentNeighborhood,
    userNeighborhoods,
    isLoading, 
    error,
    setCurrentNeighborhood,
    switchNeighborhood,
    refreshNeighborhoodData: fetchUserNeighborhoods
  };
}
