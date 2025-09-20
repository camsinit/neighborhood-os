/**
 * GroupUpdateComments Component
 * 
 * Handles threaded comments for group updates.
 * Displays existing comments and allows users to add new ones.
 */

import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { GroupUpdateComment } from '@/types/groupUpdates';
import { useAutoResizeTextarea } from '@/components/hooks/use-auto-resize-textarea';
import { MoreHorizontal, Edit, Trash, Send } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface GroupUpdateCommentsProps {
  updateId: string;
  comments: GroupUpdateComment[];
  currentUserId: string;
  isGroupManager: boolean;
  onComment: (updateId: string, content: string) => Promise<void>;
  onReact: (updateId: string, emoji: string) => Promise<void>;
  onEditComment?: (commentId: string, content: string) => Promise<void>;
  onDeleteComment?: (commentId: string) => Promise<void>;
}

export function GroupUpdateComments({
  updateId,
  comments,
  currentUserId,
  isGroupManager,
  onComment,
  onReact,
  onEditComment,
  onDeleteComment
}: GroupUpdateCommentsProps) {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  // Fetch current user's profile for comment form avatar
  const { data: currentUserProfile } = useQuery({
    queryKey: ['profile', currentUserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .eq('id', currentUserId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!currentUserId
  });

  // Helper function to get user initials from display name
  const getUserInitials = (displayName?: string): string => {
    if (!displayName) return 'U'; // Default fallback for 'User'
    
    const names = displayName.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    } else {
      return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    }
  };

  const currentUserInitials = getUserInitials(currentUserProfile?.display_name);

  // Auto-resize textarea for new comment
  const { textareaRef: newCommentRef, adjustHeight: adjustNewHeight } = useAutoResizeTextarea({
    minHeight: 60,
    maxHeight: 120
  });

  // Auto-resize textarea for editing
  const { textareaRef: editRef, adjustHeight: adjustEditHeight } = useAutoResizeTextarea({
    minHeight: 60,
    maxHeight: 120
  });

  // Handle new comment submission
  const handleSubmitComment = async () => {
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onComment(updateId, newComment.trim());
      setNewComment('');
      adjustNewHeight(true); // Reset height
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit comment
  const handleEditComment = (comment: GroupUpdateComment) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content);
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!editingContent.trim() || !editingCommentId || !onEditComment) return;

    try {
      await onEditComment(editingCommentId, editingContent.trim());
      setEditingCommentId(null);
      setEditingContent('');
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingContent('');
  };

  // Handle delete comment
  const handleDeleteComment = (commentId: string) => {
    if (!onDeleteComment) return;
    
    if (window.confirm('Are you sure you want to delete this comment?')) {
      onDeleteComment(commentId);
    }
  };

  return (
    <div className="space-y-4 border-t pt-4">
      {/* Existing comments */}
      {comments.length > 0 && (
        <div className="space-y-3">
          {comments.map((comment) => {
            const authorName = comment.profiles?.display_name || 'Unknown User';
            const authorAvatar = comment.profiles?.avatar_url;
            const authorInitials = authorName.split(' ').map(n => n[0]).join('').toUpperCase();
            const timeAgo = formatDistanceToNow(new Date(comment.created_at), { addSuffix: true });
            const canEditComment = currentUserId === comment.user_id || isGroupManager;
            const canDeleteComment = currentUserId === comment.user_id || isGroupManager;
            const isEditing = editingCommentId === comment.id;

            return (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarImage src={authorAvatar} alt={authorName} />
                  <AvatarFallback className="text-xs">{authorInitials}</AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{authorName}</span>
                      <span className="text-xs text-muted-foreground">{timeAgo}</span>
                      {comment.edited_by && (
                        <span className="text-xs text-muted-foreground italic">Edited</span>
                      )}
                    </div>

                    {/* Comment actions menu */}
                    {(canEditComment || canDeleteComment) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {canEditComment && onEditComment && (
                            <DropdownMenuItem onClick={() => handleEditComment(comment)}>
                              <Edit className="mr-2 h-3 w-3" />
                              Edit
                            </DropdownMenuItem>
                          )}
                          {canDeleteComment && onDeleteComment && (
                            <DropdownMenuItem 
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash className="mr-2 h-3 w-3" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  {/* Comment content - editing or display */}
                  {isEditing ? (
                    <div className="space-y-2">
                      <Textarea
                        ref={editRef}
                        value={editingContent}
                        onChange={(e) => {
                          setEditingContent(e.target.value);
                          setTimeout(() => adjustEditHeight(), 0);
                        }}
                        className="text-sm resize-none"
                        placeholder="Edit your comment..."
                      />
                      <div className="flex items-center gap-2">
                        <Button size="sm" onClick={handleSaveEdit}>
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
                      {comment.content}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New comment form */}
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 mt-1">
          <AvatarImage src={currentUserProfile?.avatar_url || ""} />
          <AvatarFallback className="text-xs">
            {currentUserInitials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2">
          <Textarea
            ref={newCommentRef}
            value={newComment}
            onChange={(e) => {
              setNewComment(e.target.value);
              setTimeout(() => adjustNewHeight(), 0);
            }}
            placeholder="Write a comment..."
            className="text-sm resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleSubmitComment();
              }
            }}
          />
          
          <div className="flex justify-end">
            <Button 
              size="sm"
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || isSubmitting}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Send className="h-3 w-3 mr-1" />
              {isSubmitting ? 'Posting...' : 'Comment'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
