/**
 * Date utility functions for formatting and displaying dates
 */

import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';

/**
 * Format a date string for display in a user-friendly way
 * - Shows time for today
 * - Shows "Yesterday" for yesterday
 * - Shows date for older dates
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  
  if (isToday(date)) {
    return format(date, 'h:mm a');
  }
  
  if (isYesterday(date)) {
    return 'Yesterday';
  }
  
  // For dates within the last week, show relative time
  const now = new Date();
  const daysDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDiff < 7) {
    return formatDistanceToNow(date, { addSuffix: true });
  }
  
  // For older dates, show the actual date
  return format(date, 'MMM d, yyyy');
};

/**
 * Format a full date with time for event details
 */
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return format(date, 'EEEE, MMMM d, yyyy \'at\' h:mm a');
};

/**
 * Format a date for calendar display
 */
export const formatCalendarDate = (dateString: string): string => {
  const date = new Date(dateString);
  return format(date, 'MMM d');
};