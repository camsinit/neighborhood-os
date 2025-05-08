
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/utils/logger";

// Setup logger for this module
const logger = createLogger('useEventNeighborhood');

/**
 * Custom hook to fetch the neighborhood ID for an event if not provided
 * 
 * If the neighborhoodId is already provided, it simply returns it.
 * Otherwise, it queries the database to get the neighborhood_id for the event.
 * 
 * @param eventId - The ID of the event
 * @param neighborhoodId - Optional neighborhood ID if already known
 * @returns The neighborhood ID for the event
 */
export const useEventNeighborhood = (eventId: string, neighborhoodId?: string) => {
  // State to hold the neighborhood ID
  const [eventNeighborhoodId, setEventNeighborhoodId] = useState<string | null>(neighborhoodId || null);
  
  // Generate a component ID for logging
  const COMPONENT_ID = "EventNeighborhood-" + eventId.substring(0, 8);

  // Fetch the neighborhood_id from the event if not provided
  useEffect(() => {
    const fetchEventNeighborhoodId = async () => {
      // Skip if we already have the neighborhood ID
      if (!neighborhoodId && eventId) {
        const opTxnId = `nhood-${Math.random().toString(36).substring(2, 8)}`;
        logger.debug(`${COMPONENT_ID}: [${opTxnId}] Fetching neighborhood_id for event ${eventId}`);
        
        try {
          const { data, error } = await supabase
            .from('events')
            .select('neighborhood_id')
            .eq('id', eventId)
            .single();
          
          if (error) {
            logger.error(`${COMPONENT_ID}: [${opTxnId}] Error fetching event neighborhood_id:`, {
              error: {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint
              },
              eventId
            });
            throw error;
          }
          
          if (data?.neighborhood_id) {
            logger.debug(`${COMPONENT_ID}: [${opTxnId}] Found neighborhood_id: ${data.neighborhood_id} for event ${eventId}`);
            setEventNeighborhoodId(data.neighborhood_id);
          } else {
            logger.warn(`${COMPONENT_ID}: [${opTxnId}] No neighborhood_id found for event ${eventId}`);
          }
        } catch (error: any) {
          logger.error(`${COMPONENT_ID}: [${opTxnId}] Exception fetching neighborhood_id:`, error);
        }
      }
    };
    
    fetchEventNeighborhoodId();
  }, [eventId, neighborhoodId]);

  return eventNeighborhoodId;
};
