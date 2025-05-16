
/**
 * Hook for managing calendar view state
 * 
 * This hook handles:
 * - View type state (month, week, agenda)
 * - View transitions
 */
import { useState } from "react";
import { useEffect } from "react";

export type CalendarViewType = 'week' | 'month' | 'agenda';

interface UseCalendarViewProps {
  initialView?: CalendarViewType;
}

export function useCalendarView({ initialView = 'week' }: UseCalendarViewProps = {}) {
  // State for the current view mode
  const [view, setView] = useState<CalendarViewType>(initialView);
  
  // Update view when initialView changes (from props)
  useEffect(() => {
    if (initialView) {
      setView(initialView);
    }
  }, [initialView]);
  
  return {
    view,
    setView
  };
}
