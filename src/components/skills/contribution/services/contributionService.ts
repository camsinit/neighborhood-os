
/**
 * Skill Contribution Service
 * 
 * This service handles creating skill contributions and associated notifications
 */
import { supabase } from '@/integrations/supabase/client';
import { TimeSlot } from '../TimeSlotSelector';
import { LocationPreference } from '../LocationSelector';
import { createTimeSlotObjects } from '@/utils/timeslotUtils';
import notificationService from '@/utils/notifications/notificationService';
import { createLogger } from '@/utils/logger';

// Create a logger for this service
const logger = createLogger('contributionService');

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
    logger.debug('Creating skill session with time slots', {
      skillRequestId,
      requesterId,
      providerId,
      timeSlotCount: selectedTimeSlots.length
    });

    // First, get the skill title for notifications
    const { data: skillData, error: skillError } = await supabase
      .from('skills_exchange')
      .select('title')
      .eq('id', skillRequestId)
      .single();
      
    if (skillError) {
      logger.error('Error fetching skill details:', skillError);
    }
    
    const skillTitle = skillData?.title || 'Skill Session';
    
    // Create the session
    const { data: session, error: sessionError } = await supabase
      .from('skill_sessions')
      .insert({
        skill_id: skillRequestId,
        provider_id: providerId,
        requester_id: requesterId,
        location_preference: location,
        location_details: locationDetails,
        status: 'pending_requester_confirmation',
        requester_availability: {} // Empty JSON object as default value
      })
      .select()
      .single();

    if (sessionError) {
      logger.error('Error creating skill session:', sessionError);
      throw sessionError;
    }

    // Create time slot objects using shared utility function
    const timeSlotObjects = createTimeSlotObjects(session.id, selectedTimeSlots);

    // Log time slots being inserted
    logger.debug("Time slots prepared for insertion:", 
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
      logger.error('Error adding time slots:', timeSlotError);
      
      // Clean up the session if time slots failed
      await supabase.from('skill_sessions').delete().eq('id', session.id);
      
      throw timeSlotError;
    }

    // Create notification for the requester about new time slots
    try {
      await notificationService.createTimeSlotNotification(
        session.id,
        requesterId,
        skillTitle
      );
      logger.debug('Time slot notification sent to requester');
    } catch (notifError) {
      // Log but don't fail if notification creation fails
      logger.error('Error creating time slot notification:', notifError);
    }

    // Return the complete session data
    return session;
  } catch (error) {
    logger.error('Error in createSkillSessionWithTimeSlots:', error);
    throw error;
  }
};
