
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TimeSlot } from './TimeSlotSelector';
import { LocationPreference } from './LocationSelector';

/**
 * Hook for handling skill contribution submission
 */
export const useContributionSubmit = (
  skillRequestId: string,
  requesterId: string,
  onSuccess: () => void
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

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
    console.log('Contribution date formatting (EXTENDED DEBUG):', {
      originalDateStr: dateStr,
      originalDateObj: timeDate,
      originalDateComponents: {
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
      finalDateComponents: {
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
   * Submit a skill contribution offer
   */
  const submitContribution = async (
    selectedTimeSlots: TimeSlot[],
    location: LocationPreference,
    locationDetails: string,
    addToProfile: boolean
  ) => {
    // ENHANCED LOGGING - Log the submission input with more details
    console.log("CONTRIBUTION SUBMIT - Input time slots:", JSON.stringify(selectedTimeSlots, null, 2));
    
    // Basic validation
    if (selectedTimeSlots.length < 1) {
      toast({
        title: "Date selection required",
        description: "Please select at least one date",
        variant: "destructive"
      });
      return;
    }

    // Validate time preferences for each date
    if (selectedTimeSlots.some(slot => slot.preferences.length === 0)) {
      toast({
        title: "Time preferences required",
        description: "Please select at least one time preference for each date",
        variant: "destructive"
      });
      return;
    }

    // Additional diagnostic: Check for unique dates
    const uniqueDateStrings = new Set(
      selectedTimeSlots.map(slot => new Date(slot.date).toDateString())
    );
    
    // ENHANCED LOGGING - Log detailed date diagnostics
    console.log("CONTRIBUTION DATE DIAGNOSTICS (ENHANCED):", {
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
      toast({
        title: "Duplicate dates detected",
        description: "Please select different dates for your contribution",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Log the user ID for context
      const currentUser = await supabase.auth.getUser();
      console.log("ENHANCED DEBUG - Current user details:", {
        userId: currentUser.data.user?.id,
        providerId: currentUser.data.user?.id === requesterId ? "WARNING: Provider is the same as requester!" : "Provider differs from requester",
      });
      
      // Create the skill session record with detailed logging
      console.log("ENHANCED DEBUG - Creating contribution session with:", {
        skill_id: skillRequestId,
        provider_id: currentUser.data.user?.id,
        requester_id: requesterId,
        location_preference: location,
        location_details: location === 'other' ? locationDetails : null,
      });
      
      const { data: session, error: sessionError } = await supabase
        .from('skill_sessions')
        .insert({
          skill_id: skillRequestId,
          provider_id: (await supabase.auth.getUser()).data.user?.id,
          requester_id: requesterId,
          location_preference: location,
          location_details: location === 'other' ? locationDetails : null,
          status: 'pending_provider_times',
          requester_availability: {},
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
            skill_id: skillRequestId,
            provider_id: currentUser.data.user?.id,
            requester_id: requesterId,
            location_preference: location,
            location_details: location === 'other' ? locationDetails : null,
          }
        });
        throw sessionError;
      }

      // Create time slot entries for each selected date and time preference
      const timeSlotPromises = selectedTimeSlots.flatMap(slot =>
        slot.preferences.map(preference => {
          // Format the date correctly using our helper function
          const formattedTime = formatDateForSubmission(slot.date, preference);
          
          // Log each generated time slot for debugging
          console.log(`Creating contribution time slot: ${formattedTime} (${preference}) from original date ${slot.date}`);
          
          return {
            session_id: session.id,
            proposed_time: formattedTime,
          };
        })
      );

      // ENHANCED LOGGING - Log each time slot in detail
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
      
      console.log("ENHANCED DEBUG - DISTINCT DATES CHECK (CONTRIBUTION):", {
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

      // Optionally add skill to user profile
      if (addToProfile) {
        // Implementation for adding to profile would go here
        console.log("Adding skill to user profile");
      }

      // Show success message
      toast({
        title: "Skill contribution offered",
        description: "The requester will be notified to schedule a time",
      });
      
      // Close the dialog
      onSuccess();
    } catch (error: any) {
      console.error('ENHANCED DEBUG - Error creating skill session:', error);
      console.error('ENHANCED DEBUG - Error stack trace:', error.stack);
      
      // Enhanced error logging
      console.error('ENHANCED DEBUG - Contribution error context:', {
        skillRequestId,
        requesterId,
        selectedDatesCount: selectedTimeSlots.length,
        uniqueDatesCount: uniqueDateStrings.size,
        location,
        errorObj: error,
        errorMessage: error.message,
        errorCode: error.code,
        errorDetails: error.details,
        errorHint: error.hint,
        fullErrorString: JSON.stringify(error)
      });
      
      toast({
        title: "Error",
        description: "Failed to submit skill contribution. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submitContribution
  };
};
