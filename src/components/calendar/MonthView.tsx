import { format, isSameMonth, isToday, parseISO } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import EventCard from "../EventCard";
import { Event } from "@/types/calendar";

interface MonthViewProps {
  monthDates: Date[];
  currentDate: Date;
  events: Event[] | undefined;
  isLoading: boolean;
  getEventsForDate: (date: Date) => Event[];
}

const MonthView = ({ monthDates, currentDate, events, isLoading, getEventsForDate }: MonthViewProps) => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
      {days.map((day, i) => (
        <div key={i} className="bg-white p-2 text-sm text-gray-500 font-medium text-center">
          {day}
        </div>
      ))}
      {monthDates.map((date, i) => (
        <div 
          key={i} 
          className={`bg-white p-2 min-h-[120px] transition-all duration-300
            ${!isSameMonth(date, currentDate) ? 'opacity-50' : ''}
            ${isToday(date) ? 'ring-2 ring-primary ring-offset-2' : ''}
          `}
        >
          <div className={`text-sm font-medium mb-2 ${
            isToday(date) ? 'text-primary' : ''
          }`}>
            {format(date, 'd')}
          </div>
          <div className="space-y-1">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
            ) : (
              getEventsForDate(date).map((event) => (
                <EventCard 
                  key={event.id} 
                  event={{
                    ...event,
                    color: "bg-blue-100 border-blue-300",
                  }} 
                />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MonthView;