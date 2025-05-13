
import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/utils/logger";
import { dispatchRefreshEvent } from "@/utils/refreshEvents";
import { toast } from "sonner";

// Setup logger for RSVP service
const logger = createLogger('rsvpService');

/**
 * Service for handling RSVP operations
 * 
 * Provides functions to add or remove RSVPs for events
 */
export const rsvpService = {
  /**
   * Add an RSVP for an event
   * 
   * @param eventId - The event ID to RSVP to
   * @param userId - The user ID who is RSVPing
   * @param neighborhoodId - The neighborhood ID of the event
   * @param transactionId - Optional tracking ID for logs
   * @returns Success status and response data
   */
  async addRSVP(eventId: string, userId: string, neighborhoodId: string | null, transactionId: string) {
    logger.debug(`[${transactionId}] Adding RSVP for event=${eventId} user=${userId}`);
    
    // Prepare minimal data object for inserting RSVP
    const rsvpData: any = {
      event_id: eventId,
      user_id: userId
    };
    
    // Only add neighborhood_id if it exists
    if (neighborhoodId) {
      rsvpData.neighborhood_id = neighborhoodId;
    }
    
    // Log the exact data structure
    logger.debug(`[${transactionId}] Adding RSVP with data:`, {
      payload: rsvpData
    });
    
    // Insert RSVP
    const { data, error } = await supabase
      .from('event_rsvps')
      .insert(rsvpData)
      .select();

    if (error) {
      logger.error(`[${transactionId}] Error adding RSVP:`, {
        error: {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        },
        requestPayload: rsvpData
      });
      throw error;
    }

    logger.debug(`[${transactionId}] Successfully added RSVP:`, {
      responseData: data,
      recordCreated: !!data?.length
    });
    
    // Dispatch refresh events in multiple ways to ensure it's captured
    
    // 1. Use the dedicated refresh event utility
    logger.info(`[${transactionId}] Dispatching refresh events via refreshEvents utility`);
    dispatchRefreshEvent('event-rsvp-updated');
    dispatchRefreshEvent('notification-created');
    
    // 2. Directly dispatch window events for backup
    logger.info(`[${transactionId}] Dispatching direct window events`);
    window.dispatchEvent(new CustomEvent('event-rsvp-updated', { 
      detail: { action: 'added', eventId, userId }
    }));
    window.dispatchEvent(new CustomEvent('notification-created'));
    
    return { success: true, data };
  },
  
  /**
   * Remove an RSVP for an event
   * 
   * @param eventId - The event ID to remove RSVP from
   * @param userId - The user ID who is removing their RSVP
   * @param transactionId - Optional tracking ID for logs
   * @returns Success status
   */
  async removeRSVP(eventId: string, userId: string, transactionId: string) {
    logger.debug(`[${transactionId}] Removing RSVP with query:`, {
      table: 'event_rsvps',
      action: 'delete',
      filters: { event_id: eventId, user_id: userId }
    });
    
    const { error } = await supabase
      .from('event_rsvps')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', userId);

    if (error) {
      logger.error(`[${transactionId}] Error removing RSVP:`, {
        error: {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        }
      });
      throw error;
    }

    logger.debug(`[${transactionId}] Successfully removed RSVP`);
    
    // Dispatch refresh events in multiple ways to ensure it's captured
    
    // 1. Use the dedicated refresh event utility
    logger.info(`[${transactionId}] Dispatching refresh events via refreshEvents utility`);
    dispatchRefreshEvent('event-rsvp-updated');
    dispatchRefreshEvent('notification-created');
    
    // 2. Directly dispatch window events for backup
    logger.info(`[${transactionId}] Dispatching direct window events`);
    window.dispatchEvent(new CustomEvent('event-rsvp-updated', { 
      detail: { action: 'removed', eventId, userId }
    }));
    window.dispatchEvent(new CustomEvent('notification-created'));
    
    return { success: true };
  }
};
