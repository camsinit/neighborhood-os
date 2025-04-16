
import React from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import TimeSlotSelector, { TimeSlot } from "./contribution/TimeSlotSelector";
import { FormLabel } from "@/components/ui/form";
import { toast } from "sonner";
import { Info } from "lucide-react";

/**
 * Props for the TimeSlotSelectionSection component
 */
interface TimeSlotSelectionSectionProps {
  selectedTimeSlots: TimeSlot[]; 
  setSelectedTimeSlots: React.Dispatch<React.SetStateAction<TimeSlot[]>>;
  disabledDays: { before: Date; after: Date };
}

/**
 * A component that handles the selection of dates and time preferences for skill sessions
 * 
 * This component allows users to:
 * 1. Select dates from a calendar (recommending 3 different dates)
 * 2. Set time preferences (morning/afternoon/evening) for each selected date
 */
const TimeSlotSelectionSection: React.FC<TimeSlotSelectionSectionProps> = ({
  selectedTimeSlots,
  setSelectedTimeSlots,
  disabledDays
}) => {
  /**
   * Handles the selection of a date from the calendar
   * - Adds the date to selectedTimeSlots if not already selected 
   * - Removes the date if already selected
   */
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    // Format date to consistent string for comparison (removing time portion)
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    // ENHANCED LOGGING - Log detailed information about the selected date
    console.log("Date selection (ENHANCED DEBUG):", {
      selectedDate: date.toISOString(),
      formattedDateForComparison: formattedDate,
      dateComponents: {
        year: date.getFullYear(),
        month: date.getMonth(),
        day: date.getDate(),
        hours: date.getHours(),
        minutes: date.getMinutes(),
        seconds: date.getSeconds(),
        milliseconds: date.getMilliseconds(),
        timestamp: date.getTime(),
        timezoneOffset: date.getTimezoneOffset(),
        dayOfWeek: date.getDay(),
        localeDateString: date.toLocaleDateString(),
        localeTimeString: date.toLocaleTimeString(),
        dateString: date.toDateString(),
        timeString: date.toTimeString(),
        utcString: date.toUTCString(),
        simpleDatePart: date.toISOString().split('T')[0]
      }
    });
    
    // ENHANCED LOGGING - Log all current time slots before modification
    console.log("Current time slots (ENHANCED DEBUG):", selectedTimeSlots.map((slot, idx) => ({
      index: idx,
      date: slot.date,
      dateObj: new Date(slot.date),
      formattedDate: format(new Date(slot.date), 'yyyy-MM-dd'),
      simpleDatePart: new Date(slot.date).toISOString().split('T')[0],
      preferences: slot.preferences
    })));
    
    // Check if this date is already selected by comparing just the date portion
    const existingSlotIndex = selectedTimeSlots.findIndex(
      slot => format(new Date(slot.date), 'yyyy-MM-dd') === formattedDate
    );

    // If date is already selected, remove it
    if (existingSlotIndex !== -1) {
      const updatedSlots = selectedTimeSlots.filter((_, index) => index !== existingSlotIndex);
      setSelectedTimeSlots(updatedSlots);
      console.log(`Removed date: ${formattedDate}, remaining: ${updatedSlots.length}`);
      
      // ENHANCED LOGGING - Log all time slots after removal
      console.log("Time slots after removal (ENHANCED DEBUG):", updatedSlots.map((slot, idx) => ({
        index: idx,
        date: slot.date,
        dateObj: new Date(slot.date),
        formattedDate: format(new Date(slot.date), 'yyyy-MM-dd'),
        simpleDatePart: new Date(slot.date).toISOString().split('T')[0],
        preferences: slot.preferences
      })));
      
      return;
    }

    // For new dates, standardize to noon UTC to avoid timezone issues
    // Create a UTC date with just the date portion (year, month, day)
    const normalizedDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    // Then set it to noon UTC (12:00)
    normalizedDate.setUTCHours(12, 0, 0, 0);
    
    // ENHANCED LOGGING - Log detailed information about the normalized date
    console.log("Normalized date for storage (ENHANCED DEBUG):", {
      originalDate: date.toISOString(),
      normalizedDate: normalizedDate.toISOString(),
      dateComponents: {
        year: normalizedDate.getFullYear(),
        month: normalizedDate.getMonth(),
        day: normalizedDate.getDate(),
        hours: normalizedDate.getHours(),
        minutes: normalizedDate.getMinutes(),
        seconds: normalizedDate.getSeconds(),
        milliseconds: normalizedDate.getMilliseconds(),
        timestamp: normalizedDate.getTime(),
        timezoneOffset: normalizedDate.getTimezoneOffset(),
        dayOfWeek: normalizedDate.getDay(),
        localeDateString: normalizedDate.toLocaleDateString(),
        localeTimeString: normalizedDate.toLocaleTimeString(),
        dateString: normalizedDate.toDateString(),
        timeString: normalizedDate.toTimeString(),
        utcString: normalizedDate.toUTCString(),
        simpleDatePart: normalizedDate.toISOString().split('T')[0]
      }
    });
    
    const updatedSlots = [
      ...selectedTimeSlots, 
      { 
        date: normalizedDate.toISOString(), // Store as ISO string for consistent serialization
        preferences: [] 
      }
    ];
    
    setSelectedTimeSlots(updatedSlots);
    console.log(`Added date: ${formattedDate}, total: ${updatedSlots.length}`);
    
    // ENHANCED LOGGING - Log all time slots after addition
    console.log("Time slots after addition (ENHANCED DEBUG):", updatedSlots.map((slot, idx) => ({
      index: idx,
      date: slot.date,
      dateObj: new Date(slot.date),
      formattedDate: format(new Date(slot.date), 'yyyy-MM-dd'),
      simpleDatePart: new Date(slot.date).toISOString().split('T')[0],
      preferences: slot.preferences
    })));
  };

  // Get array of selected dates for calendar highlighting
  const selectedDates = selectedTimeSlots.map(slot => new Date(slot.date));

  // NEW: Check for unique dates with improved date extraction
  const uniqueDates = new Set(selectedTimeSlots.map(slot => 
    new Date(slot.date).toISOString().split('T')[0]
  ));

  return (
    <>
      {/* Calendar Section - Now full width */}
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <FormLabel>Select dates that work for you</FormLabel>
          <div className="text-xs text-primary flex items-center gap-1">
            <Info size={14} />
            <span>We recommend selecting 3 dates</span>
          </div>
        </div>
        <div className="w-full border rounded-lg p-4">
          <Calendar
            mode="multiple"
            selected={selectedDates}
            onSelect={(value) => {
              // When in multiple mode, value is an array of dates
              if (Array.isArray(value) && value.length !== selectedDates.length) {
                // Find the date that was added or removed
                if (value.length > selectedDates.length) {
                  // A date was added - find which one
                  const newDate = value.find(date => 
                    !selectedDates.some(d => format(d, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))
                  );
                  if (newDate) handleDateSelect(newDate);
                } else {
                  // A date was removed - find which one
                  const removedDate = selectedDates.find(date => 
                    !value.some(d => format(d, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))
                  );
                  if (removedDate) handleDateSelect(removedDate);
                }
              }
            }}
            disabled={disabledDays}
            className="w-full mx-auto pointer-events-auto"
            modifiersClassNames={{
              selected: "bg-primary text-primary-foreground",
            }}
          />
        </div>
        {/* Helper text showing count of selected dates with recommendation */}
        <div className="text-sm text-gray-500 mt-1">
          {selectedTimeSlots.length} date{selectedTimeSlots.length !== 1 ? 's' : ''} selected 
          ({uniqueDates.size} unique)
          {selectedTimeSlots.length === 0 && " (please select at least one date)"}
          {uniqueDates.size < 3 && uniqueDates.size > 0 && " (please select at least 3 different dates)"}
        </div>
      </div>

      {/* Time preference selectors for selected dates */}
      <div className="space-y-4">
        {selectedTimeSlots.map((slot, index) => (
          <TimeSlotSelector
            key={`${slot.date}-${index}`}
            timeSlot={slot}
            onRemove={() => {
              const updatedSlots = selectedTimeSlots.filter((_, i) => i !== index);
              setSelectedTimeSlots(updatedSlots);
              console.log(`Removed time slot at index ${index}, remaining: ${updatedSlots.length}`);
              
              // ENHANCED LOGGING - Log all time slots after removal
              console.log("Time slots after preference removal (ENHANCED DEBUG):", updatedSlots.map((s, idx) => ({
                index: idx,
                date: s.date,
                dateObj: new Date(s.date),
                formattedDate: format(new Date(s.date), 'yyyy-MM-dd'),
                simpleDatePart: new Date(s.date).toISOString().split('T')[0],
                preferences: s.preferences
              })));
            }}
            onPreferenceChange={(timeId) => {
              setSelectedTimeSlots(slots =>
                slots.map((s, i) => {
                  if (i === index) {
                    // When adding or removing a preference, ensure we don't mutate the original array
                    const preferences = s.preferences.includes(timeId)
                      ? s.preferences.filter(p => p !== timeId)
                      : [...s.preferences, timeId];
                      
                    // ENHANCED LOGGING - Log preference changes
                    console.log(`Time preference for date ${format(new Date(s.date), 'yyyy-MM-dd')} updated (ENHANCED DEBUG):`, {
                      action: s.preferences.includes(timeId) ? 'Removed' : 'Added',
                      preference: timeId,
                      slotIndex: index,
                      beforePreferences: s.preferences,
                      afterPreferences: s.preferences.includes(timeId) 
                        ? s.preferences.filter(p => p !== timeId)
                        : [...s.preferences, timeId],
                      date: s.date,
                      dateObj: new Date(s.date),
                      formattedDate: format(new Date(s.date), 'yyyy-MM-dd'),
                      simpleDatePart: new Date(s.date).toISOString().split('T')[0]
                    });
                    
                    return { ...s, preferences };
                  }
                  return s;
                })
              );
            }}
          />
        ))}
      </div>
    </>
  );
};

export default TimeSlotSelectionSection;
