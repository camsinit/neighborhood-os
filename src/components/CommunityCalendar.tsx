
/**
 * CommunityCalendar component
 * 
 * This component displays events in either a week, month, or agenda view.
 * It allows users to navigate between weeks/months and add new events.
 * 
 * @param initialView - The initial calendar view to display
 * @param highlightedId - ID of event to highlight (if any)
 */
import { useState, useEffect } from "react";
import AddEventDialog from "./AddEventDialog";
import CalendarHeader from "./calendar/CalendarHeader";
import WeekView from "./calendar/WeekView";
import MonthView from "./calendar/MonthView";
import AgendaView from "./calendar/AgendaView";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { motion } from "framer-motion";
import { useCalendarNavigation } from "@/hooks/calendar/useCalendarNavigation";
import { useCalendarEvents } from "@/hooks/calendar/useCalendarEvents";
import { useCalendarView } from "@/hooks/calendar/useCalendarView";
import { useEventHighlighting } from "@/hooks/calendar/useEventHighlighting";
import { useEventNavigation } from "@/hooks/calendar/useEventNavigation";
import { useWeekCalculation } from "@/hooks/calendar/useWeekCalculation";
import { useMonthCalculation } from "@/hooks/calendar/useMonthCalculation";
import { format } from "date-fns";
interface CommunityCalendarProps {
  initialView?: 'week' | 'month' | 'agenda';
  highlightedId?: string | null;
}
const CommunityCalendar = ({
  initialView = 'week',
  highlightedId = null
}: CommunityCalendarProps) => {
  // Use custom hooks to manage calendar state and behavior
  const {
    view,
    setView
  } = useCalendarView({
    initialView
  });

  // Fixed: Use the navigation hook and extract methods that don't require parameters
  const {
    currentDate,
    setCurrentDate,
    handlePrevious,
    handleNext,
    handleToday
  } = useCalendarNavigation();
  const {
    events,
    isLoading,
    getEventsForDate,
    handleAddEvent,
    isAddEventOpen,
    setIsAddEventOpen
  } = useCalendarEvents();

  // Set up highlighting and navigation
  useEventHighlighting({
    highlightedId,
    events,
    currentDate,
    setCurrentDate
  });
  useEventNavigation({
    events,
    currentDate,
    setCurrentDate,
    view,
    setView
  });

  // Calculate date ranges based on current view
  const {
    weekDates
  } = useWeekCalculation(currentDate);

  // Set up auto-refresh for calendar events
  useAutoRefresh(['events'], ['event-submitted', 'event-deleted', 'event-updated']);

  // Animation variants for view transitions
  const viewTransitions = {
    hidden: {
      opacity: 0,
      y: 10
    },
    visible: {
      opacity: 1,
      y: 0
    }
  };
  return <div className="w-full">
      <CalendarHeader view={view} currentDate={currentDate} setView={setView} handlePreviousWeek={handlePrevious} // Fixed: Now passing the correct no-parameter function
    handleNextWeek={handleNext} // Fixed: Now passing the correct no-parameter function
    handleToday={handleToday} setIsAddEventOpen={setIsAddEventOpen} />
      
      <motion.div key={`${view}-${format(currentDate, 'yyyy-MM-dd')}`} initial="hidden" animate="visible" variants={viewTransitions} transition={{
      duration: 0.3
    }} className="calendar-container bg-white rounded-xl p-4 px-0">
        {view === 'week' && <WeekView weekDates={weekDates} events={events} isLoading={isLoading} getEventsForDate={getEventsForDate} highlightedId={highlightedId} />}
        
        {view === 'month' && <MonthView currentDate={currentDate} events={events || []} isLoading={isLoading} highlightedId={highlightedId} />}
        
        {view === 'agenda' && <AgendaView currentDate={currentDate} events={events || []} isLoading={isLoading} highlightedId={highlightedId} />}
      </motion.div>

      <AddEventDialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen} onAddEvent={handleAddEvent} />
    </div>;
};
export default CommunityCalendar;
