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
    <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
      {weekDates.map((date, i) => (
        <DayCell
          key={i}
          date={date}
          dayLabel={days[i]}
          events={getEventsForDate(date)}
          isLoading={isLoading}
          className="p-4"
        />
      ))}
    </div>
  );
};

export default WeekView;