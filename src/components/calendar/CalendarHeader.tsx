import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock } from "lucide-react";
import { format } from "date-fns";
import { useNeighborhood } from "@/contexts/neighborhood";
import { useMemo, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatInNeighborhoodTimezone } from "@/utils/dateUtils";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CalendarViewType } from "@/hooks/calendar/useCalendarView";

/**
 * Updated interface to match the functions without view parameters
 */
interface CalendarHeaderProps {
  view: CalendarViewType;
  currentDate: Date;
  setView: (view: CalendarViewType) => void;
  // Fixed: Change these to accept no parameters
  handlePreviousWeek: () => void;
  handleNextWeek: () => void;
  handleToday: () => void;
  setIsAddEventOpen: (open: boolean) => void;
}

/**
 * CalendarHeader component displays navigation and controls for the calendar
 * 
 * @param props - Component props
 */
const CalendarHeader = (props: CalendarHeaderProps) => {
  const {
    view,
    currentDate,
    setView,
    handlePreviousWeek,
    handleNextWeek,
    handleToday,
    setIsAddEventOpen
  } = props;
  const {
    currentNeighborhood
  } = useNeighborhood();
  const [neighborhoodTimezone, setNeighborhoodTimezone] = useState<string>('America/Los_Angeles');

  // Fetch neighborhood timezone
  useEffect(() => {
    const fetchNeighborhoodTimezone = async () => {
      if (currentNeighborhood?.id) {
        const {
          data,
          error
        } = await supabase.from('neighborhoods').select('timezone').eq('id', currentNeighborhood.id).single();
        if (data && !error) {
          setNeighborhoodTimezone(data.timezone || 'America/Los_Angeles');
        }
      }
    };
    fetchNeighborhoodTimezone();
  }, [currentNeighborhood?.id]);

  // Format the current date according to the view and neighborhood timezone
  const formattedDate = useMemo(() => {
    // Simplify this, all views can use the same format
    return formatInNeighborhoodTimezone(currentDate, 'MMMM yyyy', neighborhoodTimezone);
  }, [currentDate, view, neighborhoodTimezone]);

  // Get the timezone abbreviation for display
  const getTimezoneAbbreviation = () => {
    // This is a simple function to get timezone abbreviation
    // Returns basic timezone abbreviations for common US timezones
    if (neighborhoodTimezone.includes('Los_Angeles')) return 'PT';
    if (neighborhoodTimezone.includes('Denver')) return 'MT';
    if (neighborhoodTimezone.includes('Chicago')) return 'CT';
    if (neighborhoodTimezone.includes('New_York')) return 'ET';

    // For other timezones, return the last part after the "/"
    const parts = neighborhoodTimezone.split('/');
    return parts[parts.length - 1].replace('_', ' ');
  };
  return <motion.div initial={{
    opacity: 0,
    y: -5
  }} animate={{
    opacity: 1,
    y: 0
  }} className="bg-white rounded-xl p-4 mb-6 border border-gray-100">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Calendar title section */}
        <div className="flex items-center gap-3">
          
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {formattedDate}
            </h2>
            
          </div>
        </div>
        
        {/* Calendar controls section */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Navigation controls */}
          <div className="bg-gray-50 rounded-lg p-1 flex shadow-sm">
            <Button variant="ghost" size="sm" onClick={handlePreviousWeek} className="text-gray-700 hover:text-blue-600 hover:bg-blue-50">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleToday} className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 font-medium">
              Today
            </Button>
            <Button variant="ghost" size="sm" onClick={handleNextWeek} className="text-gray-700 hover:text-blue-600 hover:bg-blue-50">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          {/* View selector */}
          <div className="bg-gray-50 rounded-lg p-1 flex shadow-sm">
            {['Week', 'Month', 'Agenda'].map(viewType => <Button key={viewType} variant="ghost" size="sm" onClick={() => setView(viewType.toLowerCase() as CalendarViewType)} className={cn("font-medium transition-all", view === viewType.toLowerCase() ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-blue-600 hover:bg-blue-50")}>
                {viewType}
              </Button>)}
          </div>
          
          {/* Add event button */}
          <Button onClick={() => setIsAddEventOpen(true)} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-medium ml-auto">
            <Plus className="h-4 w-4 mr-1" /> Add Event
          </Button>
        </div>
      </div>
    </motion.div>;
};
export default CalendarHeader;