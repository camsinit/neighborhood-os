
import { supabase } from '@/integrations/supabase/client';
import { TimeSlot } from '../../contribution/TimeSlotSelector';
import { SkillRequestFormData } from '../useSkillRequestSubmit';

/**
 * Format a date string for submission with appropriate time based on preference
 * 
 * @param dateStr ISO string date to format
 * @param preference Time preference (morning, afternoon, evening)
 * @returns Formatted ISO date string with appropriate time
 */
export const formatDateWithTimePreference = (dateStr: string, preference: string): string => {
  // Create a new date object from ISO string
  const timeDate = new Date(dateStr);
  
  // Create a UTC date with just the date portion (year, month, day)
  const dateWithoutTime = new Date(
    Date.UTC(timeDate.getUTCFullYear(), timeDate.getUTCMonth(), timeDate.getUTCDate())
  );
  
  // Add hours based on preference (using standard hours)
  // Morning: 9am, Afternoon: 1pm, Evening: 6pm
  const hours = preference === 'morning' ? 9 : 
               preference === 'afternoon' ? 13 : 18;
  
  // Set the hours while preserving the date (in UTC to avoid timezone issues)
  dateWithoutTime.setUTCHours(hours, 0, 0, 0);
  
  // Log detailed information for debugging
  console.log('Date formatting:', {
    originalDateStr: dateStr,
    preference,
    hoursAssigned: hours,
    finalFormattedDate: dateWithoutTime.toISOString()
  });
  
  // Return properly formatted ISO string
  return dateWithoutTime.toISOString();
};

/**
 * Create time slot objects from selected time slots
 * 
 * @param sessionId The session ID to associate with time slots
 * @param selectedTimeSlots The selected time slots
 * @returns Array of time slot objects ready for database insertion
 */
export const createTimeSlotObjects = (
  sessionId: string,
  selectedTimeSlots: TimeSlot[]
) => {
  return selectedTimeSlots.flatMap(slot => {
    // Ensure each date has at least one preference
    if (slot.preferences.length === 0) {
      console.warn(`Date ${slot.date} has no preferences, adding 'morning' as default`);
      slot.preferences = ['morning'];
    }
    
    // Map each preference to a time slot entry
    return slot.preferences.map(preference => {
      // Format the date correctly using our helper function
      const formattedTime = formatDateWithTimePreference(slot.date, preference);
      
      return {
        session_id: sessionId,
        proposed_time: formattedTime,
      };
    });
  });
};

/**
 * Create a skill session with initial time slots in a transaction
 * This is a critical update to ensure time slots are created with the session
 * 
 * @param skillId The skill ID
 * @param providerId The provider ID
 * @param requesterId The requester ID
 * @param formData The form data with requester preferences
 * @param selectedTimeSlots The selected time slots
 * @returns The created session
 */
export const createSkillSessionWithTimeSlots = async (
  skillId: string,
  providerId: string,
  requesterId: string,
  formData: SkillRequestFormData,
  selectedTimeSlots: TimeSlot[]
) => {
  // Start a Supabase transaction
  const { data, error } = await supabase.rpc('create_skill_session_with_timeslots', {
    p_skill_id: skillId,
    p_provider_id: providerId,
    p_requester_id: requesterId,
    p_requester_availability: {
      availability: formData.availability,
      timePreference: formData.timePreference,
      description: formData.description,
    },
    p_timeslots: selectedTimeSlots.flatMap(slot => 
      slot.preferences.map(preference => ({
        date: new Date(slot.date).toISOString().split('T')[0], // Just the date part
        preference: preference
      }))
    )
  });

  if (error) {
    console.error('Session creation error:', error);
    throw error;
  }

  return data;
};

/**
 * Legacy method for creating a skill session in the database
 * @deprecated Use createSkillSessionWithTimeSlots instead
 */
export const createSkillSession = async (
  skillId: string,
  providerId: string,
  requesterId: string,
  formData: SkillRequestFormData
) => {
  console.log("Creating session with:", {
    skill_id: skillId,
    provider_id: providerId,
    requester_id: requesterId,
    requester_availability: {
      availability: formData.availability,
      timePreference: formData.timePreference,
      description: formData.description,
    },
    status: 'pending_provider_times',
  });
  
  const { data: session, error: sessionError } = await supabase
    .from('skill_sessions')
    .insert({
      skill_id: skillId,
      provider_id: providerId,
      requester_id: requesterId,
      requester_availability: {
        availability: formData.availability,
        timePreference: formData.timePreference,
        description: formData.description,
      },
      status: 'pending_provider_times',
    })
    .select()
    .single();

  if (sessionError) {
    console.error('Session creation error:', sessionError);
    throw sessionError;
  }

  return session;
};

/**
 * Add time slots to a session
 * 
 * @param sessionId The session ID
 * @param selectedTimeSlots The selected time slots
 * @returns Success status or throws error
 */
export const addTimeSlots = async (
  sessionId: string,
  selectedTimeSlots: TimeSlot[]
) => {
  // Create time slot objects
  const timeSlotPromises = createTimeSlotObjects(sessionId, selectedTimeSlots);
  
  // Log time slots being inserted
  console.log("Time slots prepared for insertion:", 
    timeSlotPromises.map((slot, index) => ({
      index,
      sessionId: slot.session_id,
      proposedTime: slot.proposed_time,
    }))
  );
  
  // Extract distinct dates for validation log
  const distinctDates = new Set(
    timeSlotPromises.map(slot => 
      new Date(slot.proposed_time).toISOString().split('T')[0]
    )
  );
  
  console.log("DISTINCT DATES CHECK:", {
    distinctDateCount: distinctDates.size,
    distinctDates: Array.from(distinctDates)
  });

  // Verify at least 1 unique date - removing the 3-date requirement
  if (distinctDates.size < 1) {
    const error = new Error(`At least 1 date must be provided`);
    error.name = "ValidationError";
    throw error;
  }

  // Insert the time slots
  const { error: timeSlotError } = await supabase
    .from('skill_session_time_slots')
    .insert(timeSlotPromises);

  if (timeSlotError) {
    console.error('Time slot error:', timeSlotError);
    throw timeSlotError;
  }

  return { success: true };
};
