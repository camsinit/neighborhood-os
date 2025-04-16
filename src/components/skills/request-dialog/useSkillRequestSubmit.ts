
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
    
    // ENHANCED LOGGING - Log detailed information about each date formatting step
    console.log('Date formatting (EXTENDED DEBUG):', {
      originalDateStr: dateStr,
      originalDateObj: timeDate,
      originalDateParts: {
        year: timeDate.getFullYear(),
        month: timeDate.getMonth(), 
        day: timeDate.getDate(),
        hours: timeDate.getHours(),
        minutes: timeDate.getMinutes(),
        seconds: timeDate.getSeconds(),
        milliseconds: timeDate.getMilliseconds(),
        timestamp: timeDate.getTime(),
        timezoneOffset: timeDate.getTimezoneOffset()
      },
      strippedDateObj: dateWithoutTime,
      preference,
      hoursAssigned: hours,
      finalFormattedDate: dateWithoutTime.toISOString(),
      finalDateParts: {
        year: dateWithoutTime.getFullYear(),
        month: dateWithoutTime.getMonth(),
        day: dateWithoutTime.getDate(),
        hours: dateWithoutTime.getHours(),
        minutes: dateWithoutTime.getMinutes(),
        seconds: dateWithoutTime.getSeconds(),
        milliseconds: dateWithoutTime.getMilliseconds(),
        timestamp: dateWithoutTime.getTime(),
        timezoneOffset: dateWithoutTime.getTimezoneOffset()
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

    // ENHANCED LOGGING - Log input time slots array with detailed structure
    console.log("SUBMIT REQUEST - Input time slots:", JSON.stringify(selectedTimeSlots, null, 2));
    
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
    
    // ENHANCED LOGGING - Log detailed information about uniqueness check
    console.log("DATE DIAGNOSTICS - ENHANCED DEBUG:", {
      totalSlots: selectedTimeSlots.length,
      uniqueDatesCount: uniqueDateStrings.size,
      uniqueDatesArray: Array.from(uniqueDateStrings),
      allDatesRaw: selectedTimeSlots.map(slot => slot.date),
      allDatesFormatted: selectedTimeSlots.map(slot => new Date(slot.date).toDateString()),
      allDatesComponents: selectedTimeSlots.map(slot => {
        const d = new Date(slot.date);
        return {
          original: slot.date,
          year: d.getFullYear(),
          month: d.getMonth(),
          day: d.getDate(),
          hours: d.getHours(),
          minutes: d.getMinutes(),
          timezone: d.getTimezoneOffset(),
          dateString: d.toDateString(),
          isoString: d.toISOString()
        };
      })
    });
    
    if (uniqueDateStrings.size !== selectedTimeSlots.length) {
      toast.error('Duplicate dates detected', {
        description: 'Please select different dates for your request'
      });
      return;
    }

    // ENHANCED LOGGING - More detailed logging of time slots
    console.log("ENHANCED DEBUG - Time slots pre-processing:", 
      selectedTimeSlots.map((slot, idx) => ({
        index: idx,
        date: slot.date,
        dateObj: new Date(slot.date),
        dateComponents: {
          year: new Date(slot.date).getFullYear(),
          month: new Date(slot.date).getMonth(),
          day: new Date(slot.date).getDate(),
          hours: new Date(slot.date).getHours(),
          minutes: new Date(slot.date).getMinutes(),
          seconds: new Date(slot.date).getSeconds(),
          milliseconds: new Date(slot.date).getMilliseconds(),
          timestamp: new Date(slot.date).getTime(),
          timezoneOffset: new Date(slot.date).getTimezoneOffset()
        },
        preferences: slot.preferences,
        preferencesCount: slot.preferences.length,
        preferencesString: slot.preferences.join(',')
      }))
    );

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
        console.error('ENHANCED DEBUG - Session creation error details:', {
          error: sessionError,
          errorMessage: sessionError.message,
          errorDetails: sessionError.details,
          errorHint: sessionError.hint,
          errorCode: sessionError.code,
          fullError: JSON.stringify(sessionError),
          requestPayload: {
            skill_id: skillId,
            provider_id: providerId,
            requester_id: user.id,
            requester_availability: {
              availability: data.availability,
              timePreference: data.timePreference,
              description: data.description,
            },
            status: 'pending_provider_times',
          }
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

      // ENHANCED LOGGING - Log the actual time slots being submitted
      console.log("ENHANCED DEBUG - Time slots prepared for insertion:", 
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
            seconds: new Date(slot.proposed_time).getSeconds(),
            milliseconds: new Date(slot.proposed_time).getMilliseconds(),
            timestamp: new Date(slot.proposed_time).getTime(),
            timezoneOffset: new Date(slot.proposed_time).getTimezoneOffset()
          }
        }))
      );
      
      // Log DISTINCT dates for database comparison
      const distinctDates = new Set(
        timeSlotPromises.map(slot => 
          new Date(slot.proposed_time).toISOString().split('T')[0]
        )
      );
      
      console.log("ENHANCED DEBUG - DISTINCT DATES CHECK:", {
        distinctDateCount: distinctDates.size,
        distinctDates: Array.from(distinctDates),
        allDateStrings: timeSlotPromises.map(slot => 
          new Date(slot.proposed_time).toISOString().split('T')[0]
        )
      });

      // Insert the time slots with enhanced error handling
      const { error: timeSlotError } = await supabase
        .from('skill_session_time_slots')
        .insert(timeSlotPromises);

      if (timeSlotError) {
        console.error('ENHANCED DEBUG - Time slot error details:', {
          error: timeSlotError,
          errorMessage: timeSlotError.message,
          errorDetails: timeSlotError.details,
          errorHint: timeSlotError.hint,
          errorCode: timeSlotError.code,
          fullError: JSON.stringify(timeSlotError),
          timeSlotDataSample: timeSlotPromises.length > 0 ? timeSlotPromises[0] : 'No slots',
          totalSlots: timeSlotPromises.length,
          sessionId: session?.id,
          distinctDateCount: distinctDates.size
        });
        throw timeSlotError;
      }

      // Show success message and update UI
      toast.success('Skill request submitted successfully');
      queryClient.invalidateQueries({ queryKey: ['skills-exchange'] });
      onClose();
    } catch (error: any) {
      console.error('ENHANCED DEBUG - Error submitting skill request:', error);
      console.error('ENHANCED DEBUG - Error stack trace:', error.stack);
      
      // Enhanced error logging
      console.error('ENHANCED DEBUG - Error context:', {
        skillId,
        providerId,
        requesterId: user?.id,
        selectedDatesCount: selectedTimeSlots.length,
        distinctDatesCount: uniqueDateStrings.size,
        errorObj: error,
        errorMessage: error.message,
        errorCode: error.code,
        errorDetails: error.details,
        errorHint: error.hint,
        fullErrorString: JSON.stringify(error)
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
