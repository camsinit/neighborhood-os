
import { useState } from 'react';
import { Event } from "@/types/localTypes";
import DayCell from "./DayCell";
import AddEventDialog from "../AddEventDialog";
import { format, isWeekend } from "date-fns";
import { createLogger } from "@/utils/logger";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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
    hidden: { opacity: 0, scale: 0.98 },
    visible: { opacity: 1, scale: 1 }
  };

  return (
    <div className="space-y-2">
      {/* Day names header - Getting day names directly from the weekDates array */}
      <div className="grid grid-cols-7 mb-2">
        {weekDates.map((date, index) => {
          // Get day name directly from each date object to ensure correct alignment
          const dayName = format(date, 'EEE');
          return (
            <div 
              key={`dayheader-${index}`} 
              className={cn(
                "text-sm font-medium px-4 py-2 rounded-md text-center",
                isWeekend(date) ? "bg-gray-50 text-gray-600" : "bg-white text-gray-800"
              )}
              data-day={format(date, 'EEEE')}
              data-date={format(date, 'yyyy-MM-dd')}
            >
              {dayName}
            </div>
          );
        })}
      </div>

      {/* Calendar grid with animation */}
      <motion.div 
        className="grid grid-cols-7 rounded-lg overflow-hidden gap-1 shadow-sm bg-gray-50 p-1"
        variants={gridAnimation}
        initial="hidden"
        animate="visible"
      >
        {weekDates.map((date, i) => (
          <motion.div 
            key={`day-${format(date, 'yyyy-MM-dd')}`} 
            variants={cellAnimation} 
            className="rounded-md overflow-hidden shadow-sm"
          >
            <DayCell
              date={date}
              events={getEventsForDate(date)}
              isLoading={isLoading}
              onAddEvent={handleAddEvent}
              highlightedId={highlightedId}
              className={cn("h-[150px] rounded-md", isWeekend(date) ? "bg-gray-50/80" : "")}
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
