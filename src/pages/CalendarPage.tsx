import React, { useEffect } from 'react';
import { ModuleContainer, ModuleContent, ModuleHeader } from '@/components/layout/module';
import { useSearchParams } from 'react-router-dom';
import { useHighlightedItem } from '@/hooks/useHighlightedItem';
import { highlightItem } from '@/utils/highlight';
import CommunityCalendar from '@/components/CommunityCalendar';

/**
 * CalendarPage Component
 * 
 * Displays the community calendar with proper module styling
 * and supports highlighting events from deep links.
 * The description is displayed in a full-width box beneath the header.
 */
function CalendarPage() {
  const [searchParams] = useSearchParams();
  const highlightedEvent = useHighlightedItem('event');

  // Effect to handle deep linking to specific events
  useEffect(() => {
    const eventId = searchParams.get('eventId');
    if (eventId) {
      highlightItem('event', eventId);
    }
  }, [searchParams]);
  return <ModuleContainer themeColor="calendar">
      {/* Header with improved spacing */}
      <ModuleHeader title="Community Calendar" themeColor="calendar" />
      
      {/* Full-width description box with consistent padding */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 mb-6 sm:px-[25px]">
        <div className="module-description bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-100 shadow-sm mx-0 px-[16px]">
          <p className="text-gray-700 text-sm">Upcoming events in your neighborhood</p>
        </div>
      </div>
      
      <ModuleContent className="px-4 sm:px-6 lg:px-8">
        <div className="module-card">
          <CommunityCalendar />
        </div>
      </ModuleContent>
    </ModuleContainer>;
}
export default CalendarPage;