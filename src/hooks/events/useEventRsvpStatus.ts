
/**
 * Hook for managing event RSVP status
 * 
 * This hook:
 * - Checks if the current user has RSVP'd to an event
 * - Fetches the RSVP count for an event
 * - Determines if the current user is the host
 */
import { useState, useEffect } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { Event } from "@/types/localTypes";

export function useEventRsvpStatus(event: Event) {
  // Get current user and set up state
  const user = useUser();
  const [isRsvped, setIsRsvped] = useState(false);
  const [rsvpCount, setRsvpCount] = useState(0);
  
  // Check if current user is the host of the event
  const isHost = user?.id === event.host_id;

  // Check if the current user has RSVP'd to this event and get the count
  useEffect(() => {
    if (user && event.id) {
      checkRsvpStatus();
      fetchRsvpCount();
    }
  }, [user, event.id]);

  // Check if current user has RSVP'd
  const checkRsvpStatus = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('event_rsvps')
      .select()
      .eq('event_id', event.id)
      .eq('user_id', user.id)
      .maybeSingle();
      
    setIsRsvped(!!data);
  };

  // Get total RSVP count for this event
  const fetchRsvpCount = async () => {
    const { count, error } = await supabase
      .from('event_rsvps')
      .select('id', {
        count: 'exact',
        head: true
      })
      .eq('event_id', event.id);
      
    if (error) {
      console.error('Error fetching RSVP count:', error);
      return;
    }
    setRsvpCount(count || 0);
  };

  return {
    isRsvped,
    rsvpCount,
    isHost
  };
}
