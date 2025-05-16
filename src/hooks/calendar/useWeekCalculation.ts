
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
  // Fix: Explicitly set weekStartsOn to 0 (Sunday) to ensure correct day alignment
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 }); // 0 is Sunday
  
  // Create an array of 7 dates representing the week
  // This gives us Sunday through Saturday as expected
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  
  return { weekDates };
}
