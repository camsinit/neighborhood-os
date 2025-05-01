
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
  // We need to ensure the date is interpreted correctly without timezone shifting
  // First, create a date object from the form date and time
  const dateStr = `${formData.date}T${formData.time}`;
  
  // Log the date string to help with debugging
  console.log(`[transformEventFormData] Original date string: ${dateStr}`);
  
  return {
    title: formData.title,
    description: formData.description,
    location: formData.location,
    host_id: userId,
    neighborhood_id: neighborhoodId,
    // Explicitly format the time to ensure consistency
    time: dateStr,
    // Include these fields only for UI display, not stored in DB yet
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
  // We need to ensure the date is interpreted correctly without timezone shifting
  const dateStr = `${formData.date}T${formData.time}`;
  
  // Log the date string to help with debugging
  console.log(`[transformEventUpdateData] Original date string: ${dateStr}`);
  
  return {
    title: formData.title,
    description: formData.description,
    location: formData.location,
    // Explicitly format the time to ensure consistency
    time: dateStr,
    // Include these fields only for UI display, not stored in DB yet
    is_recurring: formData.isRecurring || false,
    recurrence_pattern: formData.isRecurring ? formData.recurrencePattern : null,
    recurrence_end_date: formData.isRecurring ? formData.recurrenceEndDate : null
  };
};
