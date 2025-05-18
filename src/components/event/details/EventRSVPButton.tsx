
import { Button } from "@/components/ui/button";
import { useUser } from "@supabase/auth-helpers-react";
import RSVPButton from "@/components/event/rsvp/RSVPButton";

/**
 * EventRSVPButton component - Allows users to RSVP to an event
 * 
 * This component handles showing the RSVP button only for non-hosts
 * 
 * @param eventId - The ID of the event
 * @param isHost - Whether the current user is the host
 * @param neighborhoodId - The neighborhood ID of the event
 */
interface EventRSVPButtonProps {
  eventId: string;
  isHost: boolean;
  neighborhoodId?: string;
}

const EventRSVPButton = ({ 
  eventId, 
  isHost,
  neighborhoodId 
}: EventRSVPButtonProps) => {
  // Don't show RSVP button for the host
  if (isHost) return null;
  
  // Use the dedicated RSVPButton component with light gray border
  return (
    <RSVPButton 
      eventId={eventId} 
      neighborhoodId={neighborhoodId}
      className="w-full border-light"
    />
  );
};

export default EventRSVPButton;
