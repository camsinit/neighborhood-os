
import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from 'date-fns';
import { Event } from '@/types/calendar';
import DayCell from './DayCell';
import AddEventDialog from '../AddEventDialog';

interface MonthViewProps {
  currentDate: Date;
  events: Event[];
  isLoading?: boolean;
}

const MonthView = ({ currentDate, events, isLoading = false }: MonthViewProps) => {
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Handler for adding new events
  const handleAddEvent = (date: Date) => {
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
