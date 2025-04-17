
import React from "react";
import { addDays } from "date-fns";
import { TimeSlot } from "./contribution/TimeSlotSelector";
import DateCalendarSection from "./time-selection/DateCalendarSection";
import TimeSlotList from "./time-selection/TimeSlotList";
import { normalizeDate, getUniqueDatesCount, logDateDetails } from "@/utils/dateUtils";

/**
 * Props for the TimeSlotSelectionSection component
 */
interface TimeSlotSelectionSectionProps {
  selectedTimeSlots: TimeSlot[]; 
  setSelectedTimeSlots: React.Dispatch<React.SetStateAction<TimeSlot[]>>;
  disabledDays: { before: Date; after: Date };
  requiredDatesCount?: number; // Make this an optional prop with default value
}

/**
 * A component that handles the selection of dates and time preferences for skill sessions
 * 
 * This component has been refactored to:
 * 1. Use smaller sub-components for better maintainability
 * 2. Standardize date handling with utility functions
 * 3. Improve logging for debugging
 */
const TimeSlotSelectionSection: React.FC<TimeSlotSelectionSectionProps> = ({
  selectedTimeSlots,
  setSelectedTimeSlots,
  disabledDays,
  requiredDatesCount = 1 // Default to 1 if not provided
}) => {
  // Count of unique dates for validation
  const uniqueDatesCount = getUniqueDatesCount(selectedTimeSlots);

  /**
   * Handles the selection of a date from the calendar
   * - Adds the date to selectedTimeSlots if not already selected 
   * - Removes the date if already selected
   */
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    // Format date to consistent string for comparison (removing time portion)
    const dateString = date.toISOString().split('T')[0];
    
    // Enhanced logging
    logDateDetails("Date selection", date);
    
    // Check if this date is already selected by comparing just the date portion
    const existingSlotIndex = selectedTimeSlots.findIndex(
      slot => new Date(slot.date).toISOString().split('T')[0] === dateString
    );

    // If date is already selected, remove it
    if (existingSlotIndex !== -1) {
      const updatedSlots = selectedTimeSlots.filter((_, index) => index !== existingSlotIndex);
      setSelectedTimeSlots(updatedSlots);
      console.log(`Removed date: ${dateString}, remaining: ${updatedSlots.length}`);
      return;
    }

    // For new dates, normalize to avoid timezone issues
    const normalizedDateString = normalizeDate(date);
    
    // Add the new date to selected slots
    const updatedSlots = [
      ...selectedTimeSlots, 
      { 
        date: normalizedDateString,
        preferences: [] 
      }
    ];
    
    setSelectedTimeSlots(updatedSlots);
    console.log(`Added date: ${dateString}, total: ${updatedSlots.length}`);
  };

  /**
   * Handles removal of a time slot
   */
  const handleRemoveSlot = (index: number) => {
    const updatedSlots = selectedTimeSlots.filter((_, i) => i !== index);
    setSelectedTimeSlots(updatedSlots);
    console.log(`Removed time slot at index ${index}, remaining: ${updatedSlots.length}`);
  };

  /**
   * Handles changes to time preferences for a specific slot
   */
  const handlePreferenceChange = (index: number, timeId: string) => {
    setSelectedTimeSlots(slots =>
      slots.map((s, i) => {
        if (i === index) {
          // When adding or removing a preference, ensure we don't mutate the original array
          const preferences = s.preferences.includes(timeId)
            ? s.preferences.filter(p => p !== timeId)
            : [...s.preferences, timeId];
            
          console.log(`Time preference for date ${new Date(s.date).toISOString().split('T')[0]} updated:`, {
            action: s.preferences.includes(timeId) ? 'Removed' : 'Added',
            preference: timeId,
          });
          
          return { ...s, preferences };
        }
        return s;
      })
    );
  };

  return (
    <>
      {/* Calendar Section */}
      <DateCalendarSection
        selectedTimeSlots={selectedTimeSlots}
        handleDateSelect={handleDateSelect}
        disabledDays={disabledDays}
        uniqueDatesCount={uniqueDatesCount}
        requiredDatesCount={requiredDatesCount} // Pass through the required date count
      />

      {/* Time preference selectors for selected dates */}
      <TimeSlotList
        selectedTimeSlots={selectedTimeSlots}
        onRemoveSlot={handleRemoveSlot}
        onPreferenceChange={handlePreferenceChange}
      />
    </>
  );
};

export default TimeSlotSelectionSection;
