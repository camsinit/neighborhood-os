
import { toNeighborhoodTimezone, combineDateAndTime } from "@/utils/dateUtils";

/**
 * Transforms event form data into the format required by the database
 * 
 * @param formData - The form data from the event form
 * @param userId - The ID of the user creating the event
 * @param neighborhoodId - The ID of the neighborhood the event belongs to
 * @param timezone - The timezone of the neighborhood
 * @returns The transformed event data
 */
export const transformEventFormData = (
  formData: any, 
  userId: string, 
  neighborhoodId: string,
  timezone: string = 'America/Los_Angeles'
) => {
  // Use our utility function to properly combine date and time with respect to timezone
  const dateTimeStr = combineDateAndTime(formData.date, formData.time, timezone);
  
  // Log the date string to help with debugging
  console.log(`[transformEventFormData] Combined date-time string: ${dateTimeStr} (timezone: ${timezone})`);
  
  // Ensure the time field is in the correct format: YYYY-MM-DDTHH:MM
  // This provides a standardized format for the database
  return {
    title: formData.title,
    description: formData.description || '', // Ensure description is never null
    location: formData.location,
    host_id: userId,
    neighborhood_id: neighborhoodId,
    // Use the properly combined date and time
    time: dateTimeStr,
    // Include these fields only for UI display if they exist in the form data
    is_recurring: formData.isRecurring || false,
    recurrence_pattern: formData.isRecurring ? formData.recurrencePattern : null,
    recurrence_end_date: formData.isRecurring ? formData.recurrenceEndDate : null
  };
};

/**
 * Transforms event update form data into the format required by the database
 * 
 * @param formData - The form data from the event form
 * @param timezone - The timezone of the neighborhood
 * @returns The transformed event update data
 */
export const transformEventUpdateData = (
  formData: any,
  timezone: string = 'America/Los_Angeles'
) => {
  // Use our utility function to properly combine date and time
  const dateTimeStr = combineDateAndTime(formData.date, formData.time, timezone);
  
  // Log the date string to help with debugging
  console.log(`[transformEventUpdateData] Combined date-time string: ${dateTimeStr} (timezone: ${timezone})`);
  
  return {
    title: formData.title,
    description: formData.description || '', // Ensure description is never null
    location: formData.location,
    // Use the properly combined date and time
    time: dateTimeStr,
    // Include these fields for UI display
    is_recurring: formData.isRecurring || false,
    recurrence_pattern: formData.isRecurring ? formData.recurrencePattern : null,
    recurrence_end_date: formData.isRecurring ? formData.recurrenceEndDate : null
  };
};
