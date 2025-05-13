import React, { useState } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button"
import { useCurrentNeighborhood } from "@/hooks/useCurrentNeighborhood";
import { useEventRSVPs } from "@/utils/queries/useEventRSVPs";
import { CalendarCheck, UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { addRsvp, removeRsvp } from './rsvpService'; // Import the RSVP service

interface RSVPButtonProps {
  eventId: string;
  eventTitle: string;
  host: {
    id: string;
  };
}

// Main component that handles RSVPs for an event
const RSVPButton = ({ 
  eventId, 
  eventTitle,
  host
}: RSVPButtonProps) => {
  const user = useUser();
  const queryClient = useQueryClient();
  const neighborhood = useCurrentNeighborhood();
  const { data: rsvps } = useEventRSVPs(eventId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userId = user?.id;
  const hasRsvpd = rsvps?.some(rsvp => rsvp.user_id === userId);

  if (!userId) {
    return (
      <Button disabled>
        <UserPlus className="mr-2 h-4 w-4" />
        RSVP
      </Button>
    );
  }

  if (!neighborhood?.id) {
    return (
      <Button disabled>
        <UserPlus className="mr-2 h-4 w-4" />
        RSVP
      </Button>
    );
  }

  const handleRSVP = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      
      if (!hasRsvpd) {
        // Add the RSVP using the rsvpService
        await addRsvp(userId, eventId, neighborhood.id, { title: eventTitle, hostId: host.id });
        toast.success('You have successfully RSVP\'d to this event!');
      } else {
        // Remove the RSVP using the rsvpService
        await removeRsvp(userId, eventId);
        toast.success('You have successfully un-RSVP\'d from this event!');
      }
      
      // Invalidate queries to update the UI
      await queryClient.invalidateQueries(['event-rsvps', eventId]);
      await queryClient.invalidateQueries(['events']);
      
      // Dispatch custom event to trigger notification refresh
      window.dispatchEvent(new CustomEvent('event-rsvp-updated'));
      
      // Track RSVP action in analytics
      if (window.plausible) {
        window.plausible(
          hasRsvpd ? "Un-RSVP Event" : "RSVP Event",
          {
            props: {
              eventId: eventId,
              eventTitle: eventTitle
            }
          }
        );
      }
    } catch (err) {
      console.error("Error during RSVP:", err);
      toast.error("Failed to RSVP, please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Button onClick={handleRSVP} disabled={isSubmitting}>
      {isSubmitting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Submitting...
        </>
      ) : hasRsvpd ? (
        <>
          <UserMinus className="mr-2 h-4 w-4" />
          Un-RSVP
        </>
      ) : (
        <>
          <UserPlus className="mr-2 h-4 w-4" />
          RSVP
        </>
      )}
    </Button>
  );
};

export default RSVPButton;
