/**
 * Time Grouping Utilities
 * 
 * Provides functions to categorize and group items by time intervals
 * for creating organized, chronological displays in feeds
 */
import { differenceInDays, differenceInWeeks, differenceInMonths, isToday, isYesterday } from 'date-fns';

// Define the time interval categories
export type TimeInterval = 'Today' | 'Yesterday' | 'This Week' | 'Last Week' | 'This Month' | 'Older';

/**
 * Determines which time interval category an item belongs to
 * Based on when it was created relative to now
 * 
 * @param createdAt - ISO string of when the item was created
 * @returns TimeInterval category for grouping
 */
export const getTimeInterval = (createdAt: string): TimeInterval => {
  const date = new Date(createdAt);
  const now = new Date();
  
  // Check if it's today or yesterday first (most common cases)
  if (isToday(date)) {
    return 'Today';
  }
  
  if (isYesterday(date)) {
    return 'Yesterday';
  }
  
  // Calculate differences for longer periods
  const daysDiff = differenceInDays(now, date);
  const weeksDiff = differenceInWeeks(now, date);
  const monthsDiff = differenceInMonths(now, date);
  
  // Within current week (2-7 days ago)
  if (daysDiff <= 7) {
    return 'This Week';
  }
  
  // Within last week (8-14 days ago)
  if (weeksDiff === 1) {
    return 'Last Week';
  }
  
  // Within current month
  if (monthsDiff === 0) {
    return 'This Month';
  }
  
  // Everything else is older
  return 'Older';
};

/**
 * Groups an array of items by their time intervals
 * Items should have a created_at field with ISO string
 * 
 * @param items - Array of items with created_at field
 * @returns Object with TimeInterval keys and arrays of items
 */
export const groupByTimeInterval = <T extends { created_at: string }>(
  items: T[]
): Record<TimeInterval, T[]> => {
  // Initialize empty groups for all intervals
  const groups: Record<TimeInterval, T[]> = {
    'Today': [],
    'Yesterday': [],
    'This Week': [],
    'Last Week': [],
    'This Month': [],
    'Older': []
  };
  
  // Sort items by created_at (newest first) before grouping
  const sortedItems = [...items].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  
  // Group each item into its appropriate time interval
  sortedItems.forEach(item => {
    const interval = getTimeInterval(item.created_at);
    groups[interval].push(item);
  });
  
  return groups;
};

/**
 * Returns only the time intervals that have items
 * In chronological order (newest first)
 * 
 * @param groups - Grouped items by time interval
 * @returns Array of [interval, items] tuples for non-empty groups
 */
export const getNonEmptyTimeGroups = <T>(
  groups: Record<TimeInterval, T[]>
): Array<[TimeInterval, T[]]> => {
  // Define the display order (newest first)
  const intervalOrder: TimeInterval[] = [
    'Today',
    'Yesterday', 
    'This Week',
    'Last Week',
    'This Month',
    'Older'
  ];
  
  // Return only groups that have items, in chronological order
  return intervalOrder
    .filter(interval => groups[interval].length > 0)
    .map(interval => [interval, groups[interval]]);
};