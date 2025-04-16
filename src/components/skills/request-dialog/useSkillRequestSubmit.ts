
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
   * Helper function to format a date for submission
   * This ensures each date has a distinct day value in the database
   */
  const formatDateForSubmission = (dateStr: string, preference: string) => {
    // Create a new date object from ISO string
    const timeDate = new Date(dateStr);
    
    // Start by stripping time component completely to get just the date portion
    // This creates a new date set to midnight
    const dateWithoutTime = new Date(timeDate.getFullYear(), timeDate.getMonth(), timeDate.getDate());
    
    // Add hours based on preference (using standard hours)
    // Morning: 9am, Afternoon: 1pm, Evening: 6pm
    const hours = preference === 'morning' ? 9 : 
                 preference === 'afternoon' ? 13 : 18;
    
    // Set the hours while preserving the date
    dateWithoutTime.setHours(hours, 0, 0, 0);
    
    // Log detailed information about each date formatting step
    console.log('Date formatting:', {
      originalDateStr: dateStr,
      parsedDate: timeDate.toISOString(),
      dateWithoutTime: dateWithoutTime.toISOString(),
      preference,
      hoursAssigned: hours,
      finalFormattedDate: dateWithoutTime.toISOString(),
      dateComponents: {
        year: dateWithoutTime.getFullYear(),
        month: dateWithoutTime.getMonth(),
        day: dateWithoutTime.getDate(),
        hours: dateWithoutTime.getHours(),
        minutes: dateWithoutTime.getMinutes(),
        seconds: dateWithoutTime.getSeconds()
      }
    });
    
    // Return properly formatted ISO string
    return dateWithoutTime.toISOString();
  };

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

    // Client-side validation - ensure at least 3 dates are selected
    if (selectedTimeSlots.length < 3) {
      toast.error('Date selection required', {
        description: 'Please select at least three dates for your request'
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

    // Ensure unique dates - THIS IS CRITICAL
    const uniqueDateStrings = new Set(
      selectedTimeSlots.map(slot => new Date(slot.date).toDateString())
    );
    
    // Log detailed information about each date being processed
    console.log("DATE DIAGNOSTICS - BEFORE SUBMISSION:", {
      totalSlots: selectedTimeSlots.length,
      uniqueDatesCount: uniqueDateStrings.size,
      uniqueDatesArray: Array.from(uniqueDateStrings),
      allDatesRaw: selectedTimeSlots.map(slot => slot.date),
      allDatesFormatted: selectedTimeSlots.map(slot => new Date(slot.date).toDateString()),
    });
    
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
      // First create the skill session with detailed error handling
      console.log("Creating session with:", {
        skill_id: skillId,
        provider_id: providerId,
        requester_id: user.id,
        requester_availability: {
          availability: data.availability,
          timePreference: data.timePreference,
          description: data.description,
        },
        status: 'pending_provider_times',
      });
      
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

      if (sessionError) {
        console.error('Session creation error details:', {
          error: sessionError,
          errorMessage: sessionError.message,
          errorDetails: sessionError.details,
          errorHint: sessionError.hint,
          errorCode: sessionError.code
        });
        throw sessionError;
      }

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
          // Format the date correctly using our helper function
          const formattedTime = formatDateForSubmission(slot.date, preference);
          
          // Log each generated time slot for debugging
          console.log(`Creating time slot: ${formattedTime} (${preference}) from original date ${slot.date}`);
          
          return {
            session_id: session.id,
            proposed_time: formattedTime,
          };
        });
      });

      console.log("Creating time slots (detailed):", 
        timeSlotPromises.map((slot, index) => ({
          index,
          sessionId: slot.session_id,
          proposedTime: slot.proposed_time,
          proposedTimeObj: new Date(slot.proposed_time).toISOString(),
          proposedTimeComponents: {
            year: new Date(slot.proposed_time).getFullYear(),
            month: new Date(slot.proposed_time).getMonth(),
            day: new Date(slot.proposed_time).getDate(),
            hours: new Date(slot.proposed_time).getHours(),
            minutes: new Date(slot.proposed_time).getMinutes(),
          }
        }))
      );

      // Insert the time slots with enhanced error handling
      const { error: timeSlotError } = await supabase
        .from('skill_session_time_slots')
        .insert(timeSlotPromises);

      if (timeSlotError) {
        console.error('Time slot error details:', {
          error: timeSlotError,
          errorMessage: timeSlotError.message,
          errorDetails: timeSlotError.details,
          errorHint: timeSlotError.hint,
          errorCode: timeSlotError.code
        });
        throw timeSlotError;
      }

      // Show success message and update UI
      toast.success('Skill request submitted successfully');
      queryClient.invalidateQueries({ queryKey: ['skills-exchange'] });
      onClose();
    } catch (error: any) {
      console.error('Error submitting skill request:', error);
      console.error('Error stack trace:', error.stack);
      
      // Enhanced error logging
      console.error('Error context:', {
        skillId,
        providerId,
        requesterId: user?.id,
        selectedDates: selectedTimeSlots.map(slot => slot.date),
        uniqueDatesCount: uniqueDateStrings.size,
        errorObj: error,
        errorMessage: error.message,
        errorCode: error.code,
        errorDetails: error.details,
        errorHint: error.hint
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
