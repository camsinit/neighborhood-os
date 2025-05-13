
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { SkillFormData } from "@/components/skills/types/skillFormTypes";
import { useCurrentNeighborhood } from "@/hooks/useCurrentNeighborhood";
import { refreshEvents } from "@/utils/refreshEvents";
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
   * Helper function to trigger notifications for skill requests
   * This ensures skill requests are properly notified to providers
   */
  const notifySkillRequest = async (skillId: string, skillTitle: string, providerId: string, requesterId: string) => {
    try {
      logger.debug('Triggering notification for skill request:', {
        skillId,
        skillTitle,
        providerId,
        requesterId
      });
      
      // Call the Edge Function to create the notification
      const { error } = await supabase.functions.invoke('notify-skills-changes', {
        body: {
          action: 'request',
          skillId,
          skillTitle,
          providerId,
          requesterId
        }
      });
      
      if (error) {
        logger.error('Error notifying skill request:', error);
      } else {
        logger.debug('Successfully sent skill request notification');
      }
    } catch (err) {
      logger.error('Exception in notifySkillRequest:', err);
      // Don't throw from here - we don't want to break the main flow
      // if notifications fail
    }
  };

  /**
   * Submits a new skill exchange (offer or request)
   * The database trigger handles activity creation
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
      refreshEvents.skills();
      
      // Also invalidate the queries directly to ensure fresh data
      logger.debug("Invalidating queries to refresh UI");
      queryClient.invalidateQueries({ queryKey: ['skills-exchange'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      
      // Also invalidate notifications to show any new notifications
      logger.debug("Invalidating notifications queries");
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      
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

      // Use the refreshEvents system to notify listeners
      logger.debug("Dispatching skills-updated event after update");
      refreshEvents.skills();
      
      // Also invalidate the queries directly to ensure immediate refresh
      logger.debug("Manually invalidating queries after update");
      queryClient.invalidateQueries({ queryKey: ['skills-exchange'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      
      toast.success('Skill exchange updated successfully!');
      onSuccess();
    } catch (error: any) {
      logger.error('Error updating skill exchange:', error);
      toast.error(`Failed to update skill exchange: ${error.message || "Unknown error"}`);
      throw error;
    }
  };

  return { handleSubmit, handleUpdate, notifySkillRequest };
};
