
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";
import { createLogger } from "@/utils/logger";
import { dispatchRefreshEvent } from "@/utils/refreshEvents";

// Setup enhanced logger with detailed configuration
const logger = createLogger('RSVPButton');

// Define a transaction ID generator to track request flows
const generateTransactionId = () => {
  return `txn-${Math.random().toString(36).substring(2, 10)}`;
};

interface RSVPButtonProps {
  eventId: string;
  neighborhoodId?: string; 
  initialRSVPState?: boolean;
  className?: string;
}

/**
 * RSVPButton component allows users to RSVP to events
 * 
 * @param eventId - The ID of the event to RSVP to
 * @param neighborhoodId - The ID of the neighborhood the event belongs to
 * @param initialRSVPState - Whether the user has already RSVPed
 * @param className - Additional CSS classes for styling
 */
const RSVPButton = ({ 
  eventId, 
  neighborhoodId, 
  initialRSVPState = false, 
  className 
}: RSVPButtonProps) => {
  // For tracking operations
  const COMPONENT_ID = "RSVPButton-" + eventId.substring(0, 8);
  
  // Get current authenticated user
  const user = useUser();
  const [hasRSVPed, setHasRSVPed] = useState(initialRSVPState);
  const [isLoading, setIsLoading] = useState(false);
  const [eventNeighborhoodId, setEventNeighborhoodId] = useState<string | null>(neighborhoodId || null);
  const [transactionId, setTransactionId] = useState<string>("");

  // Trace initial props
  useEffect(() => {
    logger.debug(`${COMPONENT_ID}: Initialized with props:`, { 
      eventId, 
      neighborhoodId, 
      initialRSVPState, 
      hasUser: !!user 
    });
  }, []);

  // Fetch the neighborhood_id from the event if not provided
  useEffect(() => {
    const fetchEventNeighborhoodId = async () => {
      if (!neighborhoodId && eventId) {
        const opTxnId = generateTransactionId();
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

  // Check if user has RSVPed on component mount
  useEffect(() => {
    if (!user) {
      logger.debug(`${COMPONENT_ID}: No user logged in, skipping RSVP check`);
      return;
    }
    
    const checkRsvpStatus = async () => {
      const opTxnId = generateTransactionId();
      setTransactionId(opTxnId);
      setIsLoading(true);
      
      logger.debug(`${COMPONENT_ID}: [${opTxnId}] Starting RSVP status check for event=${eventId} user=${user.id}`);
      
      try {
        // Trace the exact query we're about to execute
        logger.debug(`${COMPONENT_ID}: [${opTxnId}] Executing query:`, {
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
          logger.error(`${COMPONENT_ID}: [${opTxnId}] Error checking RSVP status:`, {
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
        logger.debug(`${COMPONENT_ID}: [${opTxnId}] RSVP status check result: user ${user.id} has${hasRSVP ? '' : ' not'} RSVPed to event ${eventId}`);
        setHasRSVPed(hasRSVP);
      } catch (error: any) {
        logger.error(`${COMPONENT_ID}: [${opTxnId}] Exception checking RSVP:`, error);
      } finally {
        logger.debug(`${COMPONENT_ID}: [${opTxnId}] Completed RSVP status check, isLoading -> false`);
        setIsLoading(false);
      }
    };
      
    checkRsvpStatus();
  }, [eventId, user]);

  const toggleRSVP = async () => {
    if (!user) {
      toast.error("Please log in to RSVP for this event");
      return;
    }

    const opTxnId = generateTransactionId();
    setTransactionId(opTxnId);
    setIsLoading(true);

    logger.debug(`${COMPONENT_ID}: [${opTxnId}] Starting toggleRSVP operation - current state:`, {
      hasRSVPed,
      eventId,
      userId: user.id,
      neighborhoodId: eventNeighborhoodId
    });

    try {
      if (hasRSVPed) {
        // Remove RSVP
        logger.debug(`${COMPONENT_ID}: [${opTxnId}] Removing RSVP with query:`, {
          table: 'event_rsvps',
          action: 'delete',
          filters: { event_id: eventId, user_id: user.id }
        });
        
        const { error } = await supabase
          .from('event_rsvps')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', user.id);

        if (error) {
          logger.error(`${COMPONENT_ID}: [${opTxnId}] Error removing RSVP:`, {
            error: {
              message: error.message,
              code: error.code,
              details: error.details,
              hint: error.hint
            }
          });
          throw error;
        }

        logger.debug(`${COMPONENT_ID}: [${opTxnId}] Successfully removed RSVP`);
        toast.success("You've removed your RSVP");
        setHasRSVPed(false);
      } else {
        // Prepare minimal data object for inserting RSVP
        const rsvpData = {
          event_id: eventId,
          user_id: user.id
        };
        
        // Log the exact data structure and SQL representation
        logger.debug(`${COMPONENT_ID}: [${opTxnId}] Adding RSVP with data:`, {
          payload: rsvpData,
          sqlEquivalent: `INSERT INTO event_rsvps (event_id, user_id) VALUES ('${eventId}', '${user.id}')`
        });
        
        // Insert RSVP with no returning clause
        const { error } = await supabase
          .from('event_rsvps')
          .insert(rsvpData);

        if (error) {
          logger.error(`${COMPONENT_ID}: [${opTxnId}] Error adding RSVP:`, {
            error: {
              message: error.message,
              code: error.code,
              details: error.details,
              hint: error.hint,
              fullError: JSON.stringify(error)
            },
            requestPayload: rsvpData
          });
          throw error;
        }

        logger.debug(`${COMPONENT_ID}: [${opTxnId}] Successfully added RSVP`);
        toast.success("You've successfully RSVP'd to this event");
        setHasRSVPed(true);
      }
      
      // Dispatch refresh event
      logger.debug(`${COMPONENT_ID}: [${opTxnId}] Dispatching refresh event`);
      dispatchRefreshEvent('event-rsvp-updated');
      
    } catch (error: any) {
      // Enhanced error logging with context
      logger.error(`${COMPONENT_ID}: [${opTxnId}] Error in toggleRSVP operation:`, {
        error: error.message,
        stack: error.stack,
        context: {
          user: user?.id,
          event: eventId,
          operation: hasRSVPed ? 'remove' : 'add',
          state: { hasRSVPed, isLoading }
        }
      });
      
      console.error(`${COMPONENT_ID}: [${opTxnId}] Error updating RSVP:`, error);
      toast.error(`Failed to update RSVP: ${error.message}`);
    } finally {
      logger.debug(`${COMPONENT_ID}: [${opTxnId}] Completed toggleRSVP operation, isLoading -> false`);
      setIsLoading(false);
    }
  };

  // Updated button styling to use blue background by default
  return (
    <Button
      onClick={toggleRSVP}
      disabled={isLoading}
      variant={hasRSVPed ? "default" : "outline"}
      className={`bg-blue-500 hover:bg-blue-600 text-white transition-colors ${className}`}
      data-transaction-id={transactionId} // For debugging
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : hasRSVPed ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          Going
        </>
      ) : (
        "RSVP"
      )}
    </Button>
  );
};

export default RSVPButton;
