import { Calendar } from "@/components/ui/calendar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface DateCalendarSectionProps {
  selectedTimeSlots: TimeSlot[];
  handleDateSelect: (date: Date | undefined) => void;
  disabledDays: { before: Date; after: Date };
  uniqueDatesCount: number;
  requiredDatesCount: number;
}

/**
 * Date selection calendar section
 * Shows a calendar for selecting dates and provides feedback on selection requirements
 */
const DateCalendarSection = ({
  selectedTimeSlots,
  handleDateSelect,
  disabledDays,
  uniqueDatesCount,
  requiredDatesCount
}: DateCalendarSectionProps) => {
  // Format the selected dates for the Calendar component
  const selectedDates = selectedTimeSlots.map(slot => new Date(slot.date));

  // Function to determine if the selected dates meet requirements
  const getMeetingRequirementsText = () => {
    if (uniqueDatesCount < requiredDatesCount) {
      return {
        text: `Please select at least ${requiredDatesCount} different date${requiredDatesCount > 1 ? 's' : ''}.`,
        status: 'error' as const
      };
    } else if (requiredDatesCount === 1 && uniqueDatesCount < 3) {
      return {
        text: 'For better scheduling flexibility, we recommend selecting at least 3 different dates.',
        status: 'warning' as const
      };
    } else {
      return {
        text: 'Great! You\'ve selected enough dates for scheduling flexibility.',
        status: 'success' as const
      };
    }
  };

  const requirementStatus = getMeetingRequirementsText();

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">Select Dates</h3>

      {/* Instruction text */}
      <p className="text-xs text-gray-600 mb-1">
        {requiredDatesCount === 1 ? 
          "Click on dates when you're available. We recommend selecting multiple dates for flexibility." : 
          `Click on dates when you're available. Please select at least ${requiredDatesCount} different dates.`
        }
      </p>

      {/* Calendar component */}
      <div className="border rounded-md p-2">
        <Calendar
          mode="multiple"
          selected={selectedDates}
          onSelect={(dates) => {
            // When a date is added or removed
            if (dates && dates !== selectedDates) {
              // Find which date was changed
              const lastChangedDate = dates.length > selectedDates.length
                ? dates[dates.length - 1]  // Date added
                : selectedDates.find(d => !dates.some(    // Date removed
                    newDate => newDate.toDateString() === d.toDateString()
                  ));
              
              handleDateSelect(lastChangedDate);
            }
          }}
          disabled={disabledDays}
          className="rounded-md border"
        />
      </div>

      {/* Date selection status message */}
      <Alert 
        className={cn(
          "py-2",
          requirementStatus.status === 'error' ? "bg-red-50 text-red-800 border-red-200" : 
          requirementStatus.status === 'warning' ? "bg-yellow-50 text-yellow-800 border-yellow-200" : 
          "bg-green-50 text-green-800 border-green-200"
        )}
      >
        <Info className="h-4 w-4 mr-2" />
        <AlertDescription className="text-xs">
          {requirementStatus.text}
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default DateCalendarSection;
