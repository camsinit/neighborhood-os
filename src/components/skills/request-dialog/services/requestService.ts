import { supabase } from '@/integrations/supabase/client';
import { TimeSlot } from '../../contribution/TimeSlotSelector';
import { SkillRequestFormData } from '../useSkillRequestSubmit';
import { 
  createTimeSlotObjects, 
  formatDateWithTimePreference,
  prepareTimeSlots
} from '@/utils/timeslotUtils';

/**
 * Create a skill session with initial time slots using transaction if available,
 * with fallback to sequential operations if the stored procedure doesn't exist
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
  try {
    // Enhanced logging of the input data
    console.log("SUBMIT REQUEST - Full data:", {
      skillId,
      providerId,
      requesterId,
      formData,
      selectedTimeSlots: JSON.stringify(selectedTimeSlots, null, 2)
    });
    
    // Prepare time slots for the stored procedure
    const enhancedTimeSlots = prepareTimeSlots(selectedTimeSlots);
    
    console.log("Using stored procedure with time slots:", JSON.stringify(enhancedTimeSlots, null, 2));
    
    // Use any type to bypass TypeScript checking for RPC name
    const { data, error } = await (supabase.rpc as any)('create_skill_session_with_timeslots', {
      p_skill_id: skillId,
      p_provider_id: providerId,
      p_requester_id: requesterId,
      p_requester_availability: {
        availability: formData.availability,
        timePreference: formData.timePreference,
        description: formData.description,
      },
      p_timeslots: enhancedTimeSlots
    });

    if (error) {
      console.error('Session creation error:', error);
      
      if (error.code === 'PGRST202') {
        // Stored procedure not found, fall back to legacy approach
        console.warn("Stored procedure not found, using legacy approach");
        return await createSkillSessionLegacy(skillId, providerId, requesterId, formData, selectedTimeSlots);
      }
      
      // Other errors, just throw
      throw error;
    }

    return data;
  } catch (error) {
    // If any other error occurs, try the fallback approach
    console.error('Transaction approach failed, trying legacy approach:', error);
    return await createSkillSessionLegacy(skillId, providerId, requesterId, formData, selectedTimeSlots);
  }
};

/**
 * Legacy fallback method for creating a skill session with time slots
 * using separate sequential operations instead of a transaction
 */
export const createSkillSessionLegacy = async (
  skillId: string,
  providerId: string,
  requesterId: string,
  formData: SkillRequestFormData,
  selectedTimeSlots: TimeSlot[]
) => {
  console.log("Using legacy approach to create session with:", {
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
  
  // First create the session
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

  // Then add the time slots
  await addTimeSlots(session.id, selectedTimeSlots);
  
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
  const timeSlotObjects = createTimeSlotObjects(sessionId, selectedTimeSlots);
  
  // Log time slots being inserted
  console.log("Time slots prepared for insertion:", 
    timeSlotObjects.map((slot, index) => ({
      index,
      sessionId: slot.session_id,
      proposedTime: slot.proposed_time,
    }))
  );
  
  // Extract distinct dates for validation log
  const distinctDates = new Set(
    timeSlotObjects.map(slot => 
      new Date(slot.proposed_time).toISOString().split('T')[0]
    )
  );
  
  console.log("DISTINCT DATES CHECK:", {
    distinctDateCount: distinctDates.size,
    distinctDates: Array.from(distinctDates)
  });

  // Insert the time slots
  const { error: timeSlotError } = await supabase
    .from('skill_session_time_slots')
    .insert(timeSlotObjects);

  if (timeSlotError) {
    console.error('Time slot error:', timeSlotError);
    throw timeSlotError;
  }

  return { success: true };
};
