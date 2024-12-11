import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { 
  addWeeks, 
  subWeeks, 
  startOfWeek, 
  endOfWeek,
  addDays, 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval,
  isSameMonth 
} from "date-fns";
import EventCard from "./EventCard";
import { monthEvents } from "@/data/events";

const CommunityCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'week' | 'month'>('week');
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  const weekStart = startOfWeek(currentDate);
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const monthDates = eachDayOfInterval({ start: startOfWeek(monthStart), end: endOfWeek(monthEnd) });

  const handlePreviousWeek = () => {
    setCurrentDate(subWeeks(currentDate, 1));
  };

  const handleNextWeek = () => {
    setCurrentDate(addWeeks(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const renderWeekView = () => (
    <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
      {weekDates.map((date, i) => (
        <div key={i} className="bg-white p-4">
          <div className="text-sm text-gray-500 mb-1">{days[i]}</div>
          <div className="text-lg font-medium mb-3">{format(date, 'd')}</div>
          <div className="space-y-1">
            {monthEvents[parseInt(format(date, 'd'))]?.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderMonthView = () => (
    <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
      {days.map((day, i) => (
        <div key={i} className="bg-white p-2 text-sm text-gray-500 font-medium text-center">
          {day}
        </div>
      ))}
      {monthDates.map((date, i) => (
        <div 
          key={i} 
          className={`bg-white p-2 min-h-[120px] ${!isSameMonth(date, currentDate) ? 'opacity-50' : ''}`}
        >
          <div className="text-sm font-medium mb-2">{format(date, 'd')}</div>
          <div className="space-y-1">
            {monthEvents[parseInt(format(date, 'd'))]?.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Community Calendar</h2>
        <div className="flex items-center gap-6">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className={view === 'week' ? 'bg-primary text-white hover:bg-primary' : ''}
              onClick={() => setView('week')}
            >
              Week
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className={view === 'month' ? 'bg-primary text-white hover:bg-primary' : ''}
              onClick={() => setView('month')}
            >
              Month
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={handlePreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleToday}>Today</Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      {view === 'week' ? renderWeekView() : renderMonthView()}
    </div>
  );
};

export default CommunityCalendar;