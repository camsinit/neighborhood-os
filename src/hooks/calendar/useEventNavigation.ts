
/**
 * Hook for handling navigation to events
 * 
 * This hook:
 * - Sets up event listeners for navigating to events
 * - Handles view changes when navigating to events
 */
import { useEffect } from "react";
import { parseISO, isSameMonth } from "date-fns";
import { highlightItem } from "@/utils/highlight";
import { Event as LocalEvent } from "@/types/localTypes";
import { CalendarViewType } from "./useCalendarView";

interface UseEventNavigationProps {
  events: LocalEvent[] | undefined;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  view: CalendarViewType;
  setView: (view: CalendarViewType) => void;
}

export function useEventNavigation({
  events,
  currentDate,
  setCurrentDate,
  view,
  setView
}: UseEventNavigationProps) {

  // Handle event navigation (e.g. from notifications)
  useEffect(() => {
    const handleNavigateToEvent = (e: CustomEvent) => {
      const eventId = e.detail.eventId;
      const event = events?.find(event => event.id === eventId);
      
      if (event) {
        const eventDate = parseISO(event.time);
        
        // Update current date to event date
        setCurrentDate(eventDate);
        
        // Switch to appropriate view based on date
        if (!isSameMonth(eventDate, currentDate)) {
          setView('month');
        }

        // Highlight the event
        setTimeout(() => {
          highlightItem('event', eventId, true);
        }, 100);
      }
    };

    window.addEventListener('navigateToEvent', handleNavigateToEvent as EventListener);
    return () => {
      window.removeEventListener('navigateToEvent', handleNavigateToEvent as EventListener);
    };
  }, [events, currentDate, setCurrentDate, setView]);
  
  return {};
}
