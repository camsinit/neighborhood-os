
/**
 * Hook for managing event highlighting
 * 
 * This hook handles:
 * - Processing highlighted event IDs
 * - Navigating to highlighted events
 */
import { useEffect } from "react";
import { parseISO, isSameMonth } from "date-fns";
import { highlightItem } from "@/utils/highlight";
import { Event as LocalEvent } from "@/types/localTypes";

interface UseEventHighlightingProps {
  highlightedId: string | null;
  events: LocalEvent[] | undefined;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
}

export function useEventHighlighting({
  highlightedId,
  events,
  currentDate,
  setCurrentDate
}: UseEventHighlightingProps) {
  
  // Handle highlighting when highlightedId changes
  useEffect(() => {
    if (highlightedId && events) {
      const event = events.find(event => event.id === highlightedId);
      if (event) {
        const eventDate = parseISO(event.time);
        // Update current date to event date to ensure it's visible
        setCurrentDate(eventDate);
      }
    }
  }, [highlightedId, events, setCurrentDate]);
  
  return {
    highlightedId
  };
}
