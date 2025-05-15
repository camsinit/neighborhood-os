
/**
 * Utility functions for formatting time in activity items
 */
import { differenceInHours, differenceInDays, differenceInWeeks, differenceInMonths } from "date-fns";

/**
 * Helper function to format time since activity in a compact way
 * 
 * @param date - The date to format
 * @returns A compact string representation of time elapsed (e.g., "3hr", "5d")
 */
export const getCompactTimeAgo = (date: Date): string => {
  // This function formats the timestamp into a human-readable format
  const now = new Date();
  const hours = differenceInHours(now, date);
  const days = differenceInDays(now, date);
  const weeks = differenceInWeeks(now, date);
  const months = differenceInMonths(now, date);

  if (hours < 24) {
    return `${hours}hr`;
  } else if (days < 7) {
    return `${days}d`;
  } else if (weeks < 4) {
    return `${weeks}w`;
  } else {
    return `${months}mo`;
  }
};
