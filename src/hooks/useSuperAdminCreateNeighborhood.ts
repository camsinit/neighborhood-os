/**
 * Hook for super admin neighborhood creation
 * 
 * Extends the base neighborhood creation functionality with super admin features:
 * - Automatic navigation to the new neighborhood
 * - Invalidation of super admin neighborhoods query for dropdown refresh
 */
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useCreateNeighborhood } from './useCreateNeighborhood';

export const useSuperAdminCreateNeighborhood = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { createNeighborhood, isCreating } = useCreateNeighborhood();

  /**
   * Create neighborhood with super admin enhancements
   */
  const createNeighborhoodAsSuperAdmin = async (neighborhoodData: {
    name: string;
    city: string;
    state: string;
    address?: string;
    timezone: string;
  }) => {
    const result = await createNeighborhood(neighborhoodData);
    
    if (result) {
      // Refresh the super admin neighborhoods list to include the new neighborhood
      queryClient.invalidateQueries({ queryKey: ['super-admin-neighborhoods'] });
      
      // Navigate to the newly created neighborhood
      navigate(`/n/${result.id}/home`);
    }
    
    return result;
  };

  return {
    createNeighborhoodAsSuperAdmin,
    isCreating,
  };
};