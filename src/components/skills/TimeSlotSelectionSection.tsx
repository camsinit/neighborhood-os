
import React from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import TimeSlotSelector, { TimeSlot } from "./contribution/TimeSlotSelector";
import { FormLabel } from "@/components/ui/form";
import { toast } from "sonner";

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
 * 1. Select up to 3 different dates from a calendar
 * 2. Set time preferences (morning/afternoon/evening) for each selected date
 */
const TimeSlotSelectionSection: React.FC<TimeSlotSelectionSectionProps> = ({
  selectedTimeSlots,
  setSelectedTimeSlots,
  disabledDays
}) => {
  /**
   * Handles the selection of a date from the calendar
   * - Adds the date to selectedTimeSlots if not already selected (max 3)
   * - Removes the date if already selected
   */
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    // Format date to consistent string for comparison (removing time portion)
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    // Check if this date is already selected
    const existingSlotIndex = selectedTimeSlots.findIndex(
      slot => format(slot.date, 'yyyy-MM-dd') === formattedDate
    );

    // If date is already selected, remove it
    if (existingSlotIndex !== -1) {
      setSelectedTimeSlots(selectedTimeSlots.filter((_, index) => index !== existingSlotIndex));
      return;
    }

    // Add new date if under the limit
    if (selectedTimeSlots.length < 3) {
      setSelectedTimeSlots([...selectedTimeSlots, { date, preferences: [] }]);
    } else {
      toast.error("Maximum 3 dates can be selected", {
        description: "Please remove a date before adding another one"
      });
    }
  };

  // Get array of selected dates for calendar highlighting
  const selectedDates = selectedTimeSlots.map(slot => slot.date);

  return (
    <>
      {/* Calendar Section - Now full width */}
      <div className="space-y-2">
        <FormLabel>Select up to 3 dates that work for you</FormLabel>
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
              selected: "bg-gray-200 text-gray-700",
            }}
          />
        </div>
        {/* Helper text showing count of selected dates */}
        <div className="text-sm text-gray-500 mt-1">
          {selectedTimeSlots.length} of 3 dates selected 
          {selectedTimeSlots.length < 3 && " (3 dates required)"}
        </div>
      </div>

      {/* Time preference selectors for selected dates */}
      <div className="space-y-4">
        {selectedTimeSlots.map((slot, index) => (
          <TimeSlotSelector
            key={format(slot.date, 'yyyy-MM-dd')}
            timeSlot={slot}
            onRemove={() => setSelectedTimeSlots(slots => 
              slots.filter((_, i) => i !== index)
            )}
            onPreferenceChange={(timeId) => {
              setSelectedTimeSlots(slots =>
                slots.map((s, i) => {
                  if (i === index) {
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
