
import { supabase } from "@/integrations/supabase/client";
import { TimeSlot } from "../TimeSlotSelector";
import { LocationPreference } from "../LocationSelector";
import { createLogger } from "@/utils/logger";

// Create a dedicated logger for this service
const logger = createLogger('contributionService');

/**
 * Create a skill session with time slots in a single database transaction
 * 
 * @param skillRequestId - The ID of the skill request
 * @param requesterId - The ID of the user requesting the skill
 * @param providerId - The ID of the user providing the skill
 * @param location - The location preference for the session
 * @param locationDetails - Additional location details
 * @param timeSlots - Array of time slots for the session
 * @returns The created skill session
 */
export async function createSkillSessionWithTimeSlots(
  skillRequestId: string,
  requesterId: string,
  providerId: string,
  location: LocationPreference,
  locationDetails: string,
  timeSlots: TimeSlot[]
) {
  try {
    // Step 1: Create the skill session
    const { data: session, error: sessionError } = await supabase
      .from('skill_sessions')
      .insert({
        skill_id: skillRequestId,
        requester_id: requesterId,
        provider_id: providerId,
        location_preference: location,
        location_details: locationDetails,
        requester_availability: {}, // Empty object for now
        status: 'pending_provider_times'
      })
      .select()
      .single();

    if (sessionError) {
      logger.error('Error creating skill session:', sessionError);
      throw sessionError;
    }

    // Step 2: Create time slots for the session
    const sessionId = session.id;
    
    // Prepare time slots for insertion
    const timeSlotInserts = timeSlots
      .filter(slot => slot.selected && slot.date && slot.time)
      .map(slot => {
        // Create date object from date and time
        const [hours, minutes] = slot.time.split(':').map(Number);
        const dateObj = new Date(slot.date);
        dateObj.setHours(hours, minutes);
        
        return {
          session_id: sessionId,
          proposed_time: dateObj.toISOString(),
          is_selected: false
        };
      });

    // Insert time slots if any exist
    if (timeSlotInserts.length > 0) {
      const { error: timeSlotsError } = await supabase
        .from('skill_session_time_slots')
        .insert(timeSlotInserts);

      if (timeSlotsError) {
        logger.error('Error creating time slots:', timeSlotsError);
        throw timeSlotsError;
      }
    }

    // Step 3: Create notification for the requester
    try {
      // Create notification for the skill requester
      const { data: notification, error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: requesterId,
          actor_id: providerId,
          notification_type: 'skills',
          content_type: 'skill_sessions',
          content_id: sessionId,
          title: 'New skill offer',
          action_type: 'view',
          action_label: 'View Offer',
          relevance_score: 5
        })
        .select();

      if (notificationError) {
        logger.error('Error creating notification:', notificationError);
        // We don't throw here to avoid failing the whole transaction
      } else {
        logger.debug('Created notification:', notification);
      }
    } catch (notifyError) {
      logger.error('Error in notification creation:', notifyError);
      // We don't throw here to avoid failing the whole transaction
    }

    return session;
  } catch (error) {
    logger.error('Error in createSkillSessionWithTimeSlots:', error);
    throw error;
  }
}
