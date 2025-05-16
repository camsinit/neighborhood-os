
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

export function useCalendarNavigation() {
  // State for the currently viewed date
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Handle navigation to previous period (week or month)
  const handlePrevious = (view: 'week' | 'month' | 'agenda') => {
    if (view === 'week' || view === 'agenda') {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(subMonths(currentDate, 1));
    }
  };

  // Handle navigation to next period (week or month)
  const handleNext = (view: 'week' | 'month' | 'agenda') => {
    if (view === 'week' || view === 'agenda') {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(addMonths(currentDate, 1));
    }
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
