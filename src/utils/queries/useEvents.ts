import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { addDays, eachWeekOfInterval, eachMonthOfInterval, isBefore, startOfDay, endOfDay } from "date-fns";

export const useEvents = () => {
  return useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      console.log('Fetching events...');
      const { data: rawEvents, error } = await supabase
        .from("events")
        .select(`
          *,
          profiles:host_id (
            display_name
          )
        `)
        .order("time", { ascending: true });

      if (error) {
        console.error('Error fetching events:', error);
        throw error;
      }

      console.log('Fetched events:', rawEvents);

      // Process recurring events
      const processedEvents = rawEvents.flatMap(event => {
        if (!event.is_recurring || !event.recurrence_pattern || !event.recurrence_end_date) {
          return [event];
        }

        const startDate = new Date(event.time);
        const endDate = new Date(event.recurrence_end_date);
        const recurringEvents = [];

        switch (event.recurrence_pattern) {
          case 'daily':
            let currentDate = startDate;
            while (isBefore(currentDate, endDate)) {
              recurringEvents.push({
                ...event,
                time: currentDate.toISOString(),
                id: `${event.id}-${currentDate.toISOString()}`,
              });
              currentDate = addDays(currentDate, 1);
            }
            break;

          case 'weekly':
            const weeklyDates = eachWeekOfInterval({
              start: startDate,
              end: endDate,
            });
            weeklyDates.forEach(date => {
              recurringEvents.push({
                ...event,
                time: new Date(
                  date.getFullYear(),
                  date.getMonth(),
                  date.getDate(),
                  startDate.getHours(),
                  startDate.getMinutes()
                ).toISOString(),
                id: `${event.id}-${date.toISOString()}`,
              });
            });
            break;

          case 'monthly':
            const monthlyDates = eachMonthOfInterval({
              start: startDate,
              end: endDate,
            });
            monthlyDates.forEach(date => {
              recurringEvents.push({
                ...event,
                time: new Date(
                  date.getFullYear(),
                  date.getMonth(),
                  startDate.getDate(),
                  startDate.getHours(),
                  startDate.getMinutes()
                ).toISOString(),
                id: `${event.id}-${date.toISOString()}`,
              });
            });
            break;
        }

        return recurringEvents;
      });

      console.log('Processed events:', processedEvents);
      return processedEvents;
    },
  });
};