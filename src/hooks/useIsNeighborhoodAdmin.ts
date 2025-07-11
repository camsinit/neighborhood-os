/**
 * Hook to check if the current user is an admin of the current neighborhood
 * 
 * This hook specifically checks if the user has 'admin' role in the neighborhood.
 * Admins are typically the neighborhood creators and have full administrative privileges.
 */

import { useNeighborhood } from '@/contexts/neighborhood';
import { useNeighborhoodRole } from './useNeighborhoodRole';

export function useIsNeighborhoodAdmin() {
  const { currentNeighborhood } = useNeighborhood();
  const { data: role, isLoading } = useNeighborhoodRole(currentNeighborhood?.id || null);
  
  return {
    isAdmin: role === 'admin',
    isLoading,
    role
  };
}