
import React from "react";
import TimeSlotSelector, { TimeSlot } from "../contribution/TimeSlotSelector";
import { format } from "date-fns";

/**
 * Props for the TimeSlotList component
 */
interface TimeSlotListProps {
  selectedTimeSlots: TimeSlot[];
  onRemoveSlot: (index: number) => void;
  onPreferenceChange: (index: number, timeId: string) => void;
}

/**
 * A component that renders a list of time slot selectors
 * 
 * This component is responsible for displaying and managing the time preferences
 * for each selected date.
 */
const TimeSlotList: React.FC<TimeSlotListProps> = ({
  selectedTimeSlots,
  onRemoveSlot,
  onPreferenceChange
}) => {
  // If no time slots, don't render anything
  if (selectedTimeSlots.length === 0) return null;
  
  return (
    <div className="space-y-4">
      {selectedTimeSlots.map((slot, index) => (
        <TimeSlotSelector
          key={`${slot.date}-${index}`}
          timeSlot={slot}
          onRemove={() => onRemoveSlot(index)}
          onPreferenceChange={(timeId) => onPreferenceChange(index, timeId)}
        />
      ))}
    </div>
  );
};

export default TimeSlotList;
