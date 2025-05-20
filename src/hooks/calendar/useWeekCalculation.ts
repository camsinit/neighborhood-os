
/**
 * Hook for calculating week dates
 * 
 * This hook:
 * - Calculates the dates for a week
 * - Ensures proper day of week alignment
 */
import { startOfWeek, addDays } from "date-fns";
import { createLogger } from "@/utils/logger";

// Create a logger for debugging date calculations
const logger = createLogger('useWeekCalculation');

export function useWeekCalculation(currentDate: Date) {
  // Important: Create a new Date object to avoid mutating the original
  const safeDate = new Date(currentDate.getTime());
  
  // Calculate the start of the week (Sunday)
  // Use explicit weekStartsOn: 0 to ensure we start with Sunday
  const weekStart = startOfWeek(safeDate, { weekStartsOn: 0 }); // 0 is Sunday
  
  // Create an array of 7 dates representing the week
  // This array will ALWAYS go from Sunday (index 0) to Saturday (index 6)
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    // Create a new date object for each day to prevent reference issues
    return addDays(new Date(weekStart), i);
  });
  
  // Log the dates to help with debugging
  logger.debug(`Week dates calculated from ${currentDate.toDateString()}:`);
  weekDates.forEach((date, i) => {
    logger.debug(`Day ${i} (${date.toDateString()}) is a ${['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][date.getDay()]}`);
  });
  
  return { weekDates };
}
