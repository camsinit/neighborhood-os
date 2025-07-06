
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
} from "date-fns";
import AddEventDialog from "./AddEventDialog";
import { useEvents } from "@/utils/queries/useEvents";
import CalendarHeader from "./calendar/CalendarHeader";
import WeekView from "./calendar/WeekView";
import MonthView from "./calendar/MonthView";
import { addScaleAnimation } from "@/utils/animations";
import { toast } from "sonner"; // Updated import for toast
import { useAutoRefreshOptimized } from "@/hooks/useAutoRefreshOptimized"; // Updated import
import { createLogger } from "@/utils/logger";
import { Event as LocalEvent } from "@/types/localTypes"; // Import the local Event type
import { getEventsWithRecurring } from "@/utils/recurringEvents"; // Import recurring events utility

// Create a logger for the CommunityCalendar component
const logger = createLogger('CommunityCalendar');

/**
 * CommunityCalendar component
 * 
 * This component displays events in either a week or month view.
 * It allows users to navigate between weeks/months and add new events.
 */
const CommunityCalendar = () => {
  // State for current date and view mode
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'week' | 'month'>('week');
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  
  // Fetch events data with React Query
  const { data: events, isLoading, refetch } = useEvents();
  
  // Set up auto-refresh for calendar events using optimized hook
  useAutoRefreshOptimized(['events'], refetch);

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

        // Highlight the event's day
        setTimeout(() => {
          const dayCell = document.querySelector(`[data-date="${event.time.split('T')[0]}"]`);
          if (dayCell) {
            dayCell.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
            dayCell.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Remove highlight after animation
            setTimeout(() => {
              dayCell.classList.remove('ring-2', 'ring-primary', 'ring-offset-2');
            }, 2000);
          }
        }, 100);

        // Show toast using Sonner directly
        toast("Event Located", {
          description: `Navigated to "${event.title}"`
        });
      }
    };

    window.addEventListener('navigateToEvent', handleNavigateToEvent as EventListener);
    return () => {
      window.removeEventListener('navigateToEvent', handleNavigateToEvent as EventListener);
    };
  }, [events, currentDate]);

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
  };

  // Type-safe function to get events for a specific date including recurring instances
  const getEventsForDate = (date: Date): LocalEvent[] => {
    if (!events) return [];
    
    // Generate a date range for recurring event calculation
    // We'll generate events for a few months around the current date
    const rangeStart = startOfMonth(subMonths(date, 3));
    const rangeEnd = endOfMonth(addMonths(date, 6));
    
    // Get all events including recurring instances
    const allEvents = getEventsWithRecurring(events, rangeStart, rangeEnd);
    
    // Filter to only events on the specific date
    return allEvents.filter(event => {
      const eventDate = parseISO(event.time);
      return isEqual(
        new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate()),
        new Date(date.getFullYear(), date.getMonth(), date.getDate())
      );
    });
  };

  // Handle event addition and trigger refetch
  const handleAddEvent = async () => {
    logger.info("Event added, refreshing data");
    await refetch();
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
      
      <div className="calendar-container">
        {view === 'week' ? (
          <WeekView 
            weekDates={weekDates}
            events={events as LocalEvent[] | undefined}
            isLoading={isLoading}
            getEventsForDate={getEventsForDate}
          />
        ) : (
          <MonthView 
            currentDate={currentDate}
            events={events as LocalEvent[] || []}
            isLoading={isLoading}
            getEventsForDate={getEventsForDate}
          />
        )}
      </div>

      <AddEventDialog 
        open={isAddEventOpen}
        onOpenChange={setIsAddEventOpen}
        onAddEvent={handleAddEvent}
      />
    </div>
  );
};

export default CommunityCalendar;
