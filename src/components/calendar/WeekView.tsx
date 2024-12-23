import { format, isToday } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import EventCard from "../EventCard";
import { Event } from "@/types/calendar";

interface WeekViewProps {
  weekDates: Date[];
  events: Event[] | undefined;
  isLoading: boolean;
  getEventsForDate: (date: Date) => Event[];
  onEventDelete?: () => void;
}

const WeekView = ({ weekDates, events, isLoading, getEventsForDate, onEventDelete }: WeekViewProps) => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
      {weekDates.map((date, i) => (
        <div 
          key={i} 
          className={`bg-white p-4 transition-all duration-300 ${
            isToday(date) ? 'ring-2 ring-primary ring-offset-2' : ''
          }`}
        >
          <div className="text-sm text-gray-500 mb-1">{days[i]}</div>
          <div className={`text-lg font-medium mb-3 ${
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
              getEventsForDate(date).map((event) => (
                <EventCard 
                  key={event.id} 
                  event={{
                    ...event,
                    color: "bg-blue-100 border-blue-300",
                  }}
                  onDelete={onEventDelete}
                />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default WeekView;