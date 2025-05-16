
import { useState } from 'react';
import { Event } from "@/types/localTypes";
import DayCell from "./DayCell";
import AddEventDialog from "../AddEventDialog";
import { format } from "date-fns";
import { createLogger } from "@/utils/logger";
import { motion } from "framer-motion";

// Create a logger for the WeekView component
const logger = createLogger('WeekView');

interface WeekViewProps {
  weekDates: Date[];
  events: Event[] | undefined;
  isLoading: boolean;
  getEventsForDate: (date: Date) => Event[];
  onEventDelete?: () => void;
  highlightedId?: string | null;
}

/**
 * WeekView component displays a week of calendar days with events
 * 
 * This component:
 * - Shows 7 days (a full week) with their events
 * - Allows adding events by clicking the "+" button on any day
 * - Supports highlighting specific events
 * 
 * @param weekDates - Array of 7 Date objects representing the week
 * @param events - All events data
 * @param isLoading - Whether events are loading
 * @param getEventsForDate - Function to filter events for a specific date
 * @param highlightedId - ID of event to highlight (if any)
 */
const WeekView = ({ 
  weekDates, 
  events, 
  isLoading, 
  getEventsForDate,
  highlightedId
}: WeekViewProps) => {
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
  const handleEventAdded = () => {
    // Close the dialog
    setIsAddEventOpen(false);
    setSelectedDate(null);
  };

  // Animation for grid items
  const gridAnimation = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const cellAnimation = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 }
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

      {/* Calendar grid with animation */}
      <motion.div 
        className="grid grid-cols-7 border border-gray-200 rounded-lg overflow-hidden"
        variants={gridAnimation}
        initial="hidden"
        animate="visible"
      >
        {weekDates.map((date, i) => (
          <motion.div key={i} variants={cellAnimation}>
            <DayCell
              date={date}
              events={getEventsForDate(date)}
              isLoading={isLoading}
              onAddEvent={handleAddEvent}
              highlightedId={highlightedId}
            />
          </motion.div>
        ))}
      </motion.div>

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
