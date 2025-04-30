
/**
 * Utility functions for transforming event form data into database format
 * 
 * These functions handle data preparation for database operations
 */

/**
 * Transform form data into the database schema for event creation
 * 
 * @param formData - The raw form data from the UI
 * @param userId - Current user's ID
 * @param neighborhoodId - Current neighborhood ID
 * @returns Properly formatted event data for database insertion
 */
export const transformEventFormData = (
  formData: any, 
  userId: string,
  neighborhoodId: string
) => {
  // Transform the date and time fields into a single ISO timestamp
  const combinedTime = formData.date && formData.time 
    ? `${formData.date}T${formData.time}` 
    : null;

  // IMPORTANT: Filter the form data to only include fields that exist in the events table
  // This ensures we don't try to insert fields like isRecurring that are UI-only
  return {
    title: formData.title,
    description: formData.description,
    time: combinedTime, // Use the combined timestamp
    location: formData.location,
    host_id: userId,
    neighborhood_id: neighborhoodId // Use the neighborhood.id (string) not the whole object
  };
};

/**
 * Transform form data into the database schema for event updates
 * 
 * @param formData - The raw form data from the UI
 * @returns Properly formatted event data for database update
 */
export const transformEventUpdateData = (formData: any) => {
  // Transform the date and time fields into a single ISO timestamp
  const combinedTime = formData.date && formData.time 
    ? `${formData.date}T${formData.time}` 
    : null;

  // IMPORTANT: Filter to only include fields that exist in the database schema
  return {
    title: formData.title,
    description: formData.description,
    time: combinedTime, // Use the combined timestamp
    location: formData.location
    // Do NOT include UI-only fields like isRecurring, recurrencePattern, etc.
  };
};
