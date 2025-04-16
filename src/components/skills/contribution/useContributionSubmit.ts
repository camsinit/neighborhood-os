
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

    try {
      setIsSubmitting(true);
      
      // Create the skill session record
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

      if (sessionError) throw sessionError;

      // Create time slot entries for each selected date and time preference
      const timeSlotPromises = selectedTimeSlots.flatMap(slot =>
        slot.preferences.map(preference => {
          // Format the date correctly using our helper function
          const formattedTime = formatDateForSubmission(slot.date, preference);
          
          // Log each generated time slot for debugging
          console.log(`Creating time slot: ${formattedTime} (${preference})`);
          
          return {
            session_id: session.id,
            proposed_time: formattedTime,
          };
        })
      );

      // Log all time slots for debugging
      console.log("Creating time slots:", JSON.stringify(timeSlotPromises));

      const { error: timeSlotError } = await supabase
        .from('skill_session_time_slots')
        .insert(timeSlotPromises);

      if (timeSlotError) throw timeSlotError;

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
    } catch (error) {
      console.error('Error creating skill session:', error);
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
