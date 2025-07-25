
import React, { useState } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { 
  User, 
  MessageSquare, 
  Edit, 
  Trash2, 
  Send,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { 
  useSafetyComments, 
  useCreateComment, 
  useUpdateComment, 
  useDeleteComment,
  SafetyComment 
} from "@/hooks/useSafetyComments";
import { useAutoResizeTextarea } from "@/components/hooks/use-auto-resize-textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SafetyCommentsProps {
  safetyUpdateId: string;
  className?: string;
}

/**
 * Individual Comment Component with inline editing
 */
const CommentItem: React.FC<{
  comment: SafetyComment;
  onEdit: (commentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
  isEditing: boolean;
  isOwner: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}> = ({ comment, onEdit, onDelete, isEditing, isOwner, isUpdating, isDeleting }) => {
  const [editContent, setEditContent] = useState(comment.content);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const handleSaveEdit = () => {
    if (editContent.trim() !== comment.content) {
      onEdit(comment.id, editContent);
    }
    setIsEditMode(false);
  };

  const handleCancelEdit = () => {
    setEditContent(comment.content);
    setIsEditMode(false);
  };

  const handleDelete = () => {
    onDelete(comment.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <div className="flex gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage src={comment.profiles?.avatar_url || ''} />
          <AvatarFallback className="bg-blue-100">
            <User className="h-5 w-5 text-blue-600" />
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="font-semibold text-gray-900 text-sm">
                {comment.profiles?.display_name || 'Anonymous'}
              </p>
              <p className="text-xs text-gray-500">
                {format(new Date(comment.created_at), 'MMM d, yyyy • h:mm a')}
              </p>
            </div>
            
            {isOwner && !isEditMode && (
              <div className="flex gap-1 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditMode(true)}
                  disabled={isEditing || isUpdating}
                  className="h-7 w-7 p-0 hover:bg-gray-200"
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isEditing || isDeleting}
                  className="h-7 w-7 p-0 hover:bg-red-100 hover:text-red-600"
                >
                  {isDeleting ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Trash2 className="h-3 w-3" />
                  )}
                </Button>
              </div>
            )}
          </div>
          
          {isEditMode ? (
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[80px] text-sm"
                placeholder="Write your comment..."
                disabled={isUpdating}
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelEdit}
                  disabled={isUpdating}
                  className="h-8"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveEdit}
                  disabled={isUpdating || !editContent.trim() || editContent.trim() === comment.content}
                  className="h-8"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      Saving...
                    </>
                  ) : (
                    'Save'
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {comment.content}
            </p>
          )}
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

/**
 * Main SafetyComments Component
 * Unified component that replaces both SafetyUpdateComments and SafetyUpdateComment
 */
export const SafetyComments: React.FC<SafetyCommentsProps> = ({ 
  safetyUpdateId, 
  className = "" 
}) => {
  const user = useUser();
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  
  // Auto-resize textarea hook with reduced min height
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({ 
    minHeight: 50, 
    maxHeight: 200 
  });

  // Fetch current user's profile for avatar
  const { data: currentUserProfile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('avatar_url, display_name')
        .eq('id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  // Use our custom hooks
  const { data: comments = [], isLoading, error } = useSafetyComments(safetyUpdateId);
  const createCommentMutation = useCreateComment(safetyUpdateId);
  const updateCommentMutation = useUpdateComment(safetyUpdateId);
  const deleteCommentMutation = useDeleteComment(safetyUpdateId);

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user) return;

    await createCommentMutation.mutateAsync(newComment);
    setNewComment('');
  };

  const handleEditComment = async (commentId: string, content: string) => {
    setEditingCommentId(commentId);
    await updateCommentMutation.mutateAsync({ commentId, content });
    setEditingCommentId(null);
  };

  const handleDeleteComment = async (commentId: string) => {
    await deleteCommentMutation.mutateAsync(commentId);
  };

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Failed to load comments. Please try again.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with comment count */}
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-gray-600" />
        <h3 className="font-semibold text-lg text-gray-900">
          Comments {comments.length > 0 && (
            <span className="text-sm font-normal text-gray-500">
              ({comments.length})
            </span>
          )}
        </h3>
      </div>

      {/* Comments List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 p-4 bg-gray-50 rounded-lg animate-pulse">
                <div className="h-10 w-10 bg-gray-200 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <p className="text-sm">No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onEdit={handleEditComment}
              onDelete={handleDeleteComment}
              isEditing={editingCommentId === comment.id}
              isOwner={user?.id === comment.user_id}
              isUpdating={updateCommentMutation.isPending}
              isDeleting={deleteCommentMutation.isPending}
            />
          ))
        )}
      </div>

      {/* Comment Form */}
      {user && (
        <Card className="border-gray-200">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage src={currentUserProfile?.avatar_url || ''} />
                <AvatarFallback className="bg-blue-100">
                  <User className="h-5 w-5 text-blue-600" />
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-3">
                <Textarea
                  ref={textareaRef}
                  placeholder="Share a comment"
                  value={newComment}
                  onChange={(e) => {
                    setNewComment(e.target.value);
                    adjustHeight();
                  }}
                  className="min-h-[50px] resize-none"
                  disabled={createCommentMutation.isPending}
                />
                
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500">
                    {newComment.length}/500 characters
                  </p>
                  <Button
                    onClick={handleSubmitComment}
                    disabled={
                      createCommentMutation.isPending || 
                      !newComment.trim() || 
                      newComment.length > 500
                    }
                    className="bg-red-500 hover:bg-red-600"
                  >
                    {createCommentMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Post Comment
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!user && (
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="p-4">
            <p className="text-center text-gray-600">
              Please sign in to join the conversation
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SafetyComments;
