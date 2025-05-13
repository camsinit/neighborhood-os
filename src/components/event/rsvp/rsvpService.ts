
import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/utils/logger";

// Create a dedicated logger for RSVP operations
const logger = createLogger('rsvpService');

/**
 * Service for handling RSVP operations
 * Now with enhanced notification functionality
 */
export const rsvpService = {
  /**
   * Add an RSVP for a user to an event
   * @param eventId - The ID of the event
   * @param userId - The ID of the user RSVPing
   * @param neighborhoodId - The ID of the neighborhood the event belongs to
   * @param transactionId - Optional ID for tracking the operation
   */
  addRSVP: async (
    eventId: string, 
    userId: string, 
    neighborhoodId: string,
    transactionId?: string
  ) => {
    logger.debug(`[${transactionId || 'NO_TXNID'}] Adding RSVP for user ${userId} to event ${eventId}`);
    
    // First, add the RSVP record
    const { error } = await supabase
      .from('event_rsvps')
      .insert({
        event_id: eventId,
        user_id: userId,
        neighborhood_id: neighborhoodId,
        status: 'going'
      });
    
    if (error) {
      logger.error(`[${transactionId || 'NO_TXNID'}] Error adding RSVP:`, error);
      throw new Error(error.message);
    }

    // Get event details and host information for notification
    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .select('title, host_id')
      .eq('id', eventId)
      .single();
    
    if (eventError) {
      logger.error(`[${transactionId || 'NO_TXNID'}] Error fetching event details:`, eventError);
      // Don't throw here - we still created the RSVP, just couldn't notify
    } else if (eventData && eventData.host_id !== userId) {
      // Only notify if the user RSVPing is not the host
      try {
        // Call the notify-event-changes edge function to create notification
        logger.debug(`[${transactionId || 'NO_TXNID'}] Sending RSVP notification to host ${eventData.host_id}`);
        
        const { error: notifyError } = await supabase.functions.invoke('notify-event-changes', {
          body: {
            eventId,
            action: 'rsvp',
            eventTitle: eventData.title,
            userId, // Person who RSVP'd
            hostId: eventData.host_id // Event host
          }
        });
        
        if (notifyError) {
          logger.error(`[${transactionId || 'NO_TXNID'}] Error creating notification:`, notifyError);
        } else {
          logger.debug(`[${transactionId || 'NO_TXNID'}] RSVP notification sent successfully`);
        }
      } catch (notifyErr) {
        logger.error(`[${transactionId || 'NO_TXNID'}] Exception sending notification:`, notifyErr);
        // Don't throw - the RSVP was still created successfully
      }
    }
    
    return { success: true };
  },
  
  /**
   * Remove an RSVP for a user from an event
   * @param eventId - The ID of the event
   * @param userId - The ID of the user un-RSVPing
   * @param transactionId - Optional ID for tracking the operation
   */
  removeRSVP: async (eventId: string, userId: string, transactionId?: string) => {
    logger.debug(`[${transactionId || 'NO_TXNID'}] Removing RSVP for user ${userId} from event ${eventId}`);
    
    const { error } = await supabase
      .from('event_rsvps')
      .delete()
      .match({ event_id: eventId, user_id: userId });
    
    if (error) {
      logger.error(`[${transactionId || 'NO_TXNID'}] Error removing RSVP:`, error);
      throw new Error(error.message);
    }
    
    return { success: true };
  }
};
