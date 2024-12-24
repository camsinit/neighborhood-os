import { useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { toast } from "sonner";

interface Comment {
  id: string;
  content: string;
  created_at: string;
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
            <div key={comment.id} className="flex gap-4">
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
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="font-medium text-sm">
                    {comment.profiles.display_name}
                  </p>
                  <p className="text-sm text-gray-700">{comment.content}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(comment.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
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