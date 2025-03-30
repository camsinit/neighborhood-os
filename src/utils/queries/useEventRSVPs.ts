
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Type definition for an RSVP with user profile information
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
}

/**
 * Custom hook that fetches RSVPs for a specific event
 * 
 * @param eventId - The ID of the event to fetch RSVPs for
 * @returns Query result containing RSVPs with user profile information
 */
export const useEventRSVPs = (eventId: string) => {
  return useQuery({
    // Include event ID in query key for automatic refetching when it changes
    queryKey: ["event-rsvps", eventId],
    
    // Only enable the query if we have an eventId
    enabled: !!eventId,
    
    queryFn: async (): Promise<EventRSVP[]> => {
      console.log("[useEventRSVPs] Fetching RSVPs for event:", eventId);
      
      // Fetch RSVPs with user profile information
      const { data, error } = await supabase
        .from("event_rsvps")
        .select(`
          *,
          profiles:user_id (
            display_name,
            avatar_url
          )
        `)
        .eq("event_id", eventId);
        
      if (error) {
        console.error("[useEventRSVPs] Error fetching RSVPs:", error);
        throw error;
      }
      
      console.log(`[useEventRSVPs] Found ${data.length} RSVPs for event ${eventId}`);
      return data as EventRSVP[];
    },
  });
};
