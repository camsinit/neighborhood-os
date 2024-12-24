import { useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

interface SafetyUpdateCommentProps {
  comment: Comment;
  updateId: string;
}

export const SafetyUpdateComment = ({ comment, updateId }: SafetyUpdateCommentProps) => {
  const user = useUser();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);

  const updateCommentMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("safety_update_comments")
        .update({ content: editedContent })
        .eq("id", comment.id);

      if (error) throw error;
    },
    onSuccess: () => {
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["safety-update-comments", updateId] });
      toast.success("Comment updated successfully");
    },
    onError: () => {
      toast.error("Failed to update comment");
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("safety_update_comments")
        .delete()
        .eq("id", comment.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["safety-update-comments", updateId] });
      toast.success("Comment deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete comment");
    },
  });

  const handleSave = () => {
    if (!editedContent.trim()) return;
    updateCommentMutation.mutate();
  };

  const isOwner = user?.id === comment.user_id;

  return (
    <div className="flex gap-4">
      <Avatar className="h-8 w-8">
        <AvatarImage 
          src={comment.profiles.avatar_url || ''} 
          alt={comment.profiles.display_name || 'User'} 
        />
        <AvatarFallback>
          <User className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="min-h-[80px]"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(false)}
                className="hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={updateCommentMutation.isPending}
                className="hover:bg-gray-100"
              >
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex justify-between items-start">
              <p className="font-medium text-sm">
                {comment.profiles.display_name}
              </p>
              {isOwner && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteCommentMutation.mutate()}
                    className="text-gray-500 hover:text-red-600"
                    disabled={deleteCommentMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-700">{comment.content}</p>
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          {new Date(comment.created_at).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};