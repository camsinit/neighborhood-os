
import { useQuery } from "@tanstack/react-query";
import { Event } from "@/types/localTypes";
import { addDays, addHours } from "date-fns";

const mockEvents: Event[] = [
  {
    id: "1",
    title: "Community Garden Workshop",
    description: "Learn about seasonal planting and composting techniques. Perfect for beginners!",
    time: addDays(new Date(), 3).toISOString(),
    location: "Community Garden on Oak Street",
    host_id: "1",
    is_recurring: true,
    recurrence_pattern: "monthly",
    created_at: new Date().toISOString(),
    profiles: {
      id: "1",
      display_name: "Maria Garcia",
      avatar_url: "/placeholder.svg"
    }
  },
  {
    id: "2",
    title: "Neighborhood Watch Meeting",
    description: "Monthly meeting to discuss community safety and upcoming initiatives.",
    time: addDays(addHours(new Date(), 2), 7).toISOString(),
    location: "Community Center - Room 101",
    host_id: "2",
    is_recurring: true,
    recurrence_pattern: "monthly",
    created_at: new Date().toISOString(),
    profiles: {
      id: "2",
      display_name: "James Wilson",
      avatar_url: "/placeholder.svg"
    }
  },
  {
    id: "3",
    title: "Youth Sports Day",
    description: "Fun sports activities for kids ages 5-12. All skill levels welcome!",
    time: addDays(new Date(), 14).toISOString(),
    location: "Memorial Park",
    host_id: "3",
    is_recurring: false,
    created_at: new Date().toISOString(),
    profiles: {
      id: "3",
      display_name: "Sarah Johnson",
      avatar_url: "/placeholder.svg"
    }
  },
  {
    id: "4",
    title: "Senior Tech Help Session",
    description: "Free technology assistance for seniors. Bring your devices and questions!",
    time: addDays(addHours(new Date(), 1), 5).toISOString(),
    location: "Public Library - Computer Lab",
    host_id: "4",
    is_recurring: true,
    recurrence_pattern: "weekly",
    created_at: new Date().toISOString(),
    profiles: {
      id: "4",
      display_name: "David Kim",
      avatar_url: "/placeholder.svg"
    }
  },
  {
    id: "5",
    title: "Community Cleanup Day",
    description: "Join us in keeping our neighborhood beautiful! Tools and refreshments provided.",
    time: addDays(new Date(), 10).toISOString(),
    location: "Meet at Central Plaza",
    host_id: "5",
    is_recurring: true,
    recurrence_pattern: "monthly",
    created_at: new Date().toISOString(),
    profiles: {
      id: "5",
      display_name: "Emma Thompson",
      avatar_url: "/placeholder.svg"
    }
  },
  {
    id: "6",
    title: "Local Artists Showcase",
    description: "Exhibition featuring works from neighborhood artists. Light refreshments served.",
    time: addDays(addHours(new Date(), 3), 21).toISOString(),
    location: "Community Center - Gallery",
    host_id: "6",
    is_recurring: false,
    created_at: new Date().toISOString(),
    profiles: {
      id: "6",
      display_name: "Robert Chen",
      avatar_url: "/placeholder.svg"
    }
  }
];

export const useEvents = () => {
  return useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      try {
        return mockEvents;
      } catch (error) {
        console.error('Error in events query:', error);
        throw error;
      }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
