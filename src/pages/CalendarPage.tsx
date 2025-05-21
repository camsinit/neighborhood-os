
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
 * The description is now displayed in a full-width box beneath the header.
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

  return (
    <ModuleContainer themeColor="calendar">
      {/* Header without action buttons */}
      <ModuleHeader 
        title="Community Calendar"
        themeColor="calendar"
      />
      
      {/* Full-width description box */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="module-description mt-0">
          <p className="text-gray-700 text-sm">Upcoming events in your neighborhood</p>
        </div>
      </div>
      
      <ModuleContent>
        <div className="module-card">
          <CommunityCalendar />
        </div>
      </ModuleContent>
    </ModuleContainer>
  );
}

export default CalendarPage;
