
import { format, isToday } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react"; // Import the Plus icon
import EventCard from "../EventCard";
import { Event } from "@/types/calendar";

interface DayCellProps {
  date: Date;
  isCurrentMonth?: boolean;
  events: Event[];
  isLoading: boolean;
  className?: string;
  onAddEvent?: (date: Date) => void; // Add callback for handling new event creation
}

const DayCell = ({ 
  date, 
  isCurrentMonth = true, 
  events,
  isLoading,
  className = "",
  onAddEvent
}: DayCellProps) => {
  return (
    <div 
      className={`group relative bg-white border-r border-b border-gray-200 min-h-[120px] transition-all duration-300 last:border-r-0
        ${!isCurrentMonth ? 'opacity-50' : ''}
        ${isToday(date) ? 'outline outline-1 outline-[#0EA5E9] outline-offset-[-1px] z-10' : ''}
        ${className}
      `}
    >
      {/* Add Event Button - Hidden by default, shown on hover */}
      <button
        onClick={() => onAddEvent?.(date)}
        className="absolute top-2 right-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 
                 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
        aria-label="Add event"
      >
        <Plus className="h-4 w-4 text-gray-600" />
      </button>

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
