
/**
 * Hook for handling skill request submission
 * 
 * This hook has been refactored to:
 * 1. Use separate service functions for database operations
 * 2. Improve error handling and validation
 * 3. Standardize date handling across the application
 */
import { useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { TimeSlot } from "../contribution/TimeSlotSelector";
import { 
  createSkillSession, 
  addTimeSlots 
} from "./services/requestService";
import { validateTimeSlots } from "../contribution/utils/timeSlotFormatters";

/**
 * Form data structure for skill requests
 */
export interface SkillRequestFormData {
  description: string;
  availability: 'weekdays' | 'weekends' | 'both';
  timePreference: ('morning' | 'afternoon' | 'evening')[];
}

/**
 * Custom hook for handling the skill request submission process
 */
export const useSkillRequestSubmit = (
  skillId: string,
  providerId: string,
  onClose: () => void
) => {
  // State management
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Hooks
  const user = useUser();
  const queryClient = useQueryClient();

  /**
   * Submit a skill request with selected time slots
   */
  const submitSkillRequest = async (
    data: SkillRequestFormData,
    selectedTimeSlots: TimeSlot[]
  ) => {
    // Validate user is logged in
    if (!user) {
      toast.error('You must be logged in to request skills');
      return;
    }

    // Log input time slots array
    console.log("SUBMIT REQUEST - Input time slots:", JSON.stringify(selectedTimeSlots, null, 2));
    
    // Validate time slots - require at least 1 date with time preferences
    const validation = validateTimeSlots(selectedTimeSlots, 1);
    if (!validation.isValid) {
      toast.error('Validation Error', {
        description: validation.message
      });
      return;
    }

    // Start submission process
    setIsSubmitting(true);
    try {
      // Create the skill session
      const session = await createSkillSession(skillId, providerId, user.id, data);
      
      // Add time slots to the session
      await addTimeSlots(session.id, selectedTimeSlots);

      // Show success message and update UI
      toast.success('Skill request submitted successfully');
      queryClient.invalidateQueries({ queryKey: ['skills-exchange'] });
      onClose();
    } catch (error: any) {
      console.error('Error submitting skill request:', error);
      
      // Enhanced error logging
      console.error('Error context:', {
        skillId,
        providerId,
        requesterId: user?.id,
        errorMessage: error.message,
        errorCode: error.code
      });
      
      // Special handling for database requirement of 3 dates
      if (error.message && error.message.includes('3 different dates')) {
        toast.error('Please select at least 3 different dates', {
          description: 'This system requires a minimum of 3 different dates for scheduling flexibility.'
        });
      } else if (error.name === "ValidationError") {
        // Special handling for our validation errors
        toast.error('Request submission failed', {
          description: error.message
        });
      } else {
        toast.error('Request submission failed', {
          description: error.message || 'Failed to submit skill request. Please try again.'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return { 
    isSubmitting, 
    submitSkillRequest 
  };
};
