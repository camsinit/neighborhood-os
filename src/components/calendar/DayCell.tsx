import { format, isToday } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import EventCard from "../EventCard";
import { Event } from "@/types/calendar";

interface DayCellProps {
  date: Date;
  isCurrentMonth?: boolean;
  dayLabel?: string;
  events: Event[];
  isLoading: boolean;
  className?: string;
}

const DayCell = ({ 
  date, 
  isCurrentMonth = true, 
  dayLabel,
  events,
  isLoading,
  className = ""
}: DayCellProps) => {
  return (
    <div 
      className={`bg-white transition-all duration-300
        ${!isCurrentMonth ? 'opacity-50' : ''}
        ${isToday(date) ? 'ring-2 ring-primary ring-offset-2' : ''}
        ${className}
      `}
    >
      {dayLabel && (
        <div className="text-sm text-gray-500 mb-1">{dayLabel}</div>
      )}
      <div className={`font-medium mb-2 ${
        isToday(date) ? 'text-primary' : ''
      }`}>
        {format(date, 'd')}
      </div>
      <div className="space-y-1">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          events.map((event) => (
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
  );
};

export default DayCell;