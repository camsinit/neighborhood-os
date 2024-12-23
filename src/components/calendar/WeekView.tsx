import { format, isEqual, parseISO } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import EventCard from "../EventCard";
import { Event } from "@/types/calendar";

interface WeekViewProps {
  weekDates: Date[];
  events: Event[] | undefined;
  isLoading: boolean;
  getEventsForDate: (date: Date) => Event[];
}

const WeekView = ({ weekDates, events, isLoading, getEventsForDate }: WeekViewProps) => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
      {weekDates.map((date, i) => (
        <div key={i} className="bg-white p-4">
          <div className="text-sm text-gray-500 mb-1">{days[i]}</div>
          <div className="text-lg font-medium mb-3">{format(date, 'd')}</div>
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