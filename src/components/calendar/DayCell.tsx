
import { format, isToday } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import EventCard from "../EventCard";
import { Event } from "@/types/calendar";

interface DayCellProps {
  date: Date;
  isCurrentMonth?: boolean;
  events: Event[];
  isLoading: boolean;
  className?: string;
}

const DayCell = ({ 
  date, 
  isCurrentMonth = true, 
  events,
  isLoading,
  className = ""
}: DayCellProps) => {
  return (
    <div 
      className={`bg-white border-r border-b border-gray-200 min-h-[120px] transition-all duration-300 last:border-r-0
        ${!isCurrentMonth ? 'opacity-50' : ''}
        ${isToday(date) ? 'ring-2 ring-[#0EA5E9]' : ''}
        ${className}
      `}
    >
      <div className="p-2">
        <span className="text-lg font-medium">{format(date, 'd')}</span>
      </div>
      <div className="space-y-0 p-2">
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
