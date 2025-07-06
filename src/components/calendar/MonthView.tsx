
import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, startOfWeek, addDays } from 'date-fns';
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
  getEventsForDate?: (date: Date) => Event[]; // Add the getEventsForDate prop
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
const MonthView = ({ currentDate, events, isLoading = false, getEventsForDate }: MonthViewProps) => {
  // State for the Add Event dialog
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Calculate days to display in the month view
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  
  // Get the first day of the first week of the month view
  // This ensures we start the calendar grid from Sunday
  const calendarStart = startOfWeek(monthStart);
  
  // Generate an array of 7 days for the week header (Sunday to Saturday)
  // These will be the same days used in the grid, ensuring alignment
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(calendarStart, i));
  
  // Calculate all days to be shown in the month grid
  // We'll show 6 weeks (42 days) to ensure we capture the full month
  const days = Array.from({ length: 42 }, (_, i) => addDays(calendarStart, i));

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
    <div className="p-2">
      {/* Day names header - Added to ensure day names are displayed */}
      <div className="grid grid-cols-7 mb-1">
        {weekDays.map((day, index) => (
          <div key={index} className="text-center font-medium py-2">
            {format(day, 'EEE')}
          </div>
        ))}
      </div>
      
      {/* Calendar grid with days - Added padding to prevent corner clipping */}
      <div className="grid grid-cols-7 h-full border border-gray-200 rounded-lg overflow-hidden">
        {days.map((day) => (
          <DayCell
            key={day.toISOString()}
            date={day}
            isCurrentMonth={isSameMonth(day, currentDate)}
            events={getEventsForDate ? getEventsForDate(day) : events.filter(event => 
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
