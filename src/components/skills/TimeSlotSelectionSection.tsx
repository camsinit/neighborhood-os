
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
    const formattedDate = format(date, 'yyyy-MM-dd');
    const existingSlotIndex = selectedTimeSlots.findIndex(
      slot => format(slot.date, 'yyyy-MM-dd') === formattedDate
    );

    if (existingSlotIndex === -1) {
      if (selectedTimeSlots.length < 3) {
        // Add a new date with no time preferences selected yet
        setSelectedTimeSlots([...selectedTimeSlots, { date, preferences: [] }]);
      } else {
        toast.error("Maximum 3 dates can be selected", {
          description: "Please remove a date before adding another one"
        });
      }
    } else {
      // Remove the date if clicked again
      setSelectedTimeSlots(selectedTimeSlots.filter((_, index) => index !== existingSlotIndex));
    }
  };

  return (
    <>
      {/* Date Selection Section */}
      <div className="space-y-2">
        <FormLabel>Select 3 dates that work for you</FormLabel>
        <div className="border rounded-lg p-4">
          <Calendar
            mode="single"
            selected={undefined}
            onSelect={handleDateSelect}
            disabled={disabledDays}
            className="mx-auto"
          />
        </div>
      </div>

      {/* Display selected dates with time preferences */}
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
