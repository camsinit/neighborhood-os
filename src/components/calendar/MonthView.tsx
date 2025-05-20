
import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from 'date-fns';
import { Event } from '@/types/localTypes'; // Update import to localTypes
import DayCell from './DayCell';
import AddEventDialog from '../AddEventDialog';
import { createLogger } from '@/utils/logger';

// Create a logger for the MonthView component
const logger = createLogger('MonthView');

interface MonthViewProps {
  currentDate: Date;
  events: Event[];
  isLoading?: boolean;
}

/**
 * MonthView component displays a calendar month with event data
 * 
 * This component:
 * - Shows all days in the current month
 * - Displays events on their respective days
 * - Allows adding new events by clicking the "+" button on any day
 * 
 * @param currentDate - Date object representing the month to display
 * @param events - Array of events to show on the calendar
 * @param isLoading - Whether events are loading
 */
const MonthView = ({ currentDate, events, isLoading = false }: MonthViewProps) => {
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
  const handleEventAdded = (event: any) => {
    // Close the dialog
    setIsAddEventOpen(false);
    setSelectedDate(null);
  };

  return (
    <div>
      <div className="grid grid-cols-7 h-full">
        {days.map((day) => (
          <DayCell
            key={day.toISOString()}
            date={day}
            isCurrentMonth={isSameMonth(day, currentDate)}
            events={events.filter(event => 
              format(new Date(event.time), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
            )}
            isLoading={isLoading}
            onAddEvent={handleAddEvent}
          />
        ))}
      </div>

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
