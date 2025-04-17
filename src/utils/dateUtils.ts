
/**
 * Central date utilities for the application
 * 
 * This file provides standardized date functions used across the application.
 * All date-related utility functions should be centralized here.
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

/**
 * Format a date for display in the UI
 * 
 * @param dateString ISO date string
 * @returns Formatted date string for display
 */
export const formatDateForDisplay = (dateString: string): string => {
  // Create a new date from the ISO string
  const date = new Date(dateString);
  
  // Format as "Month Day, Year" (e.g., "April 19, 2025")
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  
  return date.toLocaleDateString('en-US', options);
};
