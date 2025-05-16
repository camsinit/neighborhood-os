
import React from 'react';
import { format, parseISO, isFuture, isToday, addDays, isWithinInterval } from 'date-fns';
import { Event } from "@/types/localTypes";
import { Skeleton } from "@/components/ui/skeleton";
import EventCard from "../EventCard";
import { motion } from "framer-motion";

interface AgendaViewProps {
  currentDate: Date;
  events: Event[];
  isLoading: boolean;
  highlightedId?: string | null;
}

/**
 * AgendaView component displays events in a list format grouped by day
 * 
 * This component:
 * - Shows events in a chronological list
 * - Groups events by date
 * - Highlights events matching the highlightedId
 * 
 * @param currentDate - The current date for filtering events
 * @param events - Array of events to display
 * @param isLoading - Whether events are loading
 * @param highlightedId - ID of event to highlight (if any)
 */
const AgendaView: React.FC<AgendaViewProps> = ({ 
  currentDate, 
  events, 
  isLoading,
  highlightedId
}) => {
  // If loading, show skeleton loaders
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="p-4 bg-white rounded-md shadow">
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-20 w-full" />
          </div>
        ))}
      </div>
    );
  }

  // Filter and sort events
  // Show events from today and the next 30 days
  const filteredEvents = events
    .filter(event => {
      const eventDate = parseISO(event.time);
      return isWithinInterval(eventDate, {
        start: new Date(),
        end: addDays(new Date(), 30)
      });
    })
    .sort((a, b) => parseISO(a.time).getTime() - parseISO(b.time).getTime());

  // Group events by date
  const eventsByDate: Record<string, Event[]> = {};
  
  filteredEvents.forEach(event => {
    const eventDate = parseISO(event.time);
    const dateKey = format(eventDate, 'yyyy-MM-dd');
    
    if (!eventsByDate[dateKey]) {
      eventsByDate[dateKey] = [];
    }
    
    eventsByDate[dateKey].push(event);
  });

  // Format date headings based on relative time
  const formatDateHeading = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return 'Today';
    if (isToday(addDays(date, -1))) return 'Tomorrow';
    return format(date, 'EEEE, MMMM d');
  };
  
  // If no events, show empty state
  if (Object.keys(eventsByDate).length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming events</h3>
        <p className="text-gray-500">No events are scheduled for the next 30 days.</p>
      </div>
    );
  }

  // Animation for list items
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3
      }
    })
  };

  return (
    <div className="space-y-6">
      {Object.keys(eventsByDate).map((dateKey, groupIndex) => (
        <div key={dateKey} className="mb-6">
          <h3 className="text-xl font-semibold mb-3 pl-2 border-l-4 border-blue-400">
            {formatDateHeading(dateKey)}
          </h3>
          
          <div className="space-y-2">
            {eventsByDate[dateKey].map((event, eventIndex) => (
              <motion.div
                key={event.id}
                custom={eventIndex}
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                className={`bg-white rounded-md shadow-sm ${event.id === highlightedId ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
              >
                <EventCard 
                  event={event}
                  listView={true}
                />
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AgendaView;
