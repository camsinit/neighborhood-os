
import { useState } from "react";
import { 
  addWeeks, 
  subWeeks, 
  startOfWeek, 
  addDays,
  addMonths,
  subMonths,
  isEqual,
} from "date-fns";
import { addScaleAnimation } from "@/utils/animations";
import { Event } from "@/types/localTypes";

/**
 * Custom hook that manages calendar state and operations
 * 
 * This hook centralizes calendar-related state and functions:
 * - Tracks the current date and view mode
 * - Provides navigation functions (previous, next, today)
 * - Handles event filtering by date
 * 
 * @param initialView - The initial view mode for the calendar
 */
export function useCalendarState(initialView: 'week' | 'month' | 'agenda' = 'week') {
  // State for current date and view mode
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'week' | 'month' | 'agenda'>(initialView);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  
  // Calculate date ranges based on current view
  const weekStart = startOfWeek(currentDate);
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Handle navigation functions
  const handlePrevious = () => {
    if (view === 'week') {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(subMonths(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (view === 'week') {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    addScaleAnimation(document.querySelector('.calendar-container'));
  };

  // Type-safe function to get events for a specific date
  const getEventsForDate = (date: Date, events?: Event[]): Event[] => {
    if (!events) return [];
    
    return events.filter(event => {
      const eventDate = new Date(event.time);
      return isEqual(
        new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate()),
        new Date(date.getFullYear(), date.getMonth(), date.getDate())
      );
    });
  };

  return {
    currentDate,
    view,
    setView,
    weekDates,
    isAddEventOpen,
    setIsAddEventOpen,
    handlePrevious,
    handleNext,
    handleToday,
    getEventsForDate,
  };
}
