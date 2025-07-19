
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { createLogger } from '@/utils/logger';

// Create logger for this hook
const logger = createLogger('useSafetyComments');

// Comment interface with proper typing
export interface SafetyComment {
  id: string;
  content: string;
  user_id: string;
  safety_update_id: string;
  created_at: string;
  profiles?: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

/**
 * Hook for fetching safety update comments
 * Provides proper loading states and error handling
 */
export function useSafetyComments(safetyUpdateId: string) {
  return useQuery({
    queryKey: ['safety-comments', safetyUpdateId],
    queryFn: async (): Promise<SafetyComment[]> => {
      logger.debug('Fetching comments for safety update:', safetyUpdateId);
      
      const { data, error } = await supabase
        .from('safety_update_comments')
        .select(`
          *,
          profiles:user_id (
            display_name,
            avatar_url
          )
        `)
        .eq('safety_update_id', safetyUpdateId)
        .order('created_at', { ascending: true });

      if (error) {
        logger.error('Error fetching comments:', error);
        throw error;
      }

      logger.debug('Successfully fetched comments:', data?.length || 0);
      return data || [];
    },
    enabled: !!safetyUpdateId,
  });
}

/**
 * Hook for creating new comments with optimistic updates
 */
export function useCreateComment(safetyUpdateId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (content: string) => {
      logger.debug('Creating new comment for safety update:', safetyUpdateId);
      
      const { data, error } = await supabase
        .from('safety_update_comments')
        .insert({
          content: content.trim(),
          safety_update_id: safetyUpdateId,
        })
        .select(`
          *,
          profiles:user_id (
            display_name,
            avatar_url
          )
        `)
        .single();

      if (error) {
        logger.error('Error creating comment:', error);
        throw error;
      }

      logger.debug('Successfully created comment:', data.id);
      return data;
    },
    onSuccess: (newComment) => {
      // Update the cache with the new comment
      queryClient.setQueryData(['safety-comments', safetyUpdateId], (oldComments: SafetyComment[]) => {
        return [...(oldComments || []), newComment];
      });
      
      // Also invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['safety-comments', safetyUpdateId] });
      
      toast.success('Comment posted successfully');
      logger.debug('Comment cache updated and invalidated');
    },
    onError: (error) => {
      logger.error('Failed to create comment:', error);
      toast.error('Failed to post comment. Please try again.');
    },
  });
}

/**
 * Hook for updating existing comments
 */
export function useUpdateComment(safetyUpdateId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ commentId, content }: { commentId: string; content: string }) => {
      logger.debug('Updating comment:', commentId);
      
      const { data, error } = await supabase
        .from('safety_update_comments')
        .update({ content: content.trim() })
        .eq('id', commentId)
        .select(`
          *,
          profiles:user_id (
            display_name,
            avatar_url
          )
        `)
        .single();

      if (error) {
        logger.error('Error updating comment:', error);
        throw error;
      }

      logger.debug('Successfully updated comment:', commentId);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['safety-comments', safetyUpdateId] });
      toast.success('Comment updated successfully');
    },
    onError: (error) => {
      logger.error('Failed to update comment:', error);
      toast.error('Failed to update comment. Please try again.');
    },
  });
}

/**
 * Hook for deleting comments
 */
export function useDeleteComment(safetyUpdateId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (commentId: string) => {
      logger.debug('Deleting comment:', commentId);
      
      const { error } = await supabase
        .from('safety_update_comments')
        .delete()
        .eq('id', commentId);

      if (error) {
        logger.error('Error deleting comment:', error);
        throw error;
      }

      logger.debug('Successfully deleted comment:', commentId);
      return commentId;
    },
    onSuccess: (deletedCommentId) => {
      // Optimistically remove from cache
      queryClient.setQueryData(['safety-comments', safetyUpdateId], (oldComments: SafetyComment[]) => {
        return (oldComments || []).filter(comment => comment.id !== deletedCommentId);
      });
      
      toast.success('Comment deleted successfully');
    },
    onError: (error) => {
      logger.error('Failed to delete comment:', error);
      toast.error('Failed to delete comment. Please try again.');
    },
  });
}
