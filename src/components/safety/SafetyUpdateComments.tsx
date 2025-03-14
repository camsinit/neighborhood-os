import { useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { SafetyUpdateComment } from "./SafetyUpdateComment";

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

export const SafetyUpdateComments = ({ updateId }: { updateId: string }) => {
  const user = useUser();
  const [comment, setComment] = useState("");
  const queryClient = useQueryClient();

  const { data: comments, isLoading } = useQuery({
    queryKey: ["safety-update-comments", updateId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("safety_update_comments")
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles (
            display_name,
            avatar_url
          )
        `)
        .eq("safety_update_id", updateId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as Comment[];
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("safety_update_comments")
        .insert({
          safety_update_id: updateId,
          user_id: user?.id,
          content: comment,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["safety-update-comments", updateId] });
      toast.success("Comment added successfully");
    },
    onError: () => {
      toast.error("Failed to add comment");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    addCommentMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div className="border-t pt-6">
        <h3 className="font-semibold mb-4">Comments</h3>
        <div className="space-y-4">
          {comments?.map((comment) => (
            <SafetyUpdateComment 
              key={comment.id} 
              comment={comment}
              updateId={updateId}
            />
          ))}
        </div>
      </div>
      {user && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Add a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[80px]"
          />
          <div className="flex justify-end">
            <Button 
              type="submit"
              disabled={!comment.trim() || addCommentMutation.isPending}
              className="hover:bg-gray-100"
            >
              {addCommentMutation.isPending ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};