
import { supabase } from "@/integrations/supabase/client";
import { dispatchRefreshEvent } from "@/utils/refreshEvents";
import { toast } from "sonner";

/**
 * Adds a user's RSVP to an event and notifies the host
 * 
 * @param userId - The user ID of the person RSVPing
 * @param eventId - The event ID being RSVP'd to
 * @param neighborhoodId - The neighborhood ID for the event
 * @param eventDetails - Optional event details for notification
 * @returns Promise with the RSVP data
 */
export const addRsvp = async (
  userId: string, 
  eventId: string, 
  neighborhoodId: string,
  eventDetails?: { title: string; hostId: string }
) => {
  // Log the operation for debugging
  console.log('[rsvpService] Adding RSVP:', { userId, eventId, neighborhoodId });
  
  // Insert RSVP record into database
  const { data, error } = await supabase
    .from('event_rsvps')
    .insert({
      user_id: userId,
      event_id: eventId,
      neighborhood_id: neighborhoodId
    })
    .select();
    
  if (error) {
    console.error('[rsvpService] Error adding RSVP:', error);
    toast.error('Failed to RSVP to event');
    throw error;
  }
  
  // Notify host about new RSVP if event details are provided
  if (eventDetails?.hostId && eventDetails?.title) {
    try {
      // Call our notify-event-changes edge function to create a notification
      const response = await supabase.functions.invoke('notify-event-changes', {
        body: {
          eventId,
          action: 'rsvp',
          eventTitle: eventDetails.title,
          userId,
          hostId: eventDetails.hostId
        }
      });
      
      if (response.error) {
        console.error('[rsvpService] Error sending RSVP notification:', response.error);
      } else {
        console.log('[rsvpService] RSVP notification sent successfully');
      }
    } catch (notifyError) {
      console.error('[rsvpService] Error invoking notification function:', notifyError);
    }
  }
  
  // Trigger refresh events to update UI
  dispatchRefreshEvent('event-rsvp');
  dispatchRefreshEvent('events');
  
  // Also dispatch a DOM event for components that use event listeners
  window.dispatchEvent(new CustomEvent('event-rsvp-updated'));
  
  return data;
};

/**
 * Removes a user's RSVP from an event
 * 
 * @param userId - The user ID of the person un-RSVPing
 * @param eventId - The event ID being un-RSVP'd from
 * @returns Promise with the result
 */
export const removeRsvp = async (userId: string, eventId: string) => {
  // Log the operation for debugging
  console.log('[rsvpService] Removing RSVP:', { userId, eventId });
  
  // Remove RSVP record from database
  const { data, error } = await supabase
    .from('event_rsvps')
    .delete()
    .match({
      user_id: userId,
      event_id: eventId
    });
    
  if (error) {
    console.error('[rsvpService] Error removing RSVP:', error);
    toast.error('Failed to remove RSVP');
    throw error;
  }
  
  // Trigger refresh events to update UI
  dispatchRefreshEvent('event-rsvp');
  dispatchRefreshEvent('events');
  
  // Also dispatch a DOM event for components that use event listeners
  window.dispatchEvent(new CustomEvent('event-rsvp-updated'));
  
  return data;
};

/**
 * Checks if a user has RSVP'd to an event
 * 
 * @param userId - The user ID to check
 * @param eventId - The event ID to check
 * @returns Promise with boolean result
 */
export const hasUserRsvpd = async (userId: string, eventId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('event_rsvps')
    .select('id')
    .match({
      user_id: userId,
      event_id: eventId
    })
    .single();
    
  if (error && error.code !== 'PGRST116') { // Not found is expected in some cases
    console.error('[rsvpService] Error checking RSVP status:', error);
  }
  
  return !!data;
};
