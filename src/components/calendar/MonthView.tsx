import { isSameMonth } from "date-fns";
import { Event } from "@/types/calendar";
import DayCell from "./DayCell";

interface MonthViewProps {
  monthDates: Date[];
  currentDate: Date;
  events: Event[] | undefined;
  isLoading: boolean;
  getEventsForDate: (date: Date) => Event[];
}

const MonthView = ({ monthDates, currentDate, events, isLoading, getEventsForDate }: MonthViewProps) => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200">
      <div className="grid grid-cols-7">
        {days.map((day, i) => (
          <div key={i} className="p-2 text-sm font-semibold text-gray-900 text-center">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 divide-x divide-y divide-gray-200">
        {monthDates.map((date, i) => (
          <DayCell
            key={i}
            date={date}
            isCurrentMonth={isSameMonth(date, currentDate)}
            events={getEventsForDate(date)}
            isLoading={isLoading}
            className="min-h-[120px]"
          />
        ))}
      </div>
    </div>
  );
};

export default MonthView;