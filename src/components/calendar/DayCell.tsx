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
      className={`bg-white min-h-[120px] transition-all duration-300
        ${!isCurrentMonth ? 'opacity-50' : ''}
        ${isToday(date) ? 'ring-2 ring-[#0EA5E9] ring-inset' : ''}
        ${className}
      `}
    >
      <div className="flex flex-col p-2">
        {dayLabel && (
          <span className="text-sm text-gray-500 text-center mb-1">{dayLabel}</span>
        )}
        <span className="text-sm font-medium">{format(date, 'd')}</span>
      </div>
      <div className="space-y-1 px-2 pb-2">
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