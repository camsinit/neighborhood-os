
import { format, isToday } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";
import EventCard from "../EventCard";
import { Event } from "@/types/localTypes";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface DayCellProps {
  date: Date;
  isCurrentMonth?: boolean;
  events: Event[];
  isLoading: boolean;
  className?: string;
  onAddEvent?: (date: Date) => void;
  highlightedId?: string | null;
}

/**
 * DayCell component represents a single day in the calendar grid
 * 
 * It displays:
 * - The date number
 * - Events scheduled for that date
 * - An "add event" button that appears on hover
 * - Highlighted state for specific events
 * 
 * @param date - The date this cell represents
 * @param isCurrentMonth - Whether this date is in the current month (for styling)
 * @param events - List of events for this date
 * @param isLoading - Whether events are loading
 * @param className - Additional CSS classes
 * @param onAddEvent - Callback function when user clicks "+" button to add an event
 * @param highlightedId - ID of event to highlight (if any)
 */
const DayCell = ({ 
  date, 
  isCurrentMonth = true, 
  events,
  isLoading,
  className = "",
  onAddEvent,
  highlightedId
}: DayCellProps) => {
  // Check if this cell contains the highlighted event
  const hasHighlightedEvent = events.some(event => event.id === highlightedId);
  const today = isToday(date);
  
  return (
    <div 
      className={cn(
        "group relative bg-white min-h-[120px] transition-all duration-300",
        !isCurrentMonth ? "opacity-60" : "",
        today ? "ring-2 ring-blue-400" : "border border-gray-100",
        hasHighlightedEvent ? "bg-blue-50" : "",
        className
      )}
      data-date={format(date, 'yyyy-MM-dd')}
    >
      {/* Add Event Button - Hidden by default, shown on hover */}
      <button
        onClick={() => onAddEvent?.(date)}
        className="absolute top-2 right-2 p-1.5 rounded-full bg-blue-500 text-white
                 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10
                 hover:bg-blue-600 hover:shadow-md transform hover:scale-105"
        aria-label={`Add event on ${format(date, 'MMM d, yyyy')}`}
      >
        <Plus className="h-3.5 w-3.5" />
      </button>

      {/* Date indicator */}
      <div className={cn(
        "p-2 border-b", 
        today ? "bg-blue-500 text-white" : "border-gray-100"
      )}>
        <span className={cn(
          "flex items-center justify-center w-7 h-7 text-sm font-medium rounded-full",
          today ? "bg-white text-blue-600" : ""
        )}>
          {format(date, 'd')}
        </span>
      </div>
      
      {/* Events container with scrolling */}
      <div className="space-y-1 p-2 max-h-[calc(100%-40px)] overflow-y-auto">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full mb-2" />
            <Skeleton className="h-8 w-full mb-2" />
          </div>
        ) : events.length === 0 ? (
          <div className="flex items-center justify-center h-[60px] text-xs text-gray-400 italic">
            No events
          </div>
        ) : (
          events.map((event) => (
            <motion.div 
              key={event.id}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <EventCard 
                event={event}
                isHighlighted={event.id === highlightedId}
              />
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default DayCell;
