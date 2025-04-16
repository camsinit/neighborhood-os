
import React from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import TimePreferenceSelector from "./TimePreferenceSelector";

/**
 * Interface for time slots that includes date and preferences
 */
export interface TimeSlot {
  date: string; // ISO string format for consistent serialization
  preferences: string[];
}

/**
 * Props for the TimeSlotSelector component
 */
interface TimeSlotSelectorProps {
  timeSlot: TimeSlot;
  onRemove: () => void;
  onPreferenceChange: (timeId: string) => void;
}

/**
 * Component for selecting time preferences for a specific date
 */
const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  timeSlot,
  onRemove,
  onPreferenceChange,
}) => {
  // Format the date in a readable way
  const formattedDate = format(new Date(timeSlot.date), "EEEE, MMMM do");

  return (
    <div className="p-4 border rounded-lg bg-gray-50 relative">
      {/* Date header and remove button */}
      <div className="flex justify-between items-center mb-2">
        <div className="font-medium">{formattedDate}</div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="h-8 w-8 p-0 rounded-full"
          aria-label="Remove date"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Helper text */}
      <div className="text-sm text-gray-500 mb-3">
        What times work for you on this date?
      </div>
      
      {/* Time preference selector */}
      <TimePreferenceSelector
        selectedPreferences={timeSlot.preferences}
        onPreferenceChange={onPreferenceChange}
      />
      
      {/* Validation message */}
      {timeSlot.preferences.length === 0 && (
        <div className="text-red-500 text-xs mt-2">
          Please select at least one time preference
        </div>
      )}
    </div>
  );
};

export default TimeSlotSelector;
