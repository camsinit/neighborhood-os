
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUser } from "@supabase/auth-helpers-react";
import RSVPButton from "@/components/event/RSVPButton";

/**
 * EventRSVPButton component - Allows users to RSVP to an event
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
  
  // Use the dedicated RSVPButton component
  return (
    <RSVPButton 
      eventId={eventId} 
      neighborhoodId={neighborhoodId}
      className="w-full"
    />
  );
};

export default EventRSVPButton;
