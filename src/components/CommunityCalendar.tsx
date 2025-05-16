
import { useState, useEffect } from "react";
import { 
  addWeeks, 
  subWeeks, 
  startOfWeek, 
  addDays,
  addMonths,
  subMonths, 
  startOfMonth, 
  endOfMonth,
  parseISO,
  isEqual,
  isSameMonth,
  format,
} from "date-fns";
import AddEventDialog from "./AddEventDialog";
import { useEvents } from "@/utils/queries/useEvents";
import CalendarHeader from "./calendar/CalendarHeader";
import WeekView from "./calendar/WeekView";
import MonthView from "./calendar/MonthView";
import AgendaView from "./calendar/AgendaView";
import { addScaleAnimation } from "@/utils/animations";
import { toast } from "sonner";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { createLogger } from "@/utils/logger";
import { Event as LocalEvent } from "@/types/localTypes";
import { highlightItem } from "@/utils/highlight";
import { motion } from "framer-motion";

// Create a logger for the CommunityCalendar component
const logger = createLogger('CommunityCalendar');

interface CommunityCalendarProps {
  initialView?: 'week' | 'month' | 'agenda';
  highlightedId?: string | null;
}

/**
 * CommunityCalendar component
 * 
 * This component displays events in either a week, month, or agenda view.
 * It allows users to navigate between weeks/months and add new events.
 * 
 * @param initialView - The initial calendar view to display
 * @param highlightedId - ID of event to highlight (if any)
 */
const CommunityCalendar = ({ 
  initialView = 'week',
  highlightedId = null 
}: CommunityCalendarProps) => {
  // State for current date and view mode
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'week' | 'month' | 'agenda'>(initialView);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  
  // Fetch events data with React Query
  const { data: events, isLoading, refetch } = useEvents();
  
  // Set up auto-refresh for calendar events
  useAutoRefresh(
    ['events'], 
    ['event-submitted', 'event-deleted', 'event-updated']
  );

  // Handle event navigation (e.g. from notifications)
  useEffect(() => {
    const handleNavigateToEvent = (e: CustomEvent) => {
      const eventId = e.detail.eventId;
      const event = events?.find(event => event.id === eventId);
      
      if (event) {
        const eventDate = parseISO(event.time);
        
        // Update current date to event date
        setCurrentDate(eventDate);
        
        // Switch to appropriate view based on date
        if (!isSameMonth(eventDate, currentDate)) {
          setView('month');
        }

        // Highlight the event
        setTimeout(() => {
          highlightItem('event', eventId, true);
        }, 100);
      }
    };

    window.addEventListener('navigateToEvent', handleNavigateToEvent as EventListener);
    return () => {
      window.removeEventListener('navigateToEvent', handleNavigateToEvent as EventListener);
    };
  }, [events, currentDate]);
  
  // Handle highlighting when highlightedId changes
  useEffect(() => {
    if (highlightedId && events) {
      const event = events.find(event => event.id === highlightedId);
      if (event) {
        const eventDate = parseISO(event.time);
        // Update current date to event date to ensure it's visible
        setCurrentDate(eventDate);
      }
    }
  }, [highlightedId, events]);

  // Calculate date ranges based on current view
  const weekStart = startOfWeek(currentDate);
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Handle navigation functions
  const handlePrevious = () => {
    if (view === 'week') {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(subMonths(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (view === 'week') {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    addScaleAnimation(document.querySelector('.calendar-container'));
    
    // Show toast confirming navigation to today
    toast.success("Navigated to today's date", {
      position: "bottom-right",
      duration: 2000
    });
  };

  // Type-safe function to get events for a specific date
  const getEventsForDate = (date: Date): LocalEvent[] => {
    if (!events) return [];
    
    return events.filter(event => {
      const eventDate = parseISO(event.time);
      return isEqual(
        new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate()),
        new Date(date.getFullYear(), date.getMonth(), date.getDate())
      );
    }) as LocalEvent[];
  };

  // Handle event addition and trigger refetch
  const handleAddEvent = async () => {
    logger.debug("Event added, refreshing data");
    await refetch();
    
    // Show toast confirming event creation
    toast.success("Event created successfully!", {
      position: "bottom-right",
      duration: 3000
    });
  };

  // Animation variants for view transitions
  const viewTransitions = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="w-full">
      <CalendarHeader 
        view={view}
        currentDate={currentDate}
        setView={setView}
        handlePreviousWeek={handlePrevious}
        handleNextWeek={handleNext}
        handleToday={handleToday}
        setIsAddEventOpen={setIsAddEventOpen}
      />
      
      <motion.div 
        className="calendar-container bg-white rounded-xl shadow-md p-4"
        key={`${view}-${format(currentDate, 'yyyy-MM-dd')}`}
        initial="hidden"
        animate="visible"
        variants={viewTransitions}
        transition={{ duration: 0.3 }}
      >
        {view === 'week' && (
          <WeekView 
            weekDates={weekDates}
            events={events as LocalEvent[] | undefined}
            isLoading={isLoading}
            getEventsForDate={getEventsForDate}
            highlightedId={highlightedId}
          />
        )}
        
        {view === 'month' && (
          <MonthView 
            currentDate={currentDate}
            events={events as LocalEvent[] || []}
            isLoading={isLoading}
            highlightedId={highlightedId}
          />
        )}
        
        {view === 'agenda' && (
          <AgendaView
            currentDate={currentDate}
            events={events as LocalEvent[] || []}
            isLoading={isLoading}
            highlightedId={highlightedId}
          />
        )}
      </motion.div>

      <AddEventDialog 
        open={isAddEventOpen}
        onOpenChange={setIsAddEventOpen}
        onAddEvent={handleAddEvent}
      />
    </div>
  );
};

export default CommunityCalendar;
