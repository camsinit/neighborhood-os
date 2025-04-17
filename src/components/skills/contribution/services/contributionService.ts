
import { supabase } from '@/integrations/supabase/client';
import { TimeSlot } from '../TimeSlotSelector';
import { LocationPreference } from '../LocationSelector';
import { createTimeSlotObjects } from '../utils/timeSlotFormatters';

/**
 * Create a new skill session with time slots for contributor in a single transaction
 * With fallback to the legacy approach if the stored procedure doesn't exist
 * 
 * @param skillRequestId ID of the skill request
 * @param requesterId ID of the requester
 * @param providerId ID of the provider (current user)
 * @param location Selected location preference
 * @param locationDetails Details for location if 'other' is selected
 * @param selectedTimeSlots Array of selected time slots
 * @returns Created session data or throws error
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
    // Extract time slots in the format expected by our stored procedure
    const timeSlots = selectedTimeSlots.map(slot => ({
      // CRITICAL FIX: Use only YYYY-MM-DD format for consistent date parsing
      date: new Date(slot.date).toISOString().split('T')[0], 
      preferences: slot.preferences.length > 0 ? slot.preferences : ['morning'] // Ensure at least one preference
    }));
    
    // Log the data being sent to the procedure
    console.log("Creating contribution session with time slots:", {
      skill_id: skillRequestId,
      provider_id: providerId,
      requester_id: requesterId,
      location_preference: location,
      location_details: location === 'other' ? locationDetails : null,
      timeSlots: timeSlots
    });
    
    // Call the stored procedure - using any to bypass TypeScript checking for RPC name
    // This is a temporary solution until types are regenerated
    const { data, error } = await (supabase.rpc as any)('create_contribution_session_with_timeslots', {
      p_skill_id: skillRequestId,
      p_provider_id: providerId,
      p_requester_id: requesterId,
      p_location_preference: location,
      p_location_details: location === 'other' ? locationDetails : null,
      p_timeslots: timeSlots
    });
  
    // Handle errors
    if (error) {
      if (error.code === 'PGRST202') {
        // Stored procedure not found, fall back to legacy approach
        console.warn("Stored procedure not found, using legacy approach");
        return await createSessionLegacy(skillRequestId, requesterId, providerId, location, locationDetails, selectedTimeSlots);
      }
      
      // Other errors, just throw
      console.error('Session creation error:', error);
      throw error;
    }
  
    return data;
  } catch (error) {
    // If any other error occurs, try the fallback approach
    console.error('Transaction approach failed, trying legacy approach:', error);
    return await createSessionLegacy(skillRequestId, requesterId, providerId, location, locationDetails, selectedTimeSlots);
  }
};

/**
 * Legacy fallback method for creating a skill session with time slots
 * using separate sequential operations instead of a transaction
 */
async function createSessionLegacy(
  skillRequestId: string,
  requesterId: string,
  providerId: string,
  location: LocationPreference,
  locationDetails: string,
  selectedTimeSlots: TimeSlot[]
) {
  // First create the session
  const session = await createSkillSession(
    skillRequestId, 
    requesterId, 
    providerId, 
    location, 
    locationDetails
  );
  
  // Then add time slots
  await addTimeSlots(session.id, selectedTimeSlots);
  
  return session;
}

/**
 * Legacy method to create a new skill session for contributor
 * 
 * @param skillRequestId ID of the skill request
 * @param requesterId ID of the requester
 * @param providerId ID of the provider (current user)
 * @param location Selected location preference
 * @param locationDetails Details for location if 'other' is selected
 * @returns Created session data or throws error
 */
export const createSkillSession = async (
  skillRequestId: string,
  requesterId: string,
  providerId: string,
  location: LocationPreference,
  locationDetails: string
) => {
  // Log user information for context
  console.log("Creating contribution session with:", {
    skill_id: skillRequestId,
    provider_id: providerId,
    requester_id: requesterId,
    location_preference: location,
    location_details: location === 'other' ? locationDetails : null,
  });
  
  // Create the skill session
  const { data: session, error: sessionError } = await supabase
    .from('skill_sessions')
    .insert({
      skill_id: skillRequestId,
      provider_id: providerId,
      requester_id: requesterId,
      location_preference: location,
      location_details: location === 'other' ? locationDetails : null,
      status: 'pending_provider_times',
      requester_availability: {},
    })
    .select()
    .single();

  // Handle errors
  if (sessionError) {
    console.error('Session creation error:', sessionError);
    throw sessionError;
  }

  return session;
};

/**
 * Add time slots to a skill session
 * 
 * @param sessionId ID of the session to add time slots to
 * @param selectedTimeSlots Array of selected time slots
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

  // Verify at least 1 unique date is provided
  if (distinctDates.size < 1) {
    const error = new Error(`At least 1 date must be provided`);
    error.name = "ValidationError";
    throw error;
  }

  // Insert the time slots
  const { error: timeSlotError } = await supabase
    .from('skill_session_time_slots')
    .insert(timeSlotPromises);

  // Handle errors
  if (timeSlotError) {
    console.error('Time slot insertion error:', timeSlotError);
    throw timeSlotError;
  }

  return { success: true };
};
