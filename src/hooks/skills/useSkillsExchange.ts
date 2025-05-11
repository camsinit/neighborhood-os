
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { SkillFormData } from "@/components/skills/types/skillFormTypes";
import { useCurrentNeighborhood } from "@/hooks/useCurrentNeighborhood";
import { dispatchRefreshEvent } from "@/utils/refreshEvents"; // Using the correct import
import * as skillsService from "@/services/skills/skillsService"; // Added import for the skills service

/**
 * Interface defining the props for the skills exchange hook
 * @property onSuccess - Callback function to be called when skill operations succeed
 */
interface SkillsExchangeProps {
  onSuccess: () => void;
}

/**
 * Custom hook for submitting skills exchange requests and offers
 * 
 * This hook provides methods to submit new skills or update existing ones
 * and handles refreshing the UI after changes
 */
export const useSkillsExchange = ({ onSuccess }: SkillsExchangeProps) => {
  // Get current user, query client, and neighborhood context
  const user = useUser();
  const queryClient = useQueryClient();
  const neighborhood = useCurrentNeighborhood();

  /**
   * Calls the edge function to notify about skill changes and create activities
   * 
   * @param skillId - The ID of the skill that changed
   * @param action - The type of change that occurred
   * @param data - Additional data about the skill
   */
  const notifySkillChanges = async (
    skillId: string, 
    action: 'create' | 'update' | 'delete' | 'request',
    data: {
      skillTitle: string;
      providerId?: string;
      requesterId?: string;
      neighborhoodId?: string;
      description?: string;
      category?: string;
      requestType?: string;
    }
  ) => {
    try {
      // Log the notification attempt
      console.log(`[useSkillsExchange] Notifying skill changes:`, { 
        skillId, 
        action, 
        ...data,
        timestamp: new Date().toISOString()
      });

      // Call the edge function
      const response = await fetch('/functions/v1/notify-skills-changes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skillId,
          action,
          ...data
        }),
      });

      if (!response.ok) {
        throw new Error(`Error notifying skill changes: ${response.status}`);
      }

      console.log(`[useSkillsExchange] Successfully notified skill changes for ${action}`);
      return await response.json();
    } catch (error) {
      console.error('[useSkillsExchange] Error notifying skill changes:', error);
      // We don't throw here to prevent breaking the main flow
    }
  };

  /**
   * Submits a new skill exchange (offer or request)
   * 
   * @param formData - The form data containing skill details 
   * @param mode - Whether this is an 'offer' or 'request'
   * @returns Promise with the created data or undefined on failure
   */
  const handleSubmit = async (formData: Partial<SkillFormData>, mode: 'offer' | 'request') => {
    // Validate required data
    if (!user) {
      toast.error("You must be logged in to create a skill exchange");
      return;
    }

    // Check if we have a neighborhood ID
    if (!neighborhood?.id) {
      toast.error("You must be part of a neighborhood to create a skill exchange");
      return;
    }

    if (!formData.title) {
      toast.error("Title is required");
      return;
    }

    try {
      // Add detailed logging before submission
      console.log("[useSkillsExchange] Submitting skill exchange:", {
        userId: user.id,
        neighborhoodId: neighborhood.id,
        mode,
        formData: { 
          title: formData.title,
          description: formData.description?.substring(0, 20) + '...',
          category: formData.category
        },
        timestamp: new Date().toISOString()
      });

      // Use the service layer to create the skill
      const data = await skillsService.createSkill(
        formData,
        mode,
        user.id,
        neighborhood.id
      );

      // Log success information
      console.log("[useSkillsExchange] Skill exchange created successfully:", {
        skillId: data?.[0]?.id,
        title: formData.title,
        userId: user.id,
        neighborhoodId: neighborhood.id,
        timestamp: new Date().toISOString()
      });

      // Create an activity for this skill using the edge function
      if (data && data.length > 0) {
        await notifySkillChanges(
          data[0].id, 
          'create', 
          {
            skillTitle: formData.title,
            providerId: mode === 'offer' ? user.id : undefined,
            requesterId: mode === 'request' ? user.id : undefined,
            neighborhoodId: neighborhood.id,
            description: formData.description,
            category: formData.category,
            requestType: mode === 'offer' ? 'offer' : 'need'
          }
        );
      }

      // Dispatch refresh events - ensure skill updates trigger activity feed refresh
      dispatchRefreshEvent('skills-updated');
      
      // Also invalidate the queries directly to ensure immediate refresh
      queryClient.invalidateQueries({ queryKey: ['skills-exchange'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      
      // Show success message to the user
      toast.success(mode === 'offer' ? 'Skill offered successfully!' : 'Skill request submitted successfully!');
      
      // Call the onSuccess callback to close dialogs, etc.
      onSuccess();
      
      return data;
    } catch (error: any) {
      // Enhanced error logging
      console.error('[useSkillsExchange] Error creating skill exchange:', {
        error: {
          message: error.message,
          details: error.details || null,
          hint: error.hint || null,
          code: error.code || null,
          stack: error.stack || null
        },
        formData: {
          title: formData.title,
          category: formData.category
        },
        userId: user.id,
        neighborhoodId: neighborhood.id,
        timestamp: new Date().toISOString()
      });
      
      // User-friendly error message with more details
      toast.error(`Failed to create skill exchange: ${error.message || "Unknown error"}. Please try again.`);
      throw error;
    }
  };

  /**
   * Updates an existing skill exchange
   * 
   * @param skillId - ID of the skill to update
   * @param formData - The updated form data
   * @param mode - Whether this is an 'offer' or 'request'
   * @returns Promise resolving when update completes
   */
  const handleUpdate = async (skillId: string, formData: Partial<SkillFormData>, mode: 'offer' | 'request') => {
    if (!user) {
      toast.error("You must be logged in to update a skill exchange");
      return;
    }

    if (!formData.title) {
      toast.error("Title is required");
      return;
    }

    try {
      // Use service layer to update the skill
      await skillsService.updateSkill(skillId, formData, user.id);
      
      // Notify about skill update to update related activities
      await notifySkillChanges(skillId, 'update', {
        skillTitle: formData.title
      });

      // Dispatch refresh events using the single dispatch function
      dispatchRefreshEvent('skills-updated');
      
      // Also invalidate the queries directly to ensure immediate refresh
      queryClient.invalidateQueries({ queryKey: ['skills-exchange'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      
      toast.success('Skill exchange updated successfully!');
      onSuccess();
    } catch (error: any) {
      console.error('Error updating skill exchange:', error);
      toast.error(`Failed to update skill exchange: ${error.message || "Unknown error"}`);
      throw error;
    }
  };

  return { handleSubmit, handleUpdate };
};
