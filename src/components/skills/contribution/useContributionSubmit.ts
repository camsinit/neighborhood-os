
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
    
    // Log detailed information about each date formatting step
    console.log('Contribution date formatting:', {
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
   * Submit a skill contribution offer
   */
  const submitContribution = async (
    selectedTimeSlots: TimeSlot[],
    location: LocationPreference,
    locationDetails: string,
    addToProfile: boolean
  ) => {
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
    
    // Log detailed information about each date being processed
    console.log("CONTRIBUTION DATE DIAGNOSTICS:", {
      totalSlots: selectedTimeSlots.length,
      uniqueDatesCount: uniqueDateStrings.size,
      uniqueDatesArray: Array.from(uniqueDateStrings),
      allDatesRaw: selectedTimeSlots.map(slot => slot.date),
      allDatesFormatted: selectedTimeSlots.map(slot => new Date(slot.date).toDateString()),
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
      console.log("Current user details:", {
        userId: currentUser.data.user?.id,
        providerId: currentUser.data.user?.id === requesterId ? "WARNING: Provider is the same as requester!" : "Provider differs from requester",
      });
      
      // Create the skill session record with detailed logging
      console.log("Creating contribution session with:", {
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
        console.error('Session creation error details:', {
          error: sessionError,
          errorMessage: sessionError.message,
          errorDetails: sessionError.details,
          errorHint: sessionError.hint,
          errorCode: sessionError.code
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

      // Log detailed info about time slots for debugging
      console.log("Creating contribution time slots (detailed):", 
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
      console.error('Error creating skill session:', error);
      console.error('Error stack trace:', error.stack);
      
      // Enhanced error logging
      console.error('Contribution error context:', {
        skillRequestId,
        requesterId,
        selectedDates: selectedTimeSlots.map(slot => slot.date),
        location,
        errorObj: error,
        errorMessage: error.message,
        errorCode: error.code,
        errorDetails: error.details,
        errorHint: error.hint
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
