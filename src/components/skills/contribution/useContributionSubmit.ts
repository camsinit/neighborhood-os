import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TimeSlot } from './TimeSlotSelector';
import { LocationPreference } from './LocationSelector';
import { validateTimeSlots } from '@/utils/timeslotUtils';
import { createSkillSessionWithTimeSlots } from './services/contributionService';
import { refreshEvents, dispatchRefreshEvent } from '@/utils/refreshEvents';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Hook for handling skill contribution submission
 * 
 * This hook has been refactored to:
 * 1. Use separate validation and service functions
 * 2. Improve error handling and logging
 * 3. Separate concerns for better maintainability
 */
export const useContributionSubmit = (
  skillRequestId: string,
  requesterId: string,
  onSuccess: () => void
) => {
  // State and hooks
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
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
      toast({
        title: "Validation error",
        description: validation.message,
        variant: "destructive"
      });
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
      await createSkillSessionWithTimeSlots(
        skillRequestId,
        requesterId,
        providerId,
        location,
        locationDetails,
        selectedTimeSlots
      );

      // Optionally add skill to user profile
      if (addToProfile) {
        console.log("Adding skill to user profile");
        // Implementation would go here
      }

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['skills-exchange'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      
      // Trigger notification refresh events - corrected to use direct function calls
      refreshEvents.notifications();
      refreshEvents.skills();
      
      // Dispatch DOM events for listeners
      window.dispatchEvent(new CustomEvent('notification-created'));
      window.dispatchEvent(new CustomEvent('skills-updated'));

      // Show success message
      toast({
        title: "Skill contribution offered",
        description: "The requester will be notified to schedule a time",
      });
      
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
        toast({
          title: "Validation Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to submit skill contribution. Please try again.",
          variant: "destructive"
        });
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
