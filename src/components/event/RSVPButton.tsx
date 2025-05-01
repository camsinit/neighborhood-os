
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";
import { createLogger } from "@/utils/logger";
import { dispatchRefreshEvent } from "@/utils/refreshEvents";

// Setup logger
const logger = createLogger('RSVPButton');

interface RSVPButtonProps {
  eventId: string;
  neighborhoodId?: string; // Add optional neighborhoodId prop
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
  const user = useUser();
  const [hasRSVPed, setHasRSVPed] = useState(initialRSVPState);
  const [isLoading, setIsLoading] = useState(false);
  const [eventNeighborhoodId, setEventNeighborhoodId] = useState<string | null>(neighborhoodId || null);

  // Fetch the neighborhood_id from the event if not provided
  useEffect(() => {
    const fetchEventNeighborhoodId = async () => {
      if (!neighborhoodId && eventId) {
        try {
          const { data, error } = await supabase
            .from('events')
            .select('neighborhood_id')
            .eq('id', eventId)
            .single();
          
          if (error) {
            throw error;
          }
          
          if (data?.neighborhood_id) {
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
    const checkRSVP = async () => {
      if (!user) return;
      
      setIsLoading(true);
      
      try {
        // Query for existing RSVP
        const { data, error } = await supabase
          .from('event_rsvps')
          .select('id')
          .eq('event_id', eventId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          throw error;
        }

        setHasRSVPed(!!data);
      } catch (error) {
        logger.error("Error checking RSVP:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkRSVP();
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
        // Add RSVP - Use explicit object with only the essential fields
        logger.debug("Adding RSVP with:", { 
          eventId, 
          userId: user.id
        });
        
        // Create a minimal insert object that avoids column ambiguity
        const rsvpData = {
          event_id: eventId,
          user_id: user.id
        };
        
        const { error } = await supabase
          .from('event_rsvps')
          .insert([rsvpData]);

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

  return (
    <Button
      onClick={toggleRSVP}
      disabled={isLoading}
      variant={hasRSVPed ? "default" : "outline"}
      className={`hover:bg-blue-500 hover:text-white transition-colors ${className}`}
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
