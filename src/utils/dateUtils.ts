
/**
 * Central date utilities for the application
 * 
 * This file provides standardized date functions used across the application.
 * All date-related utility functions should be centralized here.
 */
import { format, parseISO, formatISO } from 'date-fns';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';

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
 * Format a date in the specified timezone
 * 
 * @param date Date to format
 * @param format Format string to use
 * @param timezone Timezone to use (e.g. 'America/Los_Angeles')
 * @returns Formatted date string
 */
export const formatInNeighborhoodTimezone = (
  date: Date | string,
  formatString: string,
  timezone: string = 'America/Los_Angeles'
): string => {
  // Convert string dates to Date objects if needed
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatInTimeZone(dateObj, timezone, formatString);
};

/**
 * Convert a date and time to the specified timezone
 * 
 * @param date Date string or object
 * @param timezone Timezone to use (e.g. 'America/Los_Angeles')
 * @returns Date object in the specified timezone
 */
export const toNeighborhoodTimezone = (
  date: Date | string,
  timezone: string = 'America/Los_Angeles'
): Date => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return toZonedTime(dateObj, timezone);
};

/**
 * Format date for display in the timezone of the neighborhood
 * 
 * @param dateString ISO date string
 * @param timezone Timezone of the neighborhood
 * @returns Formatted date string for display
 */
export const formatDateForDisplay = (
  dateString: string,
  timezone: string = 'America/Los_Angeles'
): string => {
  return formatInNeighborhoodTimezone(dateString, 'MMMM d, yyyy h:mm a', timezone);
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
 * Ensures a date string and time string are properly combined and preserved
 * to avoid timezone issues that could shift the date.
 * 
 * @param dateStr Date string in YYYY-MM-DD format
 * @param timeStr Time string in HH:MM format
 * @param timezone Timezone of the neighborhood (default: 'America/Los_Angeles')
 * @returns Combined date-time ISO string that preserves the intended date
 */
export const combineDateAndTime = (
  dateStr: string, 
  timeStr: string, 
  timezone: string = 'America/Los_Angeles'
): string => {
  // Log the inputs for debugging
  console.log(`[combineDateAndTime] Combining date: ${dateStr}, time: ${timeStr}, timezone: ${timezone}`);
  
  // First, ensure we have valid strings
  if (!dateStr || !timeStr) {
    console.error('[combineDateAndTime] Invalid date or time string provided');
    return '';
  }
  
  // Parse the date and time components
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  // Create a date in the local timezone first
  const localDate = new Date(year, month - 1, day, hours, minutes);
  
  // Convert to the neighborhood's timezone to ensure the date/time is preserved as intended
  // This is the key fix - creating a date in the correct timezone context
  const zonedDate = toZonedTime(localDate, timezone);
  
  // Format to ISO 8601 in the neighborhood timezone
  // This preserves the exact date and time as input by the user
  const formattedDate = formatISO(zonedDate);
  
  // Log the resulting date for debugging
  console.log('[combineDateAndTime] Result:', {
    input: { dateStr, timeStr, timezone },
    localDate: localDate.toString(),
    zonedDate: zonedDate.toString(),
    formattedIso: formattedDate
  });
  
  return formattedDate;
};

/**
 * Returns a list of common timezones for selection
 * This is used in timezone selection dropdowns
 * 
 * @returns Array of timezone objects with name and display name
 */
export const getCommonTimezones = (): { value: string, label: string }[] => {
  return [
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Anchorage', label: 'Alaska Time' },
    { value: 'Pacific/Honolulu', label: 'Hawaii Time' },
    { value: 'America/Puerto_Rico', label: 'Atlantic Time' },
    { value: 'Europe/London', label: 'GMT/UTC' },
    { value: 'Europe/Paris', label: 'Central European Time' },
    { value: 'Asia/Tokyo', label: 'Japan Time' },
    { value: 'Asia/Shanghai', label: 'China Time' },
    { value: 'Australia/Sydney', label: 'Australian Eastern Time' }
  ];
};
