
/**
 * Hook to handle updating a skill and ensuring activities are updated too
 * 
 * This hook provides methods to update or delete skills while keeping
 * related activities in sync through edge function calls
 */
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

// Define the options interface for configuration
interface SkillUpdateOptions {
  onSuccess?: () => void;
}

/**
 * Custom hook for updating and deleting skills while keeping activities in sync
 * 
 * @param options - Optional configuration like success callbacks
 * @returns Object with methods to update skill titles and delete skills
 */
export const useSkillUpdate = (options?: SkillUpdateOptions) => {
  // State for tracking loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const queryClient = useQueryClient();

  /**
   * Updates a skill's title and ensures activities are updated too
   * 
   * @param skillId - The ID of the skill to update
   * @param newTitle - The new title for the skill
   * @returns Promise resolving to true if successful, false otherwise
   */
  const updateSkillTitle = async (skillId: string, newTitle: string) => {
    // Validate input parameters
    if (!skillId || !newTitle) {
      return false;
    }

    // Reset state before operations
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

  /**
   * Deletes a skill and ensures activities are properly handled
   * 
   * @param skillId - The ID of the skill to delete
   * @param skillTitle - The title of the skill being deleted (for notifications)
   * @returns Promise resolving to true if successful, false otherwise
   */
  const deleteSkill = async (skillId: string, skillTitle: string) => {
    if (!skillId) {
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("[useSkillUpdate] Attempting to delete skill:", {
        skillId,
        skillTitle,
        timestamp: new Date().toISOString()
      });

      // Delete the skill from the database
      const { error: deleteError } = await supabase
        .from('skills_exchange')
        .delete()
        .eq('id', skillId);

      if (deleteError) {
        console.error("[useSkillUpdate] Error deleting skill:", deleteError);
        throw deleteError;
      }

      // Call the edge function to update activities
      const { error: functionError } = await supabase.functions.invoke('notify-skills-changes', {
        body: {
          skillId,
          action: 'delete',
          skillTitle,
          changes: 'Skill deleted'
        }
      });

      if (functionError) {
        console.error("[useSkillUpdate] Error calling notify-skills-changes function:", functionError);
        // Non-critical error, we don't fail the whole operation
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['skills-exchange'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });

      // Dispatch custom event for any component that's listening
      window.dispatchEvent(new CustomEvent('skill-deleted', {
        detail: { id: skillId }
      }));

      // Call onSuccess if provided
      if (options?.onSuccess) {
        options.onSuccess();
      }

      toast.success("Skill deleted successfully");
      return true;
    } catch (err) {
      console.error("[useSkillUpdate] Error:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      toast.error("Failed to delete skill");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateSkillTitle,
    deleteSkill,
    isLoading,
    error
  };
};
