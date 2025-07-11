/**
 * Hook to check if the current user is a steward of the current neighborhood
 * 
 * This hook specifically checks if the user has 'steward' role in the neighborhood.
 * Stewards have most admin privileges but cannot modify core neighborhood settings
 * or delete the neighborhood.
 */

import { useNeighborhood } from '@/contexts/neighborhood';
import { useNeighborhoodRole } from './useNeighborhoodRole';

export function useIsNeighborhoodSteward() {
  const { currentNeighborhood } = useNeighborhood();
  const { data: role, isLoading } = useNeighborhoodRole(currentNeighborhood?.id || null);
  
  return {
    isSteward: role === 'steward',
    isLoading,
    role
  };
}