/**
 * Hook to get the user's role in a specific neighborhood
 * 
 * This hook determines the user's role within a neighborhood by:
 * 1. Checking if they're the neighborhood creator (automatic admin)
 * 2. Looking up their explicit role in the neighborhood_roles table
 * 3. Defaulting to 'neighbor' if they're a member but have no explicit role
 * 
 * Possible return values: 'admin', 'steward', 'neighbor', or null (if not a member)
 */

import { useQuery } from '@tanstack/react-query';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from '@/integrations/supabase/client';

export function useNeighborhoodRole(neighborhoodId: string | null) {
  const user = useUser();
  
  return useQuery({
    queryKey: ['neighborhood-role', user?.id, neighborhoodId],
    queryFn: async () => {
      // Return null if no user or neighborhood
      if (!user?.id || !neighborhoodId) {
        return null;
      }

      try {
        // Call the database function to get user's role in this neighborhood
        const { data, error } = await supabase.rpc('get_user_neighborhood_role', {
          user_uuid: user.id,
          neighborhood_uuid: neighborhoodId
        });

        if (error) {
          console.error('Error fetching neighborhood role:', error);
          return null;
        }

        // The function returns the role as a string, or null if not a member
        return data as 'admin' | 'steward' | 'neighbor' | null;
      } catch (error) {
        console.error('Error in useNeighborhoodRole:', error);
        return null;
      }
    },
    enabled: !!user?.id && !!neighborhoodId,
    staleTime: 5 * 60 * 1000, // 5 minutes - roles don't change often
  });
}