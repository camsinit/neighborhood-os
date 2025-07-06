import { addDays, addWeeks, addMonths, isBefore, parseISO, format } from 'date-fns';
import { Event } from '@/types/localTypes';

/**
 * Generates recurring event instances based on the base event's recurrence settings
 * This function creates individual event instances for display in the calendar
 * 
 * @param baseEvent - The original recurring event from the database
 * @param startDate - Start date for generating instances (usually current month start)
 * @param endDate - End date for generating instances (usually a few months ahead)
 * @returns Array of event instances with adjusted dates and unique IDs
 */
export const generateRecurringInstances = (
  baseEvent: Event, 
  startDate: Date, 
  endDate: Date
): Event[] => {
  // If the event is not recurring, return the original event if it falls within range
  if (!baseEvent.is_recurring) {
    const eventDate = parseISO(baseEvent.time);
    if (eventDate >= startDate && eventDate <= endDate) {
      return [baseEvent];
    }
    return [];
  }

  const instances: Event[] = [];
  const originalDate = parseISO(baseEvent.time);
  let currentDate = new Date(originalDate);
  
  // Start generating from the first occurrence after or at startDate
  while (currentDate < startDate) {
    currentDate = getNextOccurrence(currentDate, baseEvent.recurrence_pattern);
  }

  // Generate instances until we hit the end date or recurrence end date
  const recurrenceEndDate = baseEvent.recurrence_end_date 
    ? parseISO(baseEvent.recurrence_end_date) 
    : null;

  let instanceCount = 0;
  const maxInstances = 100; // Safety limit to prevent infinite loops

  while (
    instanceCount < maxInstances &&
    currentDate <= endDate && 
    (!recurrenceEndDate || currentDate <= recurrenceEndDate)
  ) {
    // Create a new event instance with the adjusted date
    const instance: Event = {
      ...baseEvent,
      // Generate a unique ID for this instance by combining base ID with date
      id: `${baseEvent.id}_${format(currentDate, 'yyyy-MM-dd')}`,
      time: currentDate.toISOString(),
      // Mark this as a recurring instance for special handling
      metadata: {
        isRecurringInstance: true,
        originalEventId: baseEvent.id,
        originalDate: baseEvent.time
      }
    };

    instances.push(instance);
    
    // Move to the next occurrence
    currentDate = getNextOccurrence(currentDate, baseEvent.recurrence_pattern);
    instanceCount++;
  }

  return instances;
};

/**
 * Calculates the next occurrence date based on the recurrence pattern
 * 
 * @param currentDate - Current date to calculate from
 * @param pattern - Recurrence pattern (daily, weekly, bi-weekly, monthly)
 * @returns Next occurrence date
 */
const getNextOccurrence = (currentDate: Date, pattern: string | null): Date => {
  switch (pattern) {
    case 'daily':
      return addDays(currentDate, 1);
    case 'weekly':
      return addWeeks(currentDate, 1);
    case 'bi-weekly':
      return addWeeks(currentDate, 2);
    case 'monthly':
      return addMonths(currentDate, 1);
    default:
      // Default to weekly if pattern is unclear
      return addWeeks(currentDate, 1);
  }
};

/**
 * Filters events to include both regular events and generated recurring instances
 * This is the main function that should be used by calendar components
 * 
 * @param events - Base events from the database
 * @param startDate - Start date for the calendar view
 * @param endDate - End date for the calendar view
 * @returns Combined array of regular and recurring event instances
 */
export const getEventsWithRecurring = (
  events: Event[], 
  startDate: Date, 
  endDate: Date
): Event[] => {
  const allEvents: Event[] = [];

  events.forEach(event => {
    const instances = generateRecurringInstances(event, startDate, endDate);
    allEvents.push(...instances);
  });

  // Sort all events by time
  return allEvents.sort((a, b) => 
    new Date(a.time).getTime() - new Date(b.time).getTime()
  );
};