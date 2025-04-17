
/**
 * Utility functions for date handling in time slot selection
 */

/**
 * Normalizes a date to noon UTC to avoid timezone issues
 * 
 * @param date The date to normalize
 * @returns ISO string of the normalized date
 */
export const normalizeDate = (date: Date): string => {
  // Create a UTC date with just the date portion (year, month, day)
  const normalizedDate = new Date(Date.UTC(
    date.getFullYear(), 
    date.getMonth(), 
    date.getDate()
  ));
  
  // Set it to noon UTC (12:00) to avoid timezone issues
  normalizedDate.setUTCHours(12, 0, 0, 0);
  
  // Return as ISO string for consistent serialization
  return normalizedDate.toISOString();
};

/**
 * Get count of unique dates in the time slots
 * 
 * @param timeSlots Array of time slots to check
 * @returns Number of unique dates
 */
export const getUniqueDatesCount = (timeSlots: { date: string }[]): number => {
  // Extract just the date part (YYYY-MM-DD) from each ISO string for better comparison
  const uniqueDates = new Set(
    timeSlots.map(slot => new Date(slot.date).toISOString().split('T')[0])
  );
  
  return uniqueDates.size;
};

/**
 * Logs detailed information about a date for debugging
 * 
 * @param label Label for the log entry
 * @param date Date to log details about
 */
export const logDateDetails = (label: string, date: Date): void => {
  console.log(`${label} (DEBUG):`, {
    dateObj: date,
    dateComponents: {
      year: date.getFullYear(),
      month: date.getMonth(),
      day: date.getDate(),
      hours: date.getHours(),
      minutes: date.getMinutes(),
      seconds: date.getSeconds(),
      milliseconds: date.getMilliseconds(),
      timestamp: date.getTime(),
      timezoneOffset: date.getTimezoneOffset(),
      utcDateString: date.toUTCString(),
      simpleDatePart: date.toISOString().split('T')[0]
    }
  });
};
