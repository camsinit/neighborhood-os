
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

/**
 * Form data structure for skill requests
 */
export interface SkillRequestFormData {
  description: string;
  availability: 'weekdays' | 'weekends' | 'both';
  timePreference: ('morning' | 'afternoon' | 'evening')[];
}

/**
 * Validate time slots meet the required criteria
 * 
 * @param timeSlots Array of time slots to validate
 * @returns Object with validation result and error message if invalid
 */
export const validateTimeSlots = (timeSlots: TimeSlot[]) => {
  // Client-side validation - ensure at least 3 dates are selected
  if (timeSlots.length < 3) {
    return {
      isValid: false,
      message: 'Please select at least three dates for your request'
    };
  }

  // Ensure each date has at least one time preference
  if (timeSlots.some(slot => slot.preferences.length === 0)) {
    return {
      isValid: false,
      message: 'Please select at least one time preference for each selected date'
    };
  }

  // Extract just the date part (YYYY-MM-DD) from each ISO string
  const uniqueDateStrings = new Set(
    timeSlots.map(slot => new Date(slot.date).toISOString().split('T')[0])
  );
  
  // Log detailed information about uniqueness check
  console.log("DATE DIAGNOSTICS:", {
    totalSlots: timeSlots.length,
    uniqueDatesCount: uniqueDateStrings.size,
    uniqueDatesArray: Array.from(uniqueDateStrings)
  });
  
  // Client-side check for unique dates (at least 3)
  if (uniqueDateStrings.size < 3) {
    return {
      isValid: false,
      message: `You selected ${uniqueDateStrings.size} unique dates, but 3 are required.`
    };
  }

  return { isValid: true };
};

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
    
    // Validate time slots
    const validation = validateTimeSlots(selectedTimeSlots);
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
      
      if (error.name === "ValidationError") {
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
