
import { useEffect } from "react";
import { parseISO, isSameMonth } from "date-fns";
import AddEventDialog from "./AddEventDialog";
import { useEvents } from "@/utils/queries/useEvents";
import CalendarHeader from "./calendar/CalendarHeader";
import WeekView from "./calendar/WeekView";
import MonthView from "./calendar/MonthView";
import AgendaView from "./calendar/AgendaView";
import { toast } from "@/hooks/use-toast"; 
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { createLogger } from "@/utils/logger";
import { Event as LocalEvent } from "@/types/localTypes";
import { useCalendarState } from "@/hooks/useCalendarState";

// Create a logger for the CommunityCalendar component
const logger = createLogger('CommunityCalendar');

/**
 * Props for the CommunityCalendar component
 */
interface CommunityCalendarProps {
  view?: 'week' | 'month' | 'agenda';
}

/**
 * CommunityCalendar component
 * 
 * This component displays events in either a week, month, or agenda view.
 * It allows users to navigate between weeks/months and add new events.
 */
const CommunityCalendar = ({ view: initialView = 'week' }: CommunityCalendarProps) => {
  // Use our custom calendar state hook
  const {
    currentDate,
    view,
    setView,
    weekDates,
    isAddEventOpen,
    setIsAddEventOpen,
    handlePrevious,
    handleNext,
    handleToday,
    getEventsForDate
  } = useCalendarState(initialView);
  
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

        // Show toast
        toast({
          description: `Navigated to "${event.title}"`
        });
      }
    };

    window.addEventListener('navigateToEvent', handleNavigateToEvent as EventListener);
    return () => {
      window.removeEventListener('navigateToEvent', handleNavigateToEvent as EventListener);
    };
  }, [events, currentDate, setCurrentDate, setView]);

  // Handle event addition and trigger refetch
  const handleAddEvent = async () => {
    logger.debug("Event added, refreshing data");
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
        ) : view === 'month' ? (
          <MonthView 
            currentDate={currentDate}
            events={events as LocalEvent[] || []}
            isLoading={isLoading}
          />
        ) : (
          <AgendaView 
            events={events as LocalEvent[] | undefined}
            isLoading={isLoading}
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
