
import { useState, useEffect } from "react";
import { 
  addWeeks, 
  subWeeks, 
  startOfWeek, 
  endOfWeek,
  addDays,
  addMonths,
  subMonths, 
  startOfMonth, 
  endOfMonth,
  eachDayOfInterval,
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
import { useToast } from "@/components/ui/use-toast";

const CommunityCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'week' | 'month'>('week');
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const { data: events, isLoading, refetch } = useEvents();
  const { toast } = useToast();
  
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
          title: "Event Located",
          description: `Navigated to "${event.title}"`,
          duration: 3000,
        });
      }
    };

    window.addEventListener('navigateToEvent', handleNavigateToEvent as EventListener);
    return () => {
      window.removeEventListener('navigateToEvent', handleNavigateToEvent as EventListener);
    };
  }, [events, currentDate, toast]);

  const weekStart = startOfWeek(currentDate);
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

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

  const getEventsForDate = (date: Date) => {
    if (!events) return [];
    return events.filter(event => {
      const eventDate = parseISO(event.time);
      return isEqual(
        new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate()),
        new Date(date.getFullYear(), date.getMonth(), date.getDate())
      );
    });
  };

  const handleAddEvent = async () => {
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
            events={events}
            isLoading={isLoading}
            getEventsForDate={getEventsForDate}
          />
        ) : (
          <MonthView 
            currentDate={currentDate}
            events={events || []}
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
