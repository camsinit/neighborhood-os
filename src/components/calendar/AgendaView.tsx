
import React from 'react';
import { format, parseISO, isFuture, isToday, addDays, isWithinInterval, isYesterday, isTomorrow } from 'date-fns';
import { Event } from "@/types/localTypes";
import { Skeleton } from "@/components/ui/skeleton";
import EventCard from "../EventCard";
import { motion } from "framer-motion";
import { Calendar, Clock } from "lucide-react";

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
          <div key={i} className="p-5 bg-white rounded-xl shadow-sm border border-gray-100">
            <Skeleton className="h-6 w-40 mb-3" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
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
    
    if (isToday(date)) {
      return (
        <div className="flex items-center gap-2 text-blue-600">
          <Calendar className="h-5 w-5" />
          <span className="font-bold">Today</span>
        </div>
      );
    }
    
    if (isTomorrow(date)) {
      return (
        <div className="flex items-center gap-2 text-green-600">
          <Calendar className="h-5 w-5" />
          <span className="font-bold">Tomorrow</span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center gap-2 text-gray-700">
        <Calendar className="h-5 w-5" />
        <span className="font-bold">{format(date, 'EEEE, MMMM d')}</span>
      </div>
    );
  };
  
  // If no events, show empty state
  if (Object.keys(eventsByDate).length === 0) {
    return (
      <div className="p-8 bg-white rounded-xl shadow-sm border border-gray-100 text-center">
        <div className="inline-flex mx-auto items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
          <Calendar className="h-8 w-8 text-blue-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming events</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          No events are scheduled for the next 30 days. Click the "Add Event" button to create a new event.
        </p>
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
          {/* Date heading with icon */}
          <div className="mb-4 px-4 py-2 bg-gray-50 rounded-lg inline-block">
            {formatDateHeading(dateKey)}
          </div>
          
          {/* Events for this date */}
          <div className="space-y-3">
            {eventsByDate[dateKey].map((event, eventIndex) => (
              <motion.div
                key={event.id}
                custom={eventIndex}
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                className={`bg-white rounded-xl shadow-sm border ${event.id === highlightedId ? 'border-blue-300 ring-2 ring-blue-200' : 'border-gray-100'}`}
              >
                <EventCard 
                  event={event}
                  listView={true}
                  isHighlighted={event.id === highlightedId}
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
