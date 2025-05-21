
import React, { useEffect } from 'react';
import { ModuleContainer, ModuleContent, ModuleHeader } from '@/components/layout/module';
import { useSearchParams } from 'react-router-dom'; 
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useHighlightedItem } from '@/hooks/useHighlightedItem';
import { highlightItem } from '@/utils/highlight';
import CommunityCalendar from '@/components/CommunityCalendar';
import { useState } from 'react';

/**
 * CalendarPage Component
 * 
 * Displays the community calendar with proper module styling
 * and supports highlighting events from deep links.
 */
function CalendarPage() {
  const [searchParams] = useSearchParams();
  const highlightedEvent = useHighlightedItem('event');
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);

  // Effect to handle deep linking to specific events
  useEffect(() => {
    const eventId = searchParams.get('eventId');
    if (eventId) {
      highlightItem('event', eventId);
    }
  }, [searchParams]);

  return (
    <ModuleContainer themeColor="calendar">
      <ModuleHeader 
        title="Community Calendar"
        description="Upcoming events in your neighborhood"
        themeColor="calendar"
        actions={
          <Button 
            className="whitespace-nowrap flex items-center gap-1.5"
            onClick={() => setIsAddEventOpen(true)}
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add Event</span>
          </Button>
        }
      />
      <ModuleContent>
        <div className="module-card">
          <CommunityCalendar />
        </div>
      </ModuleContent>
    </ModuleContainer>
  );
}

export default CalendarPage;
