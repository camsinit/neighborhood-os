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
    <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
      {days.map((day, i) => (
        <div key={i} className="bg-white p-2 text-sm text-gray-500 font-medium text-center">
          {day}
        </div>
      ))}
      {monthDates.map((date, i) => (
        <DayCell
          key={i}
          date={date}
          isCurrentMonth={isSameMonth(date, currentDate)}
          events={getEventsForDate(date)}
          isLoading={isLoading}
          className="p-2 min-h-[120px]"
        />
      ))}
    </div>
  );
};

export default MonthView;