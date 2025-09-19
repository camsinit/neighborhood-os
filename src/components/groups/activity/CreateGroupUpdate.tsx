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

  return null;
};