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
        ${isToday(date) ? 'border-2 border-[#0EA5E9]' : ''}
        ${className}
      `}
    >
      {dayLabel && (
        <div className="text-sm text-gray-500 mb-1">{dayLabel}</div>
      )}
      <div className={`font-medium mb-2 flex justify-center`}>
        <span className={`
          ${isToday(date) ? 'bg-[#0EA5E9] text-white w-8 h-8 flex items-center justify-center rounded-full' : ''}
          transition-all duration-300
        `}>
          {format(date, 'd')}
        </span>
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