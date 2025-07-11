/**
 * Hook to check if the current user can access the Admin page
 * 
 * This hook checks if the user has either 'admin' or 'steward' role in the current neighborhood.
 * Both admins and stewards can access the Admin page, but with different permission levels.
 * 
 * Returns:
 * - canAccess: boolean - whether user can access admin page
 * - isAdmin: boolean - whether user is an admin (full permissions)
 * - isSteward: boolean - whether user is a steward (limited permissions)
 * - isLoading: boolean - whether the role check is still loading
 */

import { useNeighborhood } from '@/contexts/neighborhood';
import { useNeighborhoodRole } from './useNeighborhoodRole';

export function useCanAccessAdminPage() {
  const { currentNeighborhood } = useNeighborhood();
  const { data: role, isLoading } = useNeighborhoodRole(currentNeighborhood?.id || null);
  
  const isAdmin = role === 'admin';
  const isSteward = role === 'steward';
  const canAccess = isAdmin || isSteward;
  
  return {
    canAccess,
    isAdmin,
    isSteward,
    isLoading,
    role
  };
}