
import { toNeighborhoodTimezone } from "@/utils/dateUtils";

/**
 * Transforms event form data into the format required by the database
 * 
 * @param formData - The form data from the event form
 * @param userId - The ID of the user creating the event
 * @param neighborhoodId - The ID of the neighborhood the event belongs to
 * @returns The transformed event data
 */
export const transformEventFormData = (formData: any, userId: string, neighborhoodId: string) => {
  // Construct the proper date time string
  // We need to ensure the date is interpreted correctly in the neighborhood's timezone
  const dateStr = `${formData.date}T${formData.time}`;
  
  // Log the date string to help with debugging
  console.log(`[transformEventFormData] Original date string: ${dateStr}`);
  
  // Ensure the time field is in the correct format: YYYY-MM-DDTHH:MM
  // This provides a standardized format for the database
  return {
    title: formData.title,
    description: formData.description || '', // Ensure description is never null
    location: formData.location,
    host_id: userId,
    neighborhood_id: neighborhoodId,
    // Explicitly format the time to ensure consistency
    time: dateStr,
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
 * @returns The transformed event update data
 */
export const transformEventUpdateData = (formData: any) => {
  // Construct the proper date time string
  // We need to ensure the date is interpreted correctly in the neighborhood's timezone
  const dateStr = `${formData.date}T${formData.time}`;
  
  // Log the date string to help with debugging
  console.log(`[transformEventUpdateData] Original date string: ${dateStr}`);
  
  return {
    title: formData.title,
    description: formData.description || '', // Ensure description is never null
    location: formData.location,
    // Explicitly format the time to ensure consistency
    time: dateStr,
    // Include these fields for UI display
    is_recurring: formData.isRecurring || false,
    recurrence_pattern: formData.isRecurring ? formData.recurrencePattern : null,
    recurrence_end_date: formData.isRecurring ? formData.recurrenceEndDate : null
  };
};
