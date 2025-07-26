/**
 * Hook for super admin neighborhood creation
 * 
 * This hook handles neighborhood creation specifically for super admins,
 * bypassing the normal restrictions that prevent users from creating
 * multiple neighborhoods by using a dedicated database function.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const useSuperAdminCreateNeighborhood = () => {
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  /**
   * Create neighborhood using super admin specific database function
   * This bypasses the normal neighborhood creation restrictions
   */
  const createNeighborhoodAsSuperAdmin = async (neighborhoodData: {
    name: string;
    city: string;
    state: string;
    address?: string;
    timezone: string;
  }) => {
    try {
      setIsCreating(true);
      console.log('[useSuperAdminCreateNeighborhood] Creating neighborhood:', neighborhoodData);

      // Use the super admin specific database function
      const { data: newNeighborhoodId, error } = await supabase.rpc('create_neighborhood_as_super_admin', {
        neighborhood_name: neighborhoodData.name,
        neighborhood_city: neighborhoodData.city,
        neighborhood_state: neighborhoodData.state,
        neighborhood_address: neighborhoodData.address,
        neighborhood_timezone: neighborhoodData.timezone
      });

      if (error) {
        console.error('[useSuperAdminCreateNeighborhood] Error:', error);
        toast.error(`Failed to create neighborhood: ${error.message}`);
        return null;
      }

      console.log('[useSuperAdminCreateNeighborhood] Successfully created:', newNeighborhoodId);
      toast.success(`Neighborhood "${neighborhoodData.name}" created successfully!`);

      // Refresh the super admin neighborhoods list to include the new neighborhood
      await queryClient.invalidateQueries({ queryKey: ['super-admin-neighborhoods'] });
      
      // Navigate to the newly created neighborhood
      navigate(`/n/${newNeighborhoodId}/home`);
      
      return { id: newNeighborhoodId };
    } catch (error) {
      console.error('[useSuperAdminCreateNeighborhood] Unexpected error:', error);
      toast.error('An unexpected error occurred');
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createNeighborhoodAsSuperAdmin,
    isCreating,
  };
};