
/**
 * CalendarEvents component
 * This component is a simple bridge to the CommunityCalendar component
 * for backward compatibility with existing code.
 */
import React from 'react';
import CommunityCalendar from '../CommunityCalendar';

interface CalendarEventsProps {
  view: 'month' | 'week' | 'agenda';
  highlightedId?: string | null;
}

const CalendarEvents: React.FC<CalendarEventsProps> = ({ view, highlightedId }) => {
  return <CommunityCalendar initialView={view} highlightedId={highlightedId} />;
};

export default CalendarEvents;
