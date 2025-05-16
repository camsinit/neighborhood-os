
/**
 * Hook for managing calendar events
 * 
 * This hook provides:
 * - Event fetching functionality
 * - Event filtering by date
 * - Event addition handling
 */
import { useState } from "react";
import { useEvents } from "@/utils/queries/useEvents";
import { toast } from "sonner";
import { createLogger } from "@/utils/logger";
import { Event as LocalEvent } from "@/types/localTypes";
import { isEqual, parseISO } from "date-fns";

// Create a logger for this hook
const logger = createLogger('useCalendarEvents');

export function useCalendarEvents() {
  // State for add event dialog
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  
  // Fetch events data with React Query
  const { data: events, isLoading, refetch } = useEvents();
  
  // Type-safe function to get events for a specific date
  const getEventsForDate = (date: Date): LocalEvent[] => {
    if (!events) return [];
    
    return events.filter(event => {
      const eventDate = parseISO(event.time);
      return isEqual(
        new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate()),
        new Date(date.getFullYear(), date.getMonth(), date.getDate())
      );
    }) as LocalEvent[];
  };

  // Handle event addition and trigger refetch
  const handleAddEvent = async () => {
    logger.debug("Event added, refreshing data");
    await refetch();
    
    // Show toast confirming event creation
    toast.success("Event created successfully!", {
      position: "bottom-right",
      duration: 3000
    });
  };
  
  return {
    events: events as LocalEvent[] | undefined,
    isLoading,
    getEventsForDate,
    refetch,
    handleAddEvent,
    isAddEventOpen, 
    setIsAddEventOpen
  };
}
