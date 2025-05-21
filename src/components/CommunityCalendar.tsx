
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
import { toast } from "@/hooks/use-toast"; // Updated import path
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { createLogger } from "@/utils/logger";
import { Event as LocalEvent } from "@/types/localTypes";

// Create a logger for the CommunityCalendar component
const logger = createLogger('CommunityCalendar');

/**
 * Props for the CommunityCalendar component
 */
interface CommunityCalendarProps {
  // View mode: week, month, or agenda
  view?: 'week' | 'month' | 'agenda';
}

/**
 * CommunityCalendar component
 * 
 * This component displays events in either a week, month, or agenda view.
 * It allows users to navigate between weeks/months and add new events.
 */
const CommunityCalendar = ({ view: initialView = 'week' }: CommunityCalendarProps) => {
  // State for current date and view mode
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'week' | 'month' | 'agenda'>(initialView);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  
  // Update view when initialView prop changes
  useEffect(() => {
    if (initialView !== view) {
      setView(initialView);
    }
  }, [initialView]);
  
  // Fetch events data with React Query
  const { data: events, isLoading, refetch } = useEvents();
  
  // Set up auto-refresh for calendar events
  // This will listen for multiple events that should trigger a calendar refresh
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

  // Type-safe function to get events for a specific date
  const getEventsForDate = (date: Date): LocalEvent[] => {
    if (!events) return [];
    
    // Convert fetched events to LocalEvent type with required properties
    return events.filter(event => {
      const eventDate = parseISO(event.time);
      return isEqual(
        new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate()),
        new Date(date.getFullYear(), date.getMonth(), date.getDate())
      );
    }) as LocalEvent[]; // Type assertion here as we know the structure matches
  };

  // Handle event addition and trigger refetch
  const handleAddEvent = async () => {
    logger.debug("Event added, refreshing data");
    await refetch();
  };

  // Render agenda view
  if (view === 'agenda') {
    return (
      <div className="space-y-6">
        <CalendarHeader 
          view={view}
          currentDate={currentDate}
          setView={setView}
          handlePreviousWeek={handlePrevious}
          handleNextWeek={handleNext}
          handleToday={handleToday}
          setIsAddEventOpen={setIsAddEventOpen}
        />
        
        {/* Simple agenda view */}
        <div className="space-y-4">
          {events && events.length > 0 ? (
            events.map(event => (
              <div 
                key={event.id} 
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
              >
                <h3 className="text-lg font-medium">{event.title}</h3>
                <div className="text-sm text-gray-500">
                  {new Date(event.time).toLocaleString()}
                </div>
                <div className="text-sm">{event.location}</div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 p-8">
              {isLoading ? "Loading events..." : "No events scheduled"}
            </div>
          )}
        </div>
      </div>
    );
  }

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
