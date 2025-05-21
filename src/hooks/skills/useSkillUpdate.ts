
/**
 * Hook to handle updating a skill and ensuring activities are updated too
 */
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useUser } from "@supabase/auth-helpers-react";
import * as skillsService from "@/services/skills/skillsService";
import { toast } from "sonner";
import { refreshEvents } from "@/utils/refreshEvents";

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
  const user = useUser();

  /**
   * Updates a skill's title and ensures activities are updated too
   * 
   * @param skillId - The ID of the skill to update
   * @param newTitle - The new title for the skill
   * @returns Promise resolving to true if successful, false otherwise
   */
  const updateSkillTitle = async (skillId: string, newTitle: string) => {
    // Validate input parameters
    if (!skillId || !newTitle || !user) {
      return false;
    }

    // Reset state before operations
    setIsLoading(true);
    setError(null);

    try {
      // Using the skillsService to update the skill
      await skillsService.updateSkill(skillId, { title: newTitle }, user.id);

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['skills-exchange'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });

      // Dispatch custom event for any component that's listening
      window.dispatchEvent(new Event('skill-update-submitted'));
      
      // Add refresh event for activities feed using our central system
      refreshEvents.skills();

      // Call onSuccess if provided
      if (options?.onSuccess) {
        options.onSuccess();
      }

      toast.success("Skill title updated successfully");
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      toast.error("Failed to update skill title");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Deletes a skill and ensures activities are properly handled
   * Also checks for existing skill sessions and handles errors gracefully
   * 
   * @param skillId - The ID of the skill to delete
   * @param skillTitle - The title of the skill being deleted (for notifications)
   * @returns Promise resolving to true if successful, false otherwise
   */
  const deleteSkill = async (skillId: string, skillTitle: string) => {
    if (!skillId || !user) {
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Using the skillsService to delete the skill
      const result = await skillsService.deleteSkill(skillId, skillTitle, user.id);
      
      if (result.error) {
        // Check for specific foreign key constraint error
        if (result.error.code === '23503' && result.error.details?.includes('skill_sessions')) {
          toast.error("Cannot delete this skill because it has active skill sessions. Please cancel those sessions first.");
          return false;
        }
        
        // Generic error handling
        throw new Error(result.error.message || 'Failed to delete skill');
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['skills-exchange'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });

      // Dispatch custom event for any component that's listening
      window.dispatchEvent(new CustomEvent('skill-deleted', {
        detail: { id: skillId }
      }));
      
      // Add refresh event for activities feed using our central system
      refreshEvents.skills();

      // Call onSuccess if provided
      if (options?.onSuccess) {
        options.onSuccess();
      }

      toast.success("Skill deleted successfully");
      return true;
    } catch (err) {
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
