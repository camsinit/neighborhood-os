
/**
 * Hook for handling skill request submission
 * This hook has been refactored to use the new database function for creating sessions
 */
import { useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { TimeSlot } from "../contribution/TimeSlotSelector";
import { supabase } from "@/integrations/supabase/client";
import { prepareTimeSlots } from "@/utils/timeslotUtils";
import { Json } from "@/integrations/supabase/types"; // Import the Json type from Supabase types

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

    // Log input time slots array for debugging
    console.log("SUBMIT REQUEST - Input time slots:", JSON.stringify(selectedTimeSlots, null, 2));
    
    // Validate we have at least one time slot
    if (!selectedTimeSlots.length) {
      toast.error('Please select at least one date and time preference');
      return;
    }

    // Start submission process
    setIsSubmitting(true);
    try {
      // Prepare data for RPC call - this ensures compatibility with JSON types
      const preparedTimeSlots = prepareTimeSlots(selectedTimeSlots);
      
      // Convert form data to a simple Record object that Supabase can serialize
      // This fixes the TypeScript error by ensuring our object has the right structure
      const formDataForRpc: Record<string, Json> = {
        description: data.description,
        availability: data.availability,
        timePreference: data.timePreference
      };
      
      // Call the database function directly using RPC
      // Using proper typing to ensure compatibility with Supabase
      const { data: result, error } = await supabase.rpc(
        'create_skill_session_with_timeslots',
        {
          p_skill_id: skillId,
          p_provider_id: providerId,
          p_requester_id: user.id,
          p_requester_availability: formDataForRpc,
          p_timeslots: preparedTimeSlots
        }
      );

      if (error) throw error;
      
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
      
      toast.error('Request submission failed', {
        description: error.message || 'Failed to submit skill request. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { 
    isSubmitting, 
    submitSkillRequest 
  };
};
