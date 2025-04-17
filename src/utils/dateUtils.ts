/**
 * Utility functions for date handling in time slot selection
 * 
 * NOTICE: This file is being retained for backward compatibility.
 * New code should use the centralized date utilities in src/utils/dateUtils.ts
 */

/**
 * Normalize a date to an ISO string
 * This strips the time component and returns a consistent date string
 * 
 * @param date Date to normalize
 * @returns Normalized ISO date string
 */
export const normalizeDate = (date: Date): string => {
  // Create a new date with the same year, month, day in UTC to avoid timezone issues
  const normalized = new Date(Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    12, 0, 0, 0 // Set to noon UTC to avoid timezone crossing day boundaries
  ));
  
  return normalized.toISOString();
};

/**
 * Count unique dates in an array of time slots
 * 
 * @param timeSlots Array of time slots
 * @returns Count of unique dates
 */
export const getUniqueDatesCount = (timeSlots: {date: string}[]): number => {
  // Extract just the date part (YYYY-MM-DD) from each ISO string
  const uniqueDates = new Set(
    timeSlots.map(slot => new Date(slot.date).toISOString().split('T')[0])
  );
  return uniqueDates.size;
};

/**
 * Log detailed information about a date for debugging
 * 
 * @param context Description of the context
 * @param date Date to log
 */
export const logDateDetails = (context: string, date: Date): void => {
  const isoString = date.toISOString();
  const utcString = date.toUTCString();
  const dateOnlyString = isoString.split('T')[0];
  
  console.log(`${context} - Date details:`, {
    original: date,
    iso: isoString,
    utc: utcString,
    dateOnly: dateOnlyString,
    year: date.getFullYear(),
    month: date.getMonth() + 1, // 0-based, so add 1
    day: date.getDate()
  });
};

import { normalizeDate as normalizeDateOriginal, getUniqueDatesCount as getUniqueDatesCountOriginal, logDateDetails as logDateDetailsOriginal } from '@/utils/dateUtils';

// Export the functions directly from the central utilities
export { normalizeDateOriginal as normalizeDate, getUniqueDatesCountOriginal as getUniqueDatesCount, logDateDetailsOriginal as logDateDetails };
