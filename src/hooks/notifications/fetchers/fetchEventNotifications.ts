
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches event notifications that are directly relevant to the current user.
 * This includes:
 * - Events the user created (as host)
 * - Events the user has RSVP'd to
 * 
 * @param showArchived - Whether to show archived notifications
 * @returns Promise containing relevant event notifications
 */
export const fetchEventNotifications = async (showArchived: boolean) => {
  // Get the current user ID
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;
  
  if (!userId) {
    console.warn("[fetchEventNotifications] No authenticated user found");
    return { data: [], error: null };
  }

  // Log the fetch attempt for debugging
  console.log(`[fetchEventNotifications] Fetching events for user ${userId}, showArchived=${showArchived}`);
  
  // First, fetch events the user created (as host)
  const hostEventsPromise = supabase.from("events").select(`
    id, 
    title, 
    created_at, 
    is_read, 
    is_archived,
    profiles:host_id (
      display_name,
      avatar_url
    )
  `)
  .eq('host_id', userId)
  .eq('is_archived', showArchived)
  .order("created_at", { ascending: false });
  
  // Second, fetch events the user has RSVP'd to
  const rsvpEventsPromise = supabase.from("event_rsvps")
    .select(`
      event_id,
      events!inner (
        id, 
        title, 
        created_at, 
        is_read, 
        is_archived,
        profiles:host_id (
          display_name,
          avatar_url
        )
      )
    `)
    .eq('user_id', userId)
    .eq('events.is_archived', showArchived)
    .order("created_at", { ascending: false });

  // Execute both queries concurrently
  const [hostEventsResult, rsvpEventsResult] = await Promise.all([
    hostEventsPromise,
    rsvpEventsPromise
  ]);
  
  // Extract just the events from the RSVP result
  const rsvpEvents = rsvpEventsResult.data?.map(item => item.events) || [];
  
  // Combine both sets of events
  const allEvents = [
    ...(hostEventsResult.data || []),
    ...rsvpEvents
  ];
  
  // Remove duplicates (in case user both hosts and RSVPs to same event)
  const uniqueEvents = Array.from(
    new Map(allEvents.map(event => [event.id, event])).values()
  );
  
  // Log the result for debugging
  console.log(`[fetchEventNotifications] Found ${uniqueEvents.length} relevant events`);
  
  // Return in the same format as before
  return {
    data: uniqueEvents,
    error: hostEventsResult.error || rsvpEventsResult.error
  };
};
