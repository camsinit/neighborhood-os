import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, CalendarDays, Calendar } from "lucide-react";
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
  const periodLabel = format(currentDate, 'MMMM');
  return <div className="space-y-4 mb-8">
      <div className="flex flex-col gap-4">
        
      </div>
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-medium text-gray-700">{periodLabel}</h3>
        <div className="flex items-center gap-6">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className={`bg-white text-gray-900 hover:bg-gray-100 ${view === 'week' ? 'border-primary' : ''}`} onClick={() => setView('week')}>
              <CalendarDays className="h-4 w-4" />
              Week
            </Button>
            <Button variant="outline" size="sm" className={`bg-white text-gray-900 hover:bg-gray-100 ${view === 'month' ? 'border-primary' : ''}`} onClick={() => setView('month')}>
              <Calendar className="h-4 w-4" />
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
            <Button size="sm" onClick={() => setIsAddEventOpen(true)} className="flex items-center gap-2 ml-4 bg-[#1EAEDB] hover:bg-[#1EAEDB]/90 text-white">
              <Plus className="h-4 w-4" />
              Add Event
            </Button>
          </div>
        </div>
      </div>
    </div>;
};
export default CalendarHeader;