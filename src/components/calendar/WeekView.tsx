
import { useState } from 'react';
import { Event } from "@/types/localTypes"; // Update import to use localTypes
import DayCell from "./DayCell";
import AddEventDialog from "../AddEventDialog";
import { format } from "date-fns";
import { createLogger } from "@/utils/logger";

// Create a logger for the WeekView component
const logger = createLogger('WeekView');

interface WeekViewProps {
  weekDates: Date[];
  events: Event[] | undefined;
  isLoading: boolean;
  getEventsForDate: (date: Date) => Event[];
  onEventDelete?: () => void;
}

/**
 * WeekView component displays a week of calendar days with events
 * 
 * This component:
 * - Shows 7 days (a full week) with their events
 * - Allows adding events by clicking the "+" button on any day
 * 
 * @param weekDates - Array of 7 Date objects representing the week
 * @param events - All events data
 * @param isLoading - Whether events are loading
 * @param getEventsForDate - Function to filter events for a specific date
 */
const WeekView = ({ weekDates, events, isLoading, getEventsForDate }: WeekViewProps) => {
  // State for the Add Event dialog
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Handler for adding a new event
  const handleAddEvent = (date: Date) => {
    logger.debug(`Opening add event dialog for date: ${format(date, 'yyyy-MM-dd')}`);
    setSelectedDate(date);
    setIsAddEventOpen(true);
  };

  // Handler for when a new event is added
  const handleEventAdded = (event: any) => {
    // Close the dialog
    setIsAddEventOpen(false);
    setSelectedDate(null);
  };

  return (
    <div className="space-y-2">
      {/* Day names header */}
      <div className="grid grid-cols-7">
        {days.map((day) => (
          <div key={day} className="text-lg font-medium px-4">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 border border-gray-200 rounded-lg overflow-hidden">
        {weekDates.map((date, i) => (
          <DayCell
            key={i}
            date={date}
            events={getEventsForDate(date)}
            isLoading={isLoading}
            onAddEvent={handleAddEvent}
          />
        ))}
      </div>

      {/* Add Event Dialog */}
      <AddEventDialog
        open={isAddEventOpen}
        onOpenChange={setIsAddEventOpen}
        onAddEvent={handleEventAdded}
        initialDate={selectedDate}
      />
    </div>
  );
};

export default WeekView;
