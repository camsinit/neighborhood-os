
import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isWeekend } from 'date-fns';
import { Event } from '@/types/localTypes';
import DayCell from './DayCell';
import AddEventDialog from '../AddEventDialog';
import { createLogger } from '@/utils/logger';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Create a logger for the MonthView component
const logger = createLogger('MonthView');

interface MonthViewProps {
  currentDate: Date;
  events: Event[];
  isLoading?: boolean;
  highlightedId?: string | null;
}

/**
 * MonthView component displays a calendar month with event data
 * 
 * This component:
 * - Shows all days in the current month
 * - Displays events on their respective days
 * - Allows adding new events by clicking the "+" button on any day
 * - Supports highlighting specific events
 * 
 * @param currentDate - Date object representing the month to display
 * @param events - Array of events to show on the calendar
 * @param isLoading - Whether events are loading
 * @param highlightedId - ID of event to highlight (if any)
 */
const MonthView = ({ 
  currentDate, 
  events, 
  isLoading = false,
  highlightedId
}: MonthViewProps) => {
  // State for the Add Event dialog
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Calculate days to display in the month view
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Handler for adding new events - stores the selected date and opens dialog
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
  
  // Grid animation
  const gridAnimation = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.02
      }
    }
  };

  const cellAnimation = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  return (
    <div>
      <motion.div 
        className="grid grid-cols-7 gap-1 bg-gray-50 p-1 rounded-lg shadow-sm"
        variants={gridAnimation}
        initial="hidden"
        animate="visible"
      >
        {/* Day name headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div 
            key={day} 
            className="text-sm font-medium text-gray-700 text-center p-2 bg-gray-100 rounded-t-md"
          >
            {day}
          </div>
        ))}
        
        {/* Day cells */}
        {days.map((day) => (
          <motion.div 
            key={day.toISOString()} 
            variants={cellAnimation}
            className="rounded-md overflow-hidden shadow-sm"
          >
            <DayCell
              date={day}
              isCurrentMonth={isSameMonth(day, currentDate)}
              events={events.filter(event => 
                format(new Date(event.time), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
              )}
              isLoading={isLoading}
              onAddEvent={handleAddEvent}
              highlightedId={highlightedId}
              className={cn("h-[140px] rounded-md", isWeekend(day) ? "bg-gray-50/80" : "")}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Pass the selected date to the dialog */}
      <AddEventDialog 
        open={isAddEventOpen}
        onOpenChange={setIsAddEventOpen}
        onAddEvent={handleEventAdded}
        initialDate={selectedDate}
      />
    </div>
  );
};

export default MonthView;
