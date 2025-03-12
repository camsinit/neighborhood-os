
import { useQuery } from "@tanstack/react-query";
import { Event } from "@/types/localTypes";
import { supabase } from "@/integrations/supabase/client";

const fetchEvents = async (): Promise<Event[]> => {
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
    console.error('Error fetching events:', error);
    throw error;
  }

  // Transform the data to match our Event type
  return (data || []).map(event => ({
    ...event,
    profiles: event.profiles || {
      id: event.host_id,
      display_name: 'Anonymous',
      avatar_url: '/placeholder.svg'
    }
  }));
};

export const useEvents = () => {
  return useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });
};
