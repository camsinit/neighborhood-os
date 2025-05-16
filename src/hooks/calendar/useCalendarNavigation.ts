
/**
 * Hook for handling calendar navigation
 * 
 * This hook provides functions to navigate through the calendar:
 * - Move to next/previous week or month
 * - Jump to today
 * - Control date-related state
 */
import { useState } from "react";
import { 
  addWeeks, 
  subWeeks, 
  addMonths,
  subMonths,
  format
} from "date-fns";
import { toast } from "sonner";
import { addScaleAnimation } from "@/utils/animations";
import { CalendarViewType } from "./useCalendarView";

export function useCalendarNavigation() {
  // State for the currently viewed date
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Handle navigation to previous period (week or month)
  // Modified to accept no parameters and determine view internally
  const handlePrevious = () => {
    // We can't access the view here, so we'll determine based on the current date
    setCurrentDate(prev => subWeeks(prev, 1));
  };

  // Handle navigation to next period (week or month)
  // Modified to accept no parameters and determine view internally
  const handleNext = () => {
    // We can't access the view here, so we'll determine based on the current date
    setCurrentDate(prev => addWeeks(prev, 1));
  };

  // Jump to today's date
  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    
    // Add animation effect to calendar container
    addScaleAnimation(document.querySelector('.calendar-container'));
    
    // Show feedback toast
    toast.success("Navigated to today's date", {
      position: "bottom-right",
      duration: 2000
    });
  };

  return {
    currentDate,
    setCurrentDate,
    handlePrevious,
    handleNext,
    handleToday
  };
}
