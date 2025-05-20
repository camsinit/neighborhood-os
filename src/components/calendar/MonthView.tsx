
import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isWeekend, startOfWeek } from 'date-fns';
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
    logger.debug(`Opening add event dialog for date: ${format(date, 'yyyy-MM-dd')} (${format(date, 'EEEE')})`);
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

  // Get consistent week days for the header - make sure they're derived consistently
  // Use startOfWeek to get Sunday, then add days to get consistent day names
  const firstDayOfWeek = startOfWeek(new Date(), { weekStartsOn: 0 }); // 0 = Sunday
  const dayNames = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(firstDayOfWeek);
    date.setDate(date.getDate() + i);
    return format(date, 'EEE'); // Short day name
  });

  logger.debug("MonthView rendering with day names:", dayNames.join(", "));
  logger.debug(`First day: ${format(days[0], 'yyyy-MM-dd')} is ${format(days[0], 'EEEE')}`);

  return (
    <div>
      <motion.div 
        className="grid grid-cols-7 gap-1 bg-gray-50 p-1 rounded-lg shadow-sm"
        variants={gridAnimation}
        initial="hidden"
        animate="visible"
      >
        {/* Day name headers - These will always be Sun, Mon, Tue, etc. in correct order */}
        {dayNames.map((day, index) => (
          <div 
            key={`header-${index}`} 
            className="text-sm font-medium text-gray-700 text-center p-2 bg-gray-100 rounded-t-md"
            data-index={index}
            data-day={['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][index]}
          >
            {day}
          </div>
        ))}
        
        {/* Day cells */}
        {days.map((day) => {
          // Get events for this specific day
          const dayEvents = events.filter(event => 
            format(new Date(event.time), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
          );
          
          // Calculate the grid position based on day of week
          // We need to position the first day of the month correctly
          const dayOfWeek = day.getDay(); // 0 = Sunday, 1 = Monday, etc.
          const dayName = format(day, 'EEEE'); // Full day name for debugging
          
          logger.debug(`Cell for ${format(day, 'yyyy-MM-dd')} has day of week: ${dayOfWeek} (${dayName})`);
          
          return (
            <motion.div 
              key={format(day, 'yyyy-MM-dd')} 
              variants={cellAnimation}
              className="rounded-md overflow-hidden shadow-sm"
              style={day.getDate() === 1 ? { gridColumnStart: dayOfWeek + 1 } : undefined}
            >
              <DayCell
                date={day}
                isCurrentMonth={isSameMonth(day, currentDate)}
                events={dayEvents}
                isLoading={isLoading}
                onAddEvent={handleAddEvent}
                highlightedId={highlightedId}
                className={cn("h-[140px] rounded-md", isWeekend(day) ? "bg-gray-50/80" : "")}
              />
            </motion.div>
          );
        })}
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
