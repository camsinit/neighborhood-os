
import { supabase } from "@/integrations/supabase/client";
import { useNeighborhoodQuery } from "@/hooks/useNeighborhoodQuery";
import { createLogger } from "@/utils/logger";

// Logger for consistent, env-aware output
const logger = createLogger('useEventRSVPs');

/**
 * Type definition for an RSVP with user profile information
 * Extended to support including the event host
 */
export interface EventRSVP {
  id: string;
  user_id: string;
  event_id: string;
  created_at: string;
  profiles?: {
    display_name: string;
    avatar_url: string | null;
  };
  isHost?: boolean; // Optional flag to identify the event host
}

/**
 * Custom hook that fetches RSVPs for a specific event
 * Uses useNeighborhoodQuery to keep cache keys scoped by neighborhood for consistency
 */
export const useEventRSVPs = (eventId: string) => {
  return useNeighborhoodQuery<EventRSVP[]>(
    ["event-rsvps", eventId], // include eventId for proper cache scoping
    async (_neighborhoodId: string): Promise<EventRSVP[]> => {
      // If no eventId was provided, return an empty list early to avoid unnecessary queries
      if (!eventId) return [];
      
      logger.info("Fetching RSVPs and host for event", { eventId });
      
      // First, fetch the event to get host information
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select(`
          host_id,
          profiles:host_id (
            display_name,
            avatar_url
          )
        `)
        .eq("id", eventId)
        .single();
      
      if (eventError) {
        logger.error("Error fetching event", eventError);
        throw eventError;
      }
      
      // Fetch RSVPs with user profile information
      const { data: rsvpData, error: rsvpError } = await supabase
        .from("event_rsvps")
        .select(`
          *,
          profiles:user_id (
            display_name,
            avatar_url
          )
        `)
        .eq("event_id", eventId);
        
      if (rsvpError) {
        logger.error("Error fetching RSVPs", rsvpError);
        throw rsvpError;
      }
      
      // Create a list that includes both RSVPs and the host
      const attendees: EventRSVP[] = [...(rsvpData as EventRSVP[])];
      
      // Check if host has already RSVP'd
      const hostHasRsvped = rsvpData?.some(rsvp => rsvp.user_id === eventData.host_id);
      
      // If host hasn't RSVP'd, add them as an attendee with a special marker
      if (!hostHasRsvped && eventData.profiles) {
        attendees.unshift({
          id: `host-${eventData.host_id}`,
          user_id: eventData.host_id,
          event_id: eventId,
          created_at: new Date().toISOString(),
          profiles: eventData.profiles,
          isHost: true // Special marker to identify the host
        } as EventRSVP & { isHost: boolean });
      }
      
      logger.info("Fetched RSVPs + host", { count: rsvpData?.length || 0, eventId });
      return attendees;
    }
  );
};
