
/**
 * Centralized date utilities for consistent date handling across the application
 * 
 * This file contains utility functions for date manipulation, formatting,
 * normalization, and timezone handling to ensure consistency throughout the app.
 */
import { format, isValid, parseISO, formatISO } from 'date-fns';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';

/**
 * Normalize a date to noon UTC to avoid timezone issues when only the date matters
 * 
 * @param date - The date to normalize (Date object or ISO string)
 * @returns ISO string of the normalized date at 12:00 UTC
 */
export const normalizeDate = (date: Date | string): string => {
  // Handle string input by converting to Date object
  const inputDate = typeof date === 'string' ? new Date(date) : date;
  
  // Create a UTC date with just the date portion (year, month, day)
  const normalizedDate = new Date(Date.UTC(
    inputDate.getFullYear(), 
    inputDate.getMonth(), 
    inputDate.getDate()
  ));
  
  // Set it to noon UTC (12:00) to avoid timezone issues
  normalizedDate.setUTCHours(12, 0, 0, 0);
  
  // Return as ISO string for consistent serialization
  return normalizedDate.toISOString();
};

/**
 * Get count of unique dates in an array of objects that have a date property
 * 
 * @param items - Array of objects with a date property
 * @param dateField - Name of the date field to check (default: 'date')
 * @returns Number of unique dates
 */
export const getUniqueDatesCount = <T extends { [key: string]: any }>(
  items: T[],
  dateField: keyof T = 'date' as keyof T
): number => {
  // Extract just the date part (YYYY-MM-DD) from each ISO string for better comparison
  const uniqueDates = new Set(
    items.map(item => {
      const dateValue = item[dateField];
      return new Date(dateValue).toISOString().split('T')[0];
    })
  );
  
  return uniqueDates.size;
};

/**
 * Format a date for display, using the user's timezone if available
 * 
 * @param date - Date to format (Date object or ISO string)
 * @param formatString - Format pattern (default: 'PPP')
 * @param timezone - Optional timezone (default: user's timezone or UTC)
 * @returns Formatted date string
 */
export const formatDateForDisplay = (
  date: Date | string | null | undefined,
  formatString: string = 'PPP',
  timezone?: string
): string => {
  if (!date) return 'Invalid date';
  
  try {
    // Parse string to Date if needed
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    
    // Validate the date
    if (!isValid(dateObj)) return 'Invalid date';
    
    // Use the user's timezone if available, otherwise use system timezone
    const userTimezone = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    
    // Convert to zoned time and format
    return formatInTimeZone(dateObj, userTimezone, formatString);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

/**
 * Get just the date part (YYYY-MM-DD) from a date for comparison
 * 
 * @param date - Date to get date part from (Date object or ISO string)
 * @returns Date part as string (YYYY-MM-DD)
 */
export const getDatePart = (date: Date | string | null | undefined): string => {
  if (!date) return '';
  
  try {
    // Parse string to Date if needed
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    
    // Validate the date
    if (!isValid(dateObj)) return '';
    
    // Return just the date part
    return formatISO(dateObj).split('T')[0];
  } catch (error) {
    console.error('Error getting date part:', error);
    return '';
  }
};

/**
 * Convert a date to the user's timezone
 * 
 * @param date - Date to convert (Date object or ISO string)
 * @param timezone - Optional timezone (default: user's timezone or UTC)
 * @returns Date object in the specified timezone
 */
export const toUserTimezone = (
  date: Date | string,
  timezone?: string
): Date => {
  // Parse string to Date if needed
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  // Use the user's timezone if available, otherwise use system timezone
  const userTimezone = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  
  // Convert to user timezone
  return toZonedTime(dateObj, userTimezone);
};

/**
 * Logs detailed information about a date for debugging
 * 
 * @param label - Label for the log entry
 * @param date - Date to log details about
 */
export const logDateDetails = (label: string, date: Date | string): void => {
  // Handle string input by converting to Date object
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  console.log(`${label} (DEBUG):`, {
    dateObj,
    dateComponents: {
      year: dateObj.getFullYear(),
      month: dateObj.getMonth(),
      day: dateObj.getDate(),
      hours: dateObj.getHours(),
      minutes: dateObj.getMinutes(),
      seconds: dateObj.getSeconds(),
      milliseconds: dateObj.getMilliseconds(),
      timestamp: dateObj.getTime(),
      timezoneOffset: dateObj.getTimezoneOffset(),
      utcDateString: dateObj.toUTCString(),
      simpleDatePart: dateObj.toISOString().split('T')[0],
      userTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      formattedInUserTz: formatDateForDisplay(dateObj, 'PPpp')
    }
  });
};

/**
 * Validate that a date is in the future
 * 
 * @param date - Date to validate (Date object or ISO string)
 * @returns true if date is in the future, false otherwise
 */
export const isFutureDate = (date: Date | string): boolean => {
  // Handle string input by converting to Date object
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Check if date is in the future
  return dateObj.getTime() > Date.now();
};
