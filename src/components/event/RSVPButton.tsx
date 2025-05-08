
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";
import { createLogger } from "@/utils/logger";
import { dispatchRefreshEvent } from "@/utils/refreshEvents";

// Setup logger for detailed logging
const logger = createLogger('RSVPButton');

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
  // Get current authenticated user
  const user = useUser();
  const [hasRSVPed, setHasRSVPed] = useState(initialRSVPState);
  const [isLoading, setIsLoading] = useState(false);
  const [eventNeighborhoodId, setEventNeighborhoodId] = useState<string | null>(neighborhoodId || null);

  // Fetch the neighborhood_id from the event if not provided
  useEffect(() => {
    const fetchEventNeighborhoodId = async () => {
      if (!neighborhoodId && eventId) {
        try {
          logger.debug(`Fetching neighborhood_id for event ${eventId}`);
          const { data, error } = await supabase
            .from('events')
            .select('neighborhood_id')
            .eq('id', eventId)
            .single();
          
          if (error) {
            throw error;
          }
          
          if (data?.neighborhood_id) {
            logger.debug(`Found neighborhood_id: ${data.neighborhood_id} for event ${eventId}`);
            setEventNeighborhoodId(data.neighborhood_id);
          }
        } catch (error) {
          logger.error("Error fetching event neighborhood_id:", error);
        }
      }
    };
    
    fetchEventNeighborhoodId();
  }, [eventId, neighborhoodId]);

  // Check if user has RSVPed on component mount
  useEffect(() => {
    if (!user) {
      logger.debug("No user logged in, skipping RSVP check");
      return;
    }
    
    const checkRsvpStatus = async () => {
      setIsLoading(true);
      
      try {
        logger.debug(`Checking RSVP status for event ${eventId} and user ${user.id}`);
        const { data, error } = await supabase
          .from('event_rsvps')
          .select('id')
          .eq('event_id', eventId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          logger.error("Error checking RSVP status:", error);
          throw error;
        }

        const hasRSVP = !!data;
        logger.debug(`User ${user.id} has${hasRSVP ? '' : ' not'} RSVPed to event ${eventId}`);
        setHasRSVPed(hasRSVP);
      } catch (error) {
        logger.error("Error checking RSVP:", error);
      } finally {
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

    setIsLoading(true);

    try {
      if (hasRSVPed) {
        // Remove RSVP
        logger.debug(`Removing RSVP for event ${eventId} and user ${user.id}`);
        const { error } = await supabase
          .from('event_rsvps')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', user.id);

        if (error) {
          logger.error("Error removing RSVP:", error);
          throw error;
        }

        toast.success("You've removed your RSVP");
        setHasRSVPed(false);
      } else {
        // Add RSVP - Using a minimal object with only required fields
        const rsvpData = {
          event_id: eventId,
          user_id: user.id
        };
        
        logger.debug("Adding RSVP with data:", rsvpData);
        
        // Fixed: Use insert without returning option
        const { error } = await supabase
          .from('event_rsvps')
          .insert(rsvpData);

        if (error) {
          logger.error("Error adding RSVP:", error);
          throw error;
        }

        toast.success("You've successfully RSVP'd to this event");
        setHasRSVPed(true);
      }
      
      // Dispatch event to refresh any components displaying RSVPs
      dispatchRefreshEvent('event-rsvp-updated');
      
    } catch (error: any) {
      console.error("Error updating RSVP:", error);
      toast.error(`Failed to update RSVP: ${error.message}`);
    } finally {
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
