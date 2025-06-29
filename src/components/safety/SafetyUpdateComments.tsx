import React, { useState, useEffect } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { createLogger } from '@/utils/logger';

// Replace line 11 with:
import { unifiedEvents } from '@/utils/unifiedEventSystem';
import { createLogger } from '@/utils/logger';

// Create a logger for this component
const logger = createLogger('SafetyUpdateComments');

export interface Comment {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  profiles?: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface SafetyUpdateCommentsProps {
  updateId: string;
}

export function SafetyUpdateComments({ updateId }: SafetyUpdateCommentsProps) {
  const user = useUser();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Fetch comments for this update
  useEffect(() => {
    async function fetchComments() {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('safety_update_comments')
          .select(`
            *,
            profiles:user_id (
              display_name,
              avatar_url
            )
          `)
          .eq('safety_update_id', updateId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        
        setComments(data || []);
      } catch (error) {
        console.error('Error fetching comments:', error);
        toast.error('Failed to load comments');
      } finally {
        setIsLoading(false);
      }
    }

    if (updateId) {
      fetchComments();
    }
  }, [updateId]);

  // Submit a new comment
  const handleSubmitComment = async () => {
    if (!user) {
      toast.error('You must be logged in to comment');
      return;
    }

    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    try {
      setIsSending(true);

      // Insert the comment - the database trigger will handle notification
      const { data, error } = await supabase
        .from('safety_update_comments')
        .insert({
          content: newComment,
          safety_update_id: updateId,
          user_id: user.id
        })
        .select(`
          *,
          profiles:user_id (
            display_name,
            avatar_url
          )
        `);

      if (error) throw error;

      // Add the new comment to state
      if (data && data[0]) {
        setComments([...comments, data[0]]);
        setNewComment('');
        
        // Trigger a refresh of notifications
        unifiedEvents.emit('notifications');
        logger.debug('Comment added successfully, database trigger will handle notification');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('Failed to post comment');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-4 mt-4">
      <h3 className="font-semibold">Comments</h3>
      
      {isLoading ? (
        <div className="text-center py-4">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="text-center py-4 text-gray-500">No comments yet</div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 pb-4 border-b border-gray-100">
              <Avatar className="h-8 w-8">
                <AvatarImage src={comment.profiles?.avatar_url || ''} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex justify-between">
                  <p className="font-medium">{comment.profiles?.display_name || 'Anonymous'}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(comment.created_at), 'MMM d, yyyy • h:mm a')}
                  </p>
                </div>
                <p className="mt-1 text-sm">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {user && (
        <div className="pt-4">
          <Textarea 
            placeholder="Write a comment..." 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex justify-end mt-2">
            <Button 
              onClick={handleSubmitComment} 
              disabled={isSending || !newComment.trim()}
              className="bg-amber-500 hover:bg-amber-600"
            >
              {isSending ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
