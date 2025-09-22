
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";
import { RSVPButtonProps } from "./types";
import { useRSVPState } from "./useRSVPState";
import { useEventNeighborhood } from "./useEventNeighborhood";
import { rsvpService } from "./rsvpService";
import { useUser } from "@supabase/auth-helpers-react";
import { createLogger } from "@/utils/logger";

// Setup logger for this component
const logger = createLogger('RSVPButton');

/**
 * RSVPButton component allows users to RSVP to events
 * 
 * This component handles both adding and removing RSVPs for events,
 * and visually indicates the current RSVP status.
 * Reduced toast notifications - only shows critical errors and success for non-obvious actions
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
  
  // Get current user
  const user = useUser();
  
  // Get neighborhood ID (fetches from API if not provided)
  const eventNeighborhoodId = useEventNeighborhood(eventId, neighborhoodId);
  
  // Use custom hook for managing RSVP state
  const { 
    hasRSVPed, 
    setHasRSVPed, 
    isLoading, 
    setIsLoading,
    generateTransactionId,
    setTransactionId
  } = useRSVPState(eventId, initialRSVPState);

  /**
   * Handle the RSVP button click
   * Toggles between adding and removing an RSVP
   */
  const toggleRSVP = async () => {
    // Critical validation that requires user notification
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
        await rsvpService.removeRSVP(eventId, user.id, opTxnId);
        setHasRSVPed(false);
        // Success is indicated by button state change - no toast needed
      } else {
        // Add RSVP
        await rsvpService.addRSVP(eventId, user.id, eventNeighborhoodId, opTxnId);
        setHasRSVPed(true);
        // Success is indicated by button state change - no toast needed
      }
    } catch (error: any) {
      // Enhanced error logging with context
      logger.error(`${COMPONENT_ID}: [${opTxnId}] Error in toggleRSVP operation:`, {
        error: error.message,
        stack: error.stack,
        context: {
          user: user?.id,
          event: eventId,
          operation: hasRSVPed ? 'remove' : 'add',
        }
      });
      
      // Only show toast for actual errors
      toast.error(`Failed to update RSVP: ${error.message}`);
    } finally {
      logger.debug(`${COMPONENT_ID}: [${opTxnId}] Completed toggleRSVP operation, isLoading -> false`);
      setIsLoading(false);
    }
  };

  // Updated button styling using blue background by default
  return (
    <Button
      onClick={toggleRSVP}
      disabled={isLoading}
      variant="outline"
      size="sm"
      className={`transition-colors ${className}`}
      style={{
        borderColor: 'hsl(var(--calendar-color) / 0.3)',
        color: 'hsl(var(--calendar-color))'
      }}
      data-testid="rsvp-button"
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
