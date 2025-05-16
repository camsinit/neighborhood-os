
/**
 * Hook for calculating week dates
 * 
 * This hook:
 * - Calculates the dates for a week
 * - Ensures proper day of week alignment
 */
import { startOfWeek, addDays } from "date-fns";

export function useWeekCalculation(currentDate: Date) {
  // Calculate the start of the week (Sunday)
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 }); // 0 is Sunday
  
  // Create an array of 7 dates representing the week
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  
  return { weekDates };
}
