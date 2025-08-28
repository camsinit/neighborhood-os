
import { useState } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useSuperAdminAccess } from './useSuperAdminAccess';

/**
 * Hook for creating new neighborhoods
 * 
 * Handles the creation process including:
 * - Validating neighborhood data
 * - Creating the neighborhood record
 * - Adding the creator as the first member
 */
export const useCreateNeighborhood = () => {
  const user = useUser();
  const { isSuperAdmin } = useSuperAdminAccess();
  const [isCreating, setIsCreating] = useState(false);

  /**
   * Create a new neighborhood with the provided data
   */
  const createNeighborhood = async (neighborhoodData: {
    name: string;
    city: string;
    state: string;
    address?: string;
    timezone: string;
  }) => {
    if (!user?.id) {
      toast.error('You must be logged in to create a neighborhood');
      return null;
    }

    setIsCreating(true);

    try {
      // Super admins use special function to bypass membership constraints
      if (isSuperAdmin) {
        const { data: newNeighborhoodId, error: rpcError } = await supabase.rpc(
          'create_neighborhood_as_super_admin',
          {
            neighborhood_name: neighborhoodData.name,
            neighborhood_city: neighborhoodData.city,
            neighborhood_state: neighborhoodData.state,
            neighborhood_address: neighborhoodData.address || '',
            neighborhood_timezone: neighborhoodData.timezone,
          }
        );

        if (rpcError) {
          console.error('Error creating neighborhood as super admin:', rpcError);
          toast.error('Failed to create neighborhood');
          return null;
        }

        // Fetch the created neighborhood details
        const { data: newNeighborhood, error: fetchError } = await supabase
          .from('neighborhoods')
          .select()
          .eq('id', newNeighborhoodId)
          .single();

        if (fetchError) {
          console.error('Error fetching created neighborhood:', fetchError);
          toast.error('Failed to fetch created neighborhood');
          return null;
        }

        toast.success(`Neighborhood "${neighborhoodData.name}" created successfully!`);
        return newNeighborhood;
      }

      // Regular user flow: create neighborhood and add membership
      const { data: newNeighborhood, error: neighborhoodError } = await supabase
        .from('neighborhoods')
        .insert({
          name: neighborhoodData.name,
          city: neighborhoodData.city,
          state: neighborhoodData.state,
          address: neighborhoodData.address || '',
          timezone: neighborhoodData.timezone,
          created_by: user.id,
          physical_unit_type: 'None', // Required field with default value
        })
        .select()
        .single();

      if (neighborhoodError) {
        console.error('Error creating neighborhood:', neighborhoodError);
        toast.error('Failed to create neighborhood');
        return null;
      }

      // Add the creator as the first member of the neighborhood
      const { error: memberError } = await supabase
        .from('neighborhood_members')
        .insert({
          user_id: user.id,
          neighborhood_id: newNeighborhood.id,
          status: 'active',
        });

      if (memberError) {
        console.error('Error adding creator as member:', memberError);
        // Try to clean up the neighborhood if member creation fails
        await supabase
          .from('neighborhoods')
          .delete()
          .eq('id', newNeighborhood.id);
        
        toast.error('Failed to set up neighborhood membership');
        return null;
      }

      toast.success(`Neighborhood "${neighborhoodData.name}" created successfully!`);
      return newNeighborhood;
    } catch (error) {
      console.error('Unexpected error creating neighborhood:', error);
      toast.error('An unexpected error occurred');
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createNeighborhood,
    isCreating,
  };
};
