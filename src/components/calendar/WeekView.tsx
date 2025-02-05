import { Event } from "@/types/calendar";
import DayCell from "./DayCell";

interface WeekViewProps {
  weekDates: Date[];
  events: Event[] | undefined;
  isLoading: boolean;
  getEventsForDate: (date: Date) => Event[];
}

const WeekView = ({ weekDates, events, isLoading, getEventsForDate }: WeekViewProps) => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-7">
        {days.map((day, i) => (
          <div key={i} className="text-sm font-semibold text-gray-900 text-center">
            {day}
          </div>
        ))}
      </div>
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="grid grid-cols-7 divide-x divide-gray-200">
          {weekDates.map((date, i) => (
            <DayCell
              key={i}
              date={date}
              events={getEventsForDate(date)}
              isLoading={isLoading}
              className="min-h-[200px]"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeekView;