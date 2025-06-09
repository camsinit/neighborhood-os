
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { format } from "date-fns";
import { useNeighborhood } from "@/contexts/neighborhood";
import { useMemo, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatInNeighborhoodTimezone } from "@/utils/dateUtils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CalendarHeaderProps {
  view: 'week' | 'month';
  currentDate: Date;
  setView: (view: 'week' | 'month') => void;
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
    if (view === 'week') {
      return formatInNeighborhoodTimezone(currentDate, 'MMMM yyyy', neighborhoodTimezone);
    } else {
      return formatInNeighborhoodTimezone(currentDate, 'MMMM yyyy', neighborhoodTimezone);
    }
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
  
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
      <div className="flex items-center space-x-2">
        <CalendarIcon className="h-5 w-5 text-blue-500" />
        <h2 className="text-xl font-semibold flex flex-col sm:flex-row sm:items-center gap-1">
          <span>{formattedDate}</span>
        </h2>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {/* Navigation buttons with consistent height - removed shadow wrapper */}
        <Button variant="outline" size="sm" onClick={handlePreviousWeek}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={handleToday}>
          Today
        </Button>
        <Button variant="outline" size="sm" onClick={handleNextWeek}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        {/* View toggle using standard Tabs component like in Freebies */}
        <Tabs value={view} onValueChange={(value) => value && setView(value as 'week' | 'month')}>
          <TabsList>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Button onClick={() => setIsAddEventOpen(true)} size="sm" className="ml-auto">
          <Plus className="h-4 w-4 mr-1" /> Add Event
        </Button>
      </div>
    </div>
  );
};

export default CalendarHeader;
