
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
    
    // Check if this date is already selected by comparing just the date portion
    const existingSlotIndex = selectedTimeSlots.findIndex(
      slot => format(new Date(slot.date), 'yyyy-MM-dd') === formattedDate
    );

    // If date is already selected, remove it
    if (existingSlotIndex !== -1) {
      setSelectedTimeSlots(selectedTimeSlots.filter((_, index) => index !== existingSlotIndex));
      console.log(`Removed date: ${formattedDate}, remaining: ${selectedTimeSlots.length - 1}`);
      return;
    }

    // For new dates, standardize to noon to avoid timezone issues
    // Create date object with just the date portion (year, month, day)
    const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    // Then set it to noon (12:00)
    normalizedDate.setHours(12, 0, 0, 0);
    
    setSelectedTimeSlots([
      ...selectedTimeSlots, 
      { 
        date: normalizedDate.toISOString(), // Store as ISO string for consistent serialization
        preferences: [] 
      }
    ]);
    console.log(`Added date: ${formattedDate}, total: ${selectedTimeSlots.length + 1}`);
  };

  // Get array of selected dates for calendar highlighting
  const selectedDates = selectedTimeSlots.map(slot => new Date(slot.date));

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
          {selectedTimeSlots.length === 0 && " (please select at least one date)"}
          {selectedTimeSlots.length > 0 && selectedTimeSlots.length < 3 && " (please select at least 3 dates)"}
        </div>
      </div>

      {/* Time preference selectors for selected dates */}
      <div className="space-y-4">
        {selectedTimeSlots.map((slot, index) => (
          <TimeSlotSelector
            key={`${slot.date}-${index}`}
            timeSlot={slot}
            onRemove={() => {
              setSelectedTimeSlots(slots => 
                slots.filter((_, i) => i !== index)
              );
              console.log(`Removed time slot at index ${index}`);
            }}
            onPreferenceChange={(timeId) => {
              setSelectedTimeSlots(slots =>
                slots.map((s, i) => {
                  if (i === index) {
                    // When adding or removing a preference, ensure we don't mutate the original array
                    const preferences = s.preferences.includes(timeId)
                      ? s.preferences.filter(p => p !== timeId)
                      : [...s.preferences, timeId];
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
