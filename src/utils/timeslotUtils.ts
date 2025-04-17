
/**
 * Time slot utilities for handling date formatting and common operations
 */
import { TimeSlot } from "@/components/skills/contribution/TimeSlotSelector";
import { Json } from "@/integrations/supabase/types"; // Import the Json type from Supabase types

/**
 * Validate that time slots meet the required criteria
 * 
 * @param timeSlots Array of time slots to validate
 * @returns Object with isValid flag and error message if invalid
 */
export const validateTimeSlots = (timeSlots: TimeSlot[]) => {
  // Check if at least 1 date is selected (minimum requirement)
  if (timeSlots.length < 1) {
    return { 
      isValid: false, 
      message: "Please select at least one date for your request"
    };
  }

  // Validate that each date has at least one time preference selected
  if (timeSlots.some(slot => slot.preferences.length === 0)) {
    return { 
      isValid: false, 
      message: "Please select at least one time preference for each selected date"
    };
  }

  // All validations passed
  return { isValid: true };
};

/**
 * Normalize a date to standard format
 */
export const normalizeDate = (date: Date): string => {
  // Format as YYYY-MM-DD
  return date.toISOString().split('T')[0];
};

/**
 * Format a date string for submission with appropriate time based on preference
 * 
 * @param dateStr ISO string date to format
 * @param preference Time preference (morning, afternoon, evening)
 * @returns Formatted ISO date string with appropriate time
 */
export const formatDateWithTimePreference = (dateStr: string, preference: string): string => {
  // Create a new date object from ISO string
  const timeDate = new Date(dateStr);
  
  // CRITICAL FIX: Extract just the date portion (YYYY-MM-DD) to ensure consistent formatting
  const dateOnly = timeDate.toISOString().split('T')[0];
  
  // Add hours based on preference (using standard hours)
  // Morning: 9am, Afternoon: 1pm, Evening: 6pm
  const hours = preference === 'morning' ? 9 : 
               preference === 'afternoon' ? 13 : 18;
  
  // Create a properly formatted time string with UTC time
  const formattedDate = `${dateOnly}T${hours.toString().padStart(2, '0')}:00:00.000Z`;
  
  // Log detailed information for debugging
  console.log('Time slot formatting:', {
    originalDateStr: dateStr,
    extractedDateOnly: dateOnly,
    preference,
    hoursAssigned: hours,
    finalFormattedDate: formattedDate
  });
  
  // Return properly formatted ISO string
  return formattedDate;
};

/**
 * Create time slot objects from selected time slots
 *
 * @param sessionId ID of the session these time slots belong to
 * @param selectedTimeSlots Array of selected time slots
 * @returns Array of formatted time slot objects ready for database insertion
 */
export const createTimeSlotObjects = (
  sessionId: string,
  selectedTimeSlots: TimeSlot[]
) => {
  return selectedTimeSlots.flatMap(slot => {
    // Ensure each date has at least one preference  
    if (slot.preferences.length === 0) {
      console.warn(`Date ${slot.date} has no preferences, adding 'morning' as default`);
      slot.preferences = ['morning'];
    }
    
    return slot.preferences.map(preference => {
      // Format the date correctly using our helper function
      const formattedTime = formatDateWithTimePreference(slot.date, preference);
      
      return {
        session_id: sessionId,
        proposed_time: formattedTime,
      };
    });
  });
};

/**
 * Prepare time slots for stored procedure
 * Formats dates consistently as YYYY-MM-DD and returns properly typed objects
 * 
 * @param selectedTimeSlots Selected time slots to prepare
 * @returns Formatted time slots array for stored procedure that's compatible with Supabase Json type
 */
export const prepareTimeSlots = (selectedTimeSlots: TimeSlot[]): Record<string, Json>[] => {
  // Extract time slots in the format expected by stored procedure
  // Return as a properly typed array of objects that can be properly serialized
  return selectedTimeSlots.map(slot => {
    // Ensure date is in YYYY-MM-DD format
    const formattedDate = new Date(slot.date).toISOString().split('T')[0];
    
    // Ensure preferences is an array of strings (even if empty)
    const preferences = slot.preferences.length > 0 ? 
      slot.preferences : 
      ['morning']; // Default to morning if no preferences
      
    return {
      date: formattedDate,
      preferences: preferences
    };
  });
};
