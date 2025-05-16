
/**
 * Hook for calculating month calendar dates
 * 
 * This hook:
 * - Calculates all days to display in a month view calendar
 */
import { startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";

export function useMonthCalculation(currentDate: Date) {
  // Calculate month start and end
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  
  // Get all days in the month
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  return { days, monthStart, monthEnd };
}
