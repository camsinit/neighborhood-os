/**
 * Create Group Update Overlay Component
 * 
 * Expandable overlay for creating new group updates with:
 * - Title field (25 char limit)
 * - Content field (unlimited)
 * - Image upload capability
 * - Smooth animations and auto-focus
 */

import React, { useState, useRef, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@supabase/auth-helpers-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X, ArrowUp, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CreateGroupUpdateData } from '@/types/groupUpdates';

interface CreateGroupUpdateProps {
  groupId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateGroupUpdate: React.FC<CreateGroupUpdateProps> = ({
  groupId,
  onClose,
  onSuccess
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  
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
      image_urls: imageUrls
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div 
      className="bg-background border-t p-3 space-y-3"
      onKeyDown={handleKeyDown}
    >
      {/* Compact Header */}
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

      {/* Compact Title Field */}
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
          placeholder="Brief title..."
          maxLength={25}
          className="h-8 text-sm focus:ring-purple-500 focus:border-purple-500"
        />
      </div>

      {/* Compact Content Field */}
      <div>
        <label className="text-xs font-medium mb-1 block">Content</label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share an update..."
          rows={3}
          className="text-sm focus:ring-purple-500 focus:border-purple-500 resize-none"
        />
      </div>

      {/* Compact Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={!title.trim() || !content.trim() || createUpdateMutation.isPending}
        size="sm"
        className="w-full bg-purple-600 hover:bg-purple-700 text-white h-8"
      >
        {createUpdateMutation.isPending ? (
          'Posting...'
        ) : (
          <div className="flex items-center justify-center">
            <ArrowUp className="w-3 h-3 mr-1" />
            Post
          </div>
        )}
      </Button>
    </div>
  );
};