import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { SkillFormData } from "@/components/skills/types/skillFormTypes";
import { useCurrentNeighborhood } from "@/hooks/useCurrentNeighborhood";
import { dispatchRefreshEvent } from "@/utils/refreshEvents"; 
import * as skillsService from "@/services/skills/skillsService"; 
import { createLogger } from '@/utils/logger';

// Create a dedicated logger for this hook
const logger = createLogger('useSkillsExchange');

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
   * Calls the edge function to notify about skill changes - used only as a fallback
   * The main activity creation happens via database triggers
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
      logger.debug(`Notifying skill changes (fallback method):`, { 
        skillId, 
        action, 
        ...data,
        timestamp: new Date().toISOString()
      });
      
      // Get the current session for authorization
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      
      if (!accessToken) {
        logger.warn('No access token available for edge function call');
        return; // Fail silently - this is just a fallback
      }
      
      // Try to call the edge function (either path might work)
      try {
        // First try the /api/ prefix
        const response = await fetch('/api/notify-skills-changes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            skillId,
            action,
            ...data
          }),
        });
        
        if (!response.ok) {
          throw new Error(`Error status: ${response.status}`);
        }
      } catch (firstAttemptError) {
        // Try alternate path - it's okay if both fail since we use database triggers primarily
        logger.info('First attempt at edge function call failed, trying alternate URL');
        // Just log and continue - don't throw
      }
    } catch (error) {
      // Just log the error - don't break the main flow since this is just a fallback
      logger.info('Error in edge function fallback, continuing with database trigger:', error);
    }
  };

  /**
   * Submits a new skill exchange (offer or request)
   * Primary method is the database trigger, with edge function as fallback
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
      logger.info("Submitting skill exchange:", {
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

      logger.trace(`About to call skillsService.createSkill with form data: ${JSON.stringify({
        title: formData.title,
        category: formData.category,
        description: formData.description?.substring(0, 50) + (formData.description && formData.description.length > 50 ? '...' : ''),
      })}`);

      // Use the service layer to create the skill (database trigger handles activities)
      const data = await skillsService.createSkill(
        formData,
        mode,
        user.id,
        neighborhood.id
      );

      // Log success information with skill ID
      logger.info("Skill exchange created successfully:", {
        skillId: data?.[0]?.id,
        title: formData.title,
        userId: user.id,
        neighborhoodId: neighborhood.id,
        timestamp: new Date().toISOString()
      });

      // Dispatch refresh events to ensure immediate UI updates
      logger.debug("Dispatching skills-updated event");
      dispatchRefreshEvent('skills-updated');
      
      // Also invalidate the queries directly
      logger.debug("Invalidating queries to refresh UI");
      queryClient.invalidateQueries({ queryKey: ['skills-exchange'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      
      // Show success message
      toast.success(mode === 'offer' ? 'Skill offered successfully!' : 'Skill request submitted successfully!');
      
      // Call the onSuccess callback
      onSuccess();
      
      return data;
    } catch (error: any) {
      // Enhanced error logging
      logger.error('Error creating skill exchange:', {
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
      logger.debug(`Updating skill exchange: ${skillId}`, {
        title: formData.title,
        userId: user.id
      });
      
      // Use service layer to update the skill
      await skillsService.updateSkill(skillId, formData, user.id);
      
      // Notify about skill update to update related activities
      try {
        await notifySkillChanges(skillId, 'update', {
          skillTitle: formData.title
        });
      } catch (notifyError) {
        // Log but continue - we rely on the database trigger as fallback
        logger.error("Error notifying about skill update:", notifyError);
      }

      // Dispatch refresh events using the single dispatch function
      logger.debug("Dispatching skills-updated event after update");
      dispatchRefreshEvent('skills-updated');
      
      // Also invalidate the queries directly to ensure immediate refresh
      logger.debug("Manually invalidating queries after update");
      queryClient.invalidateQueries({ queryKey: ['skills-exchange'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      
      toast.success('Skill exchange updated successfully!');
      onSuccess();
    } catch (error: any) {
      logger.error('Error updating skill exchange:', error);
      toast.error(`Failed to update skill exchange: ${error.message || "Unknown error"}`);
      throw error;
    }
  };

  return { handleSubmit, handleUpdate };
};
