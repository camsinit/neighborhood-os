
import { Event } from "@/types/calendar";
import DayCell from "./DayCell";

interface WeekViewProps {
  weekDates: Date[];
  events: Event[] | undefined;
  isLoading: boolean;
  getEventsForDate: (date: Date) => Event[];
  onEventDelete?: () => void;
}

const WeekView = ({ weekDates, events, isLoading, getEventsForDate }: WeekViewProps) => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="space-y-2">
      {/* Day names header */}
      <div className="grid grid-cols-7">
        {days.map((day) => (
          <div key={day} className="text-lg font-medium px-4">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 border border-gray-200 rounded-lg overflow-hidden">
        {weekDates.map((date, i) => (
          <DayCell
            key={i}
            date={date}
            events={getEventsForDate(date)}
            isLoading={isLoading}
          />
        ))}
      </div>
    </div>
  );
};

export default WeekView;
