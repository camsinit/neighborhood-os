
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner'; // Updated import for toast
import { TimeSlot } from './TimeSlotSelector';
import { LocationPreference } from './LocationSelector';
import { validateTimeSlots } from '@/utils/timeslotUtils';
import { createSkillSessionWithTimeSlots } from './services/contributionService';
import refreshEvents from '@/utils/refreshEvents';
import { useQueryClient } from '@tanstack/react-query';
import { sendSkillConfirmationNotifications } from '@/utils/notifications/skillNotifications';

/**
 * Hook for handling skill contribution submission
 * 
 * This hook has been refactored to:
 * 1. Use separate validation and service functions
 * 2. Improve error handling and logging
 * 3. Separate concerns for better maintainability
 * 4. Use our new Edge Function for notifications
 */
export const useContributionSubmit = (
  skillRequestId: string,
  requesterId: string,
  onSuccess: () => void
) => {
  // State and hooks
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  /**
   * Submit a skill contribution offer
   */
  const submitContribution = async (
    selectedTimeSlots: TimeSlot[],
    location: LocationPreference,
    locationDetails: string,
    addToProfile: boolean
  ) => {
    // Log submission input
    console.log("CONTRIBUTION SUBMIT - Input time slots:", JSON.stringify(selectedTimeSlots, null, 2));
    
    // Validate time slots - require at least 1 date with time preferences
    const validation = validateTimeSlots(selectedTimeSlots);
    if (!validation.isValid) {
      toast.error(validation.message);
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Get current user
      const currentUser = await supabase.auth.getUser();
      const providerId = currentUser.data.user?.id;
      
      if (!providerId) {
        throw new Error("User not authenticated");
      }
      
      // Log provider ID for context
      console.log("Current user details:", {
        userId: providerId,
        providerId: providerId === requesterId ? "WARNING: Provider is the same as requester!" : "Provider differs from requester",
      });
      
      // Create the skill session with time slots in a single transaction
      const result = await createSkillSessionWithTimeSlots(
        skillRequestId,
        requesterId,
        providerId,
        location,
        locationDetails,
        selectedTimeSlots
      );

      // Extract the session ID from the result
      const sessionId = result?.sessionId;
      
      // Get skill title for the notification
      const { data: skillData } = await supabase
        .from('skills_exchange')
        .select('title')
        .eq('id', skillRequestId)
        .single();
      
      const skillTitle = skillData?.title || "skill session";
      
      // ✨ New: Send notifications via Edge Function
      await sendSkillConfirmationNotifications(
        skillRequestId,
        skillTitle,
        providerId,
        requesterId,
        sessionId,
        new Date().toISOString() // Use current time as session time for now
      );

      // Optionally add skill to user profile
      if (addToProfile) {
        console.log("Adding skill to user profile");
        // Implementation would go here
      }

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['skills-exchange'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      
      // Trigger notification refresh events
      refreshEvents.notifications();
      refreshEvents.skills();
      
      // Dispatch DOM events for listeners
      window.dispatchEvent(new CustomEvent('notification-created'));
      window.dispatchEvent(new CustomEvent('skills-updated'));

      // Show success message
      toast.success("Skill contribution offered. The requester will be notified to schedule a time.");
      
      // Close the dialog
      onSuccess();
    } catch (error: any) {
      // Enhanced error logging
      console.error('Error creating skill session:', error);
      console.error('Error creating skill session context:', {
        skillRequestId,
        requesterId,
        errorMessage: error.message,
        errorCode: error.code,
        errorDetails: error.details,
        errorHint: error.hint,
      });
      
      // Display appropriate error message
      if (error.name === "ValidationError") {
        toast.error(error.message);
      } else {
        toast.error("Failed to submit skill contribution. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submitContribution
  };
};
