

import { useQuery } from "@tanstack/react-query";
import { Event } from "@/types/calendar";
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches events from the database with host profile information
 * 
 * @returns Promise containing array of events
 */
const fetchEvents = async (): Promise<Event[]> => {
  // Log the fetch request for debugging
  console.log("[fetchEvents] Fetching events from database");
  
  // Fetch events and join with profiles to get host information
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      profiles:host_id (
        id,
        display_name,
        avatar_url
      )
    `)
    .order('time', { ascending: true });

  if (error) {
    console.error('[fetchEvents] Error fetching events:', error);
    throw error;
  }

  console.log(`[fetchEvents] Successfully retrieved ${data?.length || 0} events`);

  // Transform the data to match our Event type
  return (data || []).map(event => ({
    ...event,
    // Ensure we have profile info, using fallbacks if missing
    profiles: event.profiles || {
      id: event.host_id,
      display_name: 'Anonymous',
      avatar_url: '/placeholder.svg'
    }
  }));
};

/**
 * React Query hook for fetching events
 */
export const useEvents = () => {
  return useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });
};
