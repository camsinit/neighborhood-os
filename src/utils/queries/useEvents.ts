
import { useQuery } from "@tanstack/react-query";
import { Event } from "@/types/localTypes";

const mockEvents: Event[] = [
  {
    id: "1",
    title: "Community Meeting",
    description: "Monthly community gathering",
    time: new Date().toISOString(),
    location: "Community Center",
    host_id: "1",
    is_recurring: true,
    recurrence_pattern: "monthly",
    profiles: {
      id: "1",
      display_name: "Test User",
      avatar_url: "/placeholder.svg"
    }
  }
];

export const useEvents = () => {
  return useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      try {
        return mockEvents.map(event => ({
          ...event,
          formattedTime: new Date(event.time).toLocaleString(),
        }));
      } catch (error) {
        console.error('Error in events query:', error);
        throw error;
      }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
