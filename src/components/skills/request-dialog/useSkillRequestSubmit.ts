
/**
 * Hook for handling skill request submission
 */
import { useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { TimeSlot } from "../contribution/TimeSlotSelector";

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
    // Validate requirements
    if (!user) {
      toast.error('You must be logged in to request skills');
      return;
    }

    // Client-side validation - ensure at least 1 date is selected
    if (selectedTimeSlots.length < 1) {
      toast.error('Date selection required', {
        description: 'Please select at least one date for your request'
      });
      return;
    }

    // Ensure each date has at least one time preference
    if (selectedTimeSlots.some(slot => slot.preferences.length === 0)) {
      toast.error('Time preferences required', {
        description: 'Please select at least one time preference for each selected date'
      });
      return;
    }

    // Ensure unique dates
    const uniqueDateStrings = new Set(
      selectedTimeSlots.map(slot => new Date(slot.date).toDateString())
    );
    
    if (uniqueDateStrings.size !== selectedTimeSlots.length) {
      toast.error('Duplicate dates detected', {
        description: 'Please select different dates for your request'
      });
      return;
    }

    // Log the selected time slots for debugging
    console.log("Time slots being submitted:", JSON.stringify(selectedTimeSlots));

    // Start submission process
    setIsSubmitting(true);
    try {
      // First create the skill session
      const { data: session, error: sessionError } = await supabase
        .from('skill_sessions')
        .insert({
          skill_id: skillId,
          provider_id: providerId,
          requester_id: user.id,
          requester_availability: {
            availability: data.availability,
            timePreference: data.timePreference,
            description: data.description,
          },
          status: 'pending_provider_times',
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Normalize the time slots for insertion
      // Each date can have multiple preferences, so we need to create a time slot for each
      const timeSlotPromises = selectedTimeSlots.flatMap(slot => {
        // Ensure each date has at least one preference
        if (slot.preferences.length === 0) {
          console.warn(`Date ${slot.date} has no preferences, adding 'morning' as default`);
          slot.preferences = ['morning'];
        }
        
        // Map each preference to a time slot entry
        return slot.preferences.map(preference => {
          // Create a new date object from ISO string
          const timeDate = new Date(slot.date);
          
          // Set hours based on preference (using standard hours)
          timeDate.setHours(
            preference === 'morning' ? 9 :
            preference === 'afternoon' ? 13 :
            18
          );
          
          return {
            session_id: session.id,
            proposed_time: timeDate.toISOString(),
          };
        });
      });

      console.log("Creating time slots:", timeSlotPromises);

      // Insert the time slots
      const { error: timeSlotError } = await supabase
        .from('skill_session_time_slots')
        .insert(timeSlotPromises);

      if (timeSlotError) throw timeSlotError;

      // Show success message and update UI
      toast.success('Skill request submitted successfully');
      queryClient.invalidateQueries({ queryKey: ['skills-exchange'] });
      onClose();
    } catch (error: any) {
      console.error('Error submitting skill request:', error);
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
