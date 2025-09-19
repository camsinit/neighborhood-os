/**
 * Inline Update Form Component
 * 
 * A simple inline form for creating group updates that appears
 * directly in the timeline below the action buttons.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@supabase/auth-helpers-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X, ArrowUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CreateGroupUpdateData } from '@/types/groupUpdates';

interface InlineUpdateFormProps {
  groupId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const InlineUpdateForm: React.FC<InlineUpdateFormProps> = ({
  groupId,
  onClose,
  onSuccess
}) => {
  // State for form fields
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  // Refs and hooks
  const titleRef = useRef<HTMLInputElement>(null);
  const user = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Auto-focus title field when component mounts
  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  // Create update mutation
  const createUpdateMutation = useMutation({
    mutationFn: async (data: CreateGroupUpdateData) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('group_updates')
        .insert({
          group_id: data.group_id,
          user_id: user.id,
          title: data.title,
          content: data.content,
          image_urls: data.image_urls || []
        });

      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate queries to refresh the timeline
      queryClient.invalidateQueries({ queryKey: ['group-timeline', groupId] });
      toast({
        title: "Update posted!",
        description: "Your update has been shared with the group.",
      });
      onSuccess();
    },
    onError: (error) => {
      console.error('Error creating update:', error);
      toast({
        title: "Error posting update",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  });

  // Handle form submission
  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in both title and content.",
        variant: "destructive",
      });
      return;
    }

    if (title.length > 25) {
      toast({
        title: "Title too long",
        description: "Title must be 25 characters or less.",
        variant: "destructive",
      });
      return;
    }

    createUpdateMutation.mutate({
      group_id: groupId,
      title: title.trim(),
      content: content.trim(),
      image_urls: []
    });
  };

  // Handle escape key to close form
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div 
      className="bg-background border rounded-lg p-4 mb-4 space-y-3 shadow-sm"
      onKeyDown={handleKeyDown}
    >
      {/* Header with close button */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Create Update</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-6 w-6 p-0"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>

      {/* Title field */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-medium">Title</label>
          <span className={`text-xs ${title.length > 20 ? 'text-destructive' : 'text-muted-foreground'}`}>
            {title.length}/25
          </span>
        </div>
        <Input
          ref={titleRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Brief title for your update..."
          maxLength={25}
          className="h-8 text-sm"
        />
      </div>

      {/* Content field */}
      <div>
        <label className="text-xs font-medium mb-1 block">Content</label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share an update with the group..."
          rows={3}
          className="text-sm resize-none"
        />
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={onClose}
          className="h-8"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!title.trim() || !content.trim() || createUpdateMutation.isPending}
          size="sm"
          className="h-8 bg-purple-600 hover:bg-purple-700 text-white"
        >
          {createUpdateMutation.isPending ? (
            'Posting...'
          ) : (
            <div className="flex items-center">
              <ArrowUp className="w-3 h-3 mr-1" />
              Post
            </div>
          )}
        </Button>
      </div>
    </div>
  );
};