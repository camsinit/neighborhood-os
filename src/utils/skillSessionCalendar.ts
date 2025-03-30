
/**
 * This utility file contains functions for creating calendar events from skill sessions.
 * It provides a central place to handle the integration between skill sessions and
 * the calendar events system.
 */
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner"; // Using sonner for toast notifications

/**
 * Creates a calendar event for a confirmed skill session
 * 
 * @param sessionData - The skill session data needed to create the event
 * @returns The created event ID if successful, null if unsuccessful
 */
export interface SkillSessionEventData {
  sessionId: string;
  skillId: string;
  skillTitle: string;
  providerId: string;
  requesterId: string;
  eventDateTime: Date | string; // ISO string or Date object
  location?: string;
  neighborhoodId?: string;
}

/**
 * Creates a calendar event from a skill session.
 * This function handles:
 * 1. Creating the calendar event
 * 2. Linking the event back to the skill session
 * 3. Creating appropriate notifications
 * 
 * @param sessionData - The required data to create the calendar event
 * @returns The ID of the created event, or null if there was an error
 */
export const createSkillSessionEvent = async (
  sessionData: SkillSessionEventData
): Promise<string | null> => {
  try {
    // Ensure we have a valid date string
    const eventTime = typeof sessionData.eventDateTime === 'string' 
      ? sessionData.eventDateTime
      : sessionData.eventDateTime.toISOString();
    
    // 1. Create a calendar event
    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .insert({
        title: `Skill Session: ${sessionData.skillTitle}`,
        description: `Skill exchange session between provider and requester.`,
        time: eventTime, // Use 'time' as confirmed from DB schema
        location: sessionData.location || 'To be determined',
        host_id: sessionData.providerId, // Primary host is the provider
        is_private: true,
        neighborhood_id: sessionData.neighborhoodId || null,
      })
      .select()
      .single();
      
    if (eventError) {
      console.error("Error creating event:", eventError);
      throw eventError;
    }
    
    // 2. Update the skill session with the event ID
    if (eventData) {
      const { error: sessionError } = await supabase
        .from('skill_sessions')
        .update({
          status: 'confirmed', // Using 'confirmed' status
          event_id: eventData.id
        })
        .eq('id', sessionData.sessionId);
        
      if (sessionError) {
        console.error("Error updating skill session:", sessionError);
        throw sessionError;
      }
          
      // 3. Send notification to the requester
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: sessionData.requesterId,
          actor_id: sessionData.providerId,
          title: `Skill session for "${sessionData.skillTitle}" has been scheduled`,
          content_type: 'skill_session',
          content_id: sessionData.skillId,
          notification_type: 'skills',
          action_type: 'view',
          action_label: 'View Calendar',
          metadata: {
            event_id: eventData.id,
            skill_id: sessionData.skillId
          }
        });
        
      if (notificationError) {
        console.error("Error creating notification:", notificationError);
        // Don't throw here, as the core functionality is complete
      }
      
      return eventData.id;
    }
    
    return null;
  } catch (error) {
    console.error("Error in createSkillSessionEvent:", error);
    // Fix the toast call - use the proper format for the toast library we're using (sonner)
    toast("Failed to create event", {
      description: "There was an issue creating the calendar event. Please try again.",
      variant: "destructive"
    });
    return null;
  }
};
