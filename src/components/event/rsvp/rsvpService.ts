
import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/utils/logger";

// Create a logger for this service
const logger = createLogger('rsvpService');

/**
 * Service for managing event RSVPs
 * With database triggers, we don't need to call the edge function anymore
 */
export const rsvpService = {
  /**
   * Add a user's RSVP to an event
   * Notifications are created automatically by database triggers
   * 
   * @param eventId - The ID of the event to RSVP to
   * @param userId - The ID of the user making the RSVP
   * @param neighborhoodId - The neighborhood ID the event belongs to
   * @param transactionId - Optional ID for tracking the operation
   * @returns A Promise that resolves when the RSVP is added
   */
  async addRSVP(
    eventId: string,
    userId: string,
    neighborhoodId?: string,
    transactionId?: string
  ): Promise<any> {
    logger.info(`=== RSVP CREATION STARTED ===`, { 
      eventId, 
      userId, 
      neighborhoodId,
      transactionId: transactionId || 'RSVP'
    });
    
    logger.info('RSVP CREATE: Inserting RSVP record');
    const { data, error } = await supabase
      .from('event_rsvps')
      .insert({
        event_id: eventId,
        user_id: userId,
        neighborhood_id: neighborhoodId
      })
      .select();
    
    if (error) {
      logger.error(`=== RSVP CREATION FAILED ===`, { 
        error, 
        eventId, 
        userId,
        transactionId: transactionId || 'RSVP'
      });
      throw error;
    }
    
    logger.info(`=== RSVP CREATION SUCCESS ===`, {
      eventId,
      userId,
      message: 'Database triggers should now create notifications',
      transactionId: transactionId || 'RSVP'
    });
    return data;
  },
  
  /**
   * Remove a user's RSVP from an event
   * 
   * @param eventId - The ID of the event to remove the RSVP from
   * @param userId - The ID of the user whose RSVP is being removed
   * @param transactionId - Optional ID for tracking the operation
   * @returns A Promise that resolves when the RSVP is removed
   */
  async removeRSVP(
    eventId: string,
    userId: string,
    transactionId?: string
  ): Promise<void> {
    logger.debug(`[${transactionId || 'RSVP'}] Removing RSVP for event ${eventId} by user ${userId}`);
    
    const { error } = await supabase
      .from('event_rsvps')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', userId);
    
    if (error) {
      logger.error(`[${transactionId || 'RSVP'}] Error removing RSVP:`, error);
      throw error;
    }
    
    logger.debug(`[${transactionId || 'RSVP'}] Successfully removed RSVP`);
  }
};
