
import { useState, useEffect } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/utils/logger";

// Setup enhanced logger with detailed configuration
const logger = createLogger('useRSVPState');

/**
 * Custom hook for managing RSVP state
 * 
 * Handles checking if a user has already RSVPed to an event and maintains
 * loading state for async operations.
 * 
 * @param eventId - The ID of the event
 * @param initialRSVPState - Initial RSVP state (if known)
 * @returns The current RSVP state and loading status
 */
export const useRSVPState = (eventId: string, initialRSVPState = false) => {
  // Get current authenticated user
  const user = useUser();
  
  // State for tracking RSVP status and loading state
  const [hasRSVPed, setHasRSVPed] = useState(initialRSVPState);
  const [isLoading, setIsLoading] = useState(false);
  const [transactionId, setTransactionId] = useState<string>("");
  
  /**
   * Generate a unique transaction ID for tracking operations in logs
   */
  const generateTransactionId = () => {
    return `txn-${Math.random().toString(36).substring(2, 10)}`;
  };

  // Check if user has RSVPed on component mount
  useEffect(() => {
    if (!user) {
      logger.debug(`No user logged in, skipping RSVP check`);
      return;
    }
    
    const checkRsvpStatus = async () => {
      const opTxnId = generateTransactionId();
      setTransactionId(opTxnId);
      setIsLoading(true);
      
      logger.debug(`[${opTxnId}] Starting RSVP status check for event=${eventId} user=${user.id}`);
      
      try {
        // Trace the exact query we're about to execute
        logger.debug(`[${opTxnId}] Executing query:`, {
          table: 'event_rsvps',
          action: 'select',
          filters: { event_id: eventId, user_id: user.id }
        });
        
        const { data, error } = await supabase
          .from('event_rsvps')
          .select('id')
          .eq('event_id', eventId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          logger.error(`[${opTxnId}] Error checking RSVP status:`, {
            error: {
              message: error.message,
              code: error.code,
              details: error.details,
              hint: error.hint
            },
            query: { event_id: eventId, user_id: user.id }
          });
          throw error;
        }

        const hasRSVP = !!data;
        logger.debug(`[${opTxnId}] RSVP status check result: user ${user.id} has${hasRSVP ? '' : ' not'} RSVPed to event ${eventId}`);
        setHasRSVPed(hasRSVP);
      } catch (error: any) {
        logger.error(`[${opTxnId}] Exception checking RSVP:`, error);
      } finally {
        logger.debug(`[${opTxnId}] Completed RSVP status check, isLoading -> false`);
        setIsLoading(false);
      }
    };
      
    checkRsvpStatus();
  }, [eventId, user]);

  return { 
    hasRSVPed, 
    setHasRSVPed, 
    isLoading, 
    setIsLoading,
    transactionId, 
    setTransactionId,
    generateTransactionId,
    user
  };
};
