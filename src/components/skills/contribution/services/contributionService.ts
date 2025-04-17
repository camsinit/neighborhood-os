
import { supabase } from '@/integrations/supabase/client';
import { TimeSlot } from '../TimeSlotSelector';
import { LocationPreference } from '../LocationSelector';
import { createTimeSlotObjects } from '@/utils/timeslotUtils';

/**
 * Create a skill session with time slots for contribution
 * Using a single transaction approach
 * 
 * @param skillRequestId The skill request ID
 * @param requesterId The requester ID
 * @param providerId The provider ID
 * @param location Location preference
 * @param locationDetails Additional location details
 * @param selectedTimeSlots The selected time slots
 * @returns The created session
 */
export const createSkillSessionWithTimeSlots = async (
  skillRequestId: string,
  requesterId: string,
  providerId: string,
  location: LocationPreference,
  locationDetails: string,
  selectedTimeSlots: TimeSlot[]
) => {
  try {
    // First, create the session
    // CRITICAL FIX: Add empty requester_availability JSON object that's required by the database schema
    const { data: session, error: sessionError } = await supabase
      .from('skill_sessions')
      .insert({
        skill_id: skillRequestId,
        provider_id: providerId,
        requester_id: requesterId,
        location_preference: location,
        location_details: locationDetails,
        status: 'pending_requester_confirmation',
        // Add the missing required field
        requester_availability: {} // Empty JSON object as default value
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Error creating skill session:', sessionError);
      throw sessionError;
    }

    // Create time slot objects using shared utility function
    const timeSlotObjects = createTimeSlotObjects(session.id, selectedTimeSlots);

    // Log time slots being inserted
    console.log("CONTRIBUTION - Time slots prepared for insertion:", 
      timeSlotObjects.map((slot, index) => ({
        index,
        sessionId: slot.session_id,
        proposedTime: slot.proposed_time
      }))
    );

    // Now add the time slots
    const { error: timeSlotError } = await supabase
      .from('skill_session_time_slots')
      .insert(timeSlotObjects);

    if (timeSlotError) {
      console.error('Error adding time slots:', timeSlotError);
      
      // Clean up the session if time slots failed
      await supabase.from('skill_sessions').delete().eq('id', session.id);
      
      throw timeSlotError;
    }

    // Return the complete session data
    return session;
  } catch (error) {
    console.error('Error in createSkillSessionWithTimeSlots:', error);
    throw error;
  }
};
