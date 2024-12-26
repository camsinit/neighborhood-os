import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { addDays, eachWeekOfInterval, eachMonthOfInterval, isBefore } from "date-fns";

export const useEvents = () => {
  return useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      try {
        const { data: events, error } = await supabase
          .from("events")
          .select(`
            *,
            profiles (
              display_name
            )
          `)
          .order('time', { ascending: true });

        if (error) {
          console.error('Error fetching events:', error);
          throw error;
        }

        if (!events) {
          console.log('No events found');
          return [];
        }

        // Process events to include additional logic if necessary
        const processedEvents = events.map(event => {
          return {
            ...event,
            formattedTime: new Date(event.time).toLocaleString(), // Example of processing
          };
        });

        return processedEvents;
      } catch (error) {
        console.error('Error in events query:', error);
        throw error;
      }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
