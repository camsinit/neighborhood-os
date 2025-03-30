
/**
 * Hook to handle updating a skill and ensuring activities are updated too
 */
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface SkillUpdateOptions {
  onSuccess?: () => void;
}

export const useSkillUpdate = (options?: SkillUpdateOptions) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const queryClient = useQueryClient();

  const updateSkillTitle = async (skillId: string, newTitle: string) => {
    if (!skillId || !newTitle) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("[useSkillUpdate] Attempting to update skill title:", {
        skillId,
        newTitle,
        timestamp: new Date().toISOString()
      });

      // Update the skill in the skills_exchange table
      const { error: updateError } = await supabase
        .from('skills_exchange')
        .update({ title: newTitle })
        .eq('id', skillId);

      if (updateError) {
        console.error("[useSkillUpdate] Error updating skill:", updateError);
        throw updateError;
      }

      // Now call the edge function to update activities
      const { error: functionError } = await supabase.functions.invoke('notify-skills-changes', {
        body: {
          skillId,
          action: 'update',
          skillTitle: newTitle,
          changes: 'Skill title updated'
        }
      });

      if (functionError) {
        console.error("[useSkillUpdate] Error calling notify-skills-changes function:", functionError);
        throw functionError;
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['skills-exchange'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });

      // Dispatch custom event for any component that's listening
      window.dispatchEvent(new Event('skill-update-submitted'));

      // Call onSuccess if provided
      if (options?.onSuccess) {
        options.onSuccess();
      }

      toast.success("Skill title updated successfully");
      return true;
    } catch (err) {
      console.error("[useSkillUpdate] Error:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      toast.error("Failed to update skill title");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateSkillTitle,
    isLoading,
    error
  };
};
