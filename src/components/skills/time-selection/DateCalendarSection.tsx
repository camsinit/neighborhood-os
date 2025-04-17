
import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { FormLabel } from "@/components/ui/form";
import { Info } from "lucide-react";
import { TimeSlot } from "../contribution/TimeSlotSelector";

/**
 * Props for the DateCalendarSection component
 */
interface DateCalendarSectionProps {
  selectedTimeSlots: TimeSlot[];
  handleDateSelect: (date: Date | undefined) => void;
  disabledDays: { before: Date; after: Date };
  uniqueDatesCount: number;
}

/**
 * A component that renders the calendar for date selection
 * 
 * This component is responsible for:
 * 1. Displaying the calendar
 * 2. Handling the selection of dates
 * 3. Showing the helper text with counts
 */
const DateCalendarSection: React.FC<DateCalendarSectionProps> = ({
  selectedTimeSlots,
  handleDateSelect,
  disabledDays,
  uniqueDatesCount
}) => {
  // Convert selectedTimeSlots to Date objects for calendar display
  const selectedDates = selectedTimeSlots.map(slot => new Date(slot.date));

  return (
    <div className="space-y-2">
      {/* Header with label and info */}
      <div className="flex items-start justify-between">
        <FormLabel>Select dates that work for you</FormLabel>
        <div className="text-xs text-primary flex items-center gap-1">
          <Info size={14} />
          <span>We recommend selecting 3 dates</span>
        </div>
      </div>
      
      {/* Calendar container */}
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
        ({uniqueDatesCount} unique)
        {selectedTimeSlots.length === 0 && " (please select at least one date)"}
        {uniqueDatesCount < 3 && uniqueDatesCount > 0 && " (please select at least 3 different dates)"}
      </div>
    </div>
  );
};

export default DateCalendarSection;
