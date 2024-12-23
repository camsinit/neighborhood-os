import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

interface CalendarHeaderProps {
  view: 'week' | 'month';
  setView: (view: 'week' | 'month') => void;
  handlePreviousWeek: () => void;
  handleNextWeek: () => void;
  handleToday: () => void;
  setIsAddEventOpen: (open: boolean) => void;
}

const CalendarHeader = ({
  view,
  setView,
  handlePreviousWeek,
  handleNextWeek,
  handleToday,
  setIsAddEventOpen
}: CalendarHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold text-gray-900">Community Calendar</h2>
      <div className="flex items-center gap-6">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className={`hover:bg-gray-100 ${view === 'week' ? 'bg-primary text-white hover:bg-primary/90' : ''}`}
            onClick={() => setView('week')}
          >
            Week
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className={`hover:bg-gray-100 ${view === 'month' ? 'bg-primary text-white hover:bg-primary/90' : ''}`}
            onClick={() => setView('month')}
          >
            Month
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8 hover:bg-gray-100" onClick={handlePreviousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="hover:bg-gray-100" onClick={handleToday}>Today</Button>
          <Button variant="outline" size="icon" className="h-8 w-8 hover:bg-gray-100" onClick={handleNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button 
            onClick={() => setIsAddEventOpen(true)}
            className="flex items-center gap-2 ml-4 hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add Event
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CalendarHeader;