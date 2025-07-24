/**
 * Hook to fetch all neighborhoods for super admin neighborhood switching
 * 
 * This hook provides super admins with access to all neighborhoods in the system
 * for easy switching between different communities.
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSuperAdminAccess } from './useSuperAdminAccess';
import { Neighborhood } from '@/contexts/neighborhood/types';

// Extended neighborhood type with member count
export interface NeighborhoodWithCount extends Neighborhood {
  member_count: number;
}

export const useSuperAdminNeighborhoods = () => {
  const { isSuperAdmin } = useSuperAdminAccess();
  
  return useQuery({
    queryKey: ['super-admin-neighborhoods'],
    queryFn: async (): Promise<NeighborhoodWithCount[]> => {
      // Call the database function to get all neighborhoods
      const { data, error } = await supabase.rpc('get_all_neighborhoods_for_super_admin');
      
      if (error) {
        console.error('Error fetching neighborhoods:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: isSuperAdmin, // Only run if user is super admin
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};