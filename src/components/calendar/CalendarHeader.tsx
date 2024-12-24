import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { format, startOfWeek, endOfWeek } from "date-fns";

interface CalendarHeaderProps {
  view: 'week' | 'month';
  currentDate: Date;
  setView: (view: 'week' | 'month') => void;
  handlePreviousWeek: () => void;
  handleNextWeek: () => void;
  handleToday: () => void;
  setIsAddEventOpen: (open: boolean) => void;
}

const CalendarHeader = ({
  view,
  currentDate,
  setView,
  handlePreviousWeek,
  handleNextWeek,
  handleToday,
  setIsAddEventOpen
}: CalendarHeaderProps) => {
  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);
  
  const periodLabel = view === 'month' 
    ? format(currentDate, 'MMMM yyyy')
    : `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Community Calendar</h2>
        <div className="flex items-center gap-6">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className={`bg-white text-gray-900 hover:bg-gray-100 ${view === 'week' ? 'border-primary' : ''}`}
              onClick={() => setView('week')}
            >
              Week
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className={`bg-white text-gray-900 hover:bg-gray-100 ${view === 'month' ? 'border-primary' : ''}`}
              onClick={() => setView('month')}
            >
              Month
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="bg-white text-gray-900 hover:bg-gray-100" onClick={handlePreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="bg-white text-gray-900 hover:bg-gray-100" onClick={handleToday}>Today</Button>
            <Button variant="outline" size="sm" className="bg-white text-gray-900 hover:bg-gray-100" onClick={handleNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button 
              size="sm"
              onClick={() => setIsAddEventOpen(true)}
              className="flex items-center gap-2 ml-4 bg-[#1EAEDB] hover:bg-[#1EAEDB]/90 text-white"
            >
              <Plus className="h-4 w-4" />
              Add Event
            </Button>
          </div>
        </div>
      </div>
      <div className="flex items-center">
        <h3 className="text-xl font-medium text-gray-700 py-2 pl-1">{periodLabel}</h3>
      </div>
    </div>
  );
};

export default CalendarHeader;