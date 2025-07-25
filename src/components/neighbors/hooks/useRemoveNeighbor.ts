
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNeighborhood } from '@/contexts/NeighborhoodContext';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Hook for super-admins to remove neighbors from the current neighborhood
 * 
 * This hook provides functionality to:
 * - Remove a user from the neighborhood membership
 * - Archive their content instead of deleting it
 * - Refresh the neighbors list after removal
 * - Show appropriate success/error messages
 */
export const useRemoveNeighbor = () => {
  const [isRemoving, setIsRemoving] = useState(false);
  const { currentNeighborhood } = useNeighborhood();
  const queryClient = useQueryClient();

  /**
   * Remove a neighbor from the current neighborhood
   * 
   * @param userId - The ID of the user to remove
   * @returns Promise<boolean> - True if removal was successful
   */
  const removeNeighbor = async (userId: string): Promise<boolean> => {
    if (!currentNeighborhood?.id) {
      toast.error('No neighborhood found');
      return false;
    }

    if (!userId) {
      toast.error('No user specified for removal');
      return false;
    }

    console.log('[useRemoveNeighbor] Starting removal process for user:', userId);
    setIsRemoving(true);

    try {
      // First, get the user's display name for the success message
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', userId)
        .single();

      const userName = profile?.display_name || 'the neighbor';

      // Remove the user from neighborhood membership
      // This will automatically hide them from the neighbors list
      const { error: removeError } = await supabase
        .from('neighborhood_members')
        .delete()
        .eq('user_id', userId)
        .eq('neighborhood_id', currentNeighborhood.id);

      if (removeError) {
        console.error('[useRemoveNeighbor] Error removing neighborhood membership:', removeError);
        throw new Error('Failed to remove neighborhood membership');
      }

      console.log('[useRemoveNeighbor] Successfully removed user from neighborhood');

      // Archive the user's content instead of deleting it
      // This preserves data integrity while hiding it from active views
      await Promise.allSettled([
        // Archive events
        supabase
          .from('events')
          .update({ is_archived: true })
          .eq('host_id', userId)
          .eq('neighborhood_id', currentNeighborhood.id),

        // Archive safety updates
        supabase
          .from('safety_updates')
          .update({ is_archived: true })
          .eq('author_id', userId)
          .eq('neighborhood_id', currentNeighborhood.id),

        // Archive skills exchange posts
        supabase
          .from('skills_exchange')
          .update({ is_archived: true })
          .eq('user_id', userId)
          .eq('neighborhood_id', currentNeighborhood.id),

        // Archive goods exchange posts
        supabase
          .from('goods_exchange')
          .update({ is_archived: true })
          .eq('user_id', userId)
          .eq('neighborhood_id', currentNeighborhood.id),

        // Note: support_requests and care_requests tables have been deprecated
      ]);

      console.log('[useRemoveNeighbor] Archived user content successfully');

      // Invalidate and refetch the neighbors list to update the UI
      await queryClient.invalidateQueries({
        queryKey: ['users-with-roles', currentNeighborhood.id]
      });

      // Show success message
      toast.success(`${userName} has been removed from the neighborhood`);

      return true;
    } catch (error: any) {
      console.error('[useRemoveNeighbor] Error removing neighbor:', error);
      
      toast.error(
        error.message || 'Failed to remove neighbor. Please try again.'
      );
      
      return false;
    } finally {
      setIsRemoving(false);
    }
  };

  return {
    removeNeighbor,
    isRemoving,
  };
};
