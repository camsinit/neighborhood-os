
/**
 * Time slot utilities for handling date formatting and common operations
 * used across both request and contribution flows
 */
import { TimeSlot } from "@/components/skills/contribution/TimeSlotSelector";

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
 * Formats dates consistently as YYYY-MM-DD
 * 
 * @param selectedTimeSlots Selected time slots to prepare
 * @returns Formatted time slots array for stored procedure
 */
export const prepareTimeSlots = (selectedTimeSlots: TimeSlot[]) => {
  // Extract time slots in the format expected by stored procedure
  return selectedTimeSlots.map(slot => ({
    // CRITICAL FIX: Use only YYYY-MM-DD format for consistent date parsing
    date: new Date(slot.date).toISOString().split('T')[0], 
    preferences: slot.preferences.length > 0 ? slot.preferences : ['morning'] // Ensure at least one preference
  }));
};

/**
 * Validate that time slots meet the required criteria
 * 
 * @param timeSlots Array of time slots to validate
 * @param requiredDatesCount Number of required unique dates (default to 1 - minimum requirement)
 * @returns Object with isValid flag and error message if invalid
 */
export const validateTimeSlots = (timeSlots: TimeSlot[], requiredDatesCount = 1) => {
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

  // Extract just the date part (YYYY-MM-DD) from each ISO string for counting unique dates
  const uniqueDateStrings = new Set(
    timeSlots.map(slot => new Date(slot.date).toISOString().split('T')[0])
  );
  
  // Log detailed info about unique dates
  console.log("Validation - Unique dates check:", {
    selectedSlotsCount: timeSlots.length,
    uniqueDatesCount: uniqueDateStrings.size,
    uniqueDates: Array.from(uniqueDateStrings),
    allDateStrings: timeSlots.map(slot => new Date(slot.date).toISOString().split('T')[0])
  });
  
  // All validations passed
  return { isValid: true };
};
