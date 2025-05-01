
/**
 * Central date utilities for the application
 * 
 * This file provides standardized date functions used across the application.
 * All date-related utility functions should be centralized here.
 */
import { format, parseISO } from 'date-fns';
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
