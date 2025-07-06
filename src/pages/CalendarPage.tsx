import React from 'react';
import ModuleLayout from '@/components/layout/ModuleLayout';
import { usePageSheetController } from '@/hooks/usePageSheetController';
import { Sheet } from '@/components/ui/sheet';
import EventSheetContent from '@/components/event/EventSheetContent';
import CommunityCalendar from '@/components/CommunityCalendar';
import { useEvents } from '@/utils/queries/useEvents';

/**
 * CalendarPage Component
 * 
 * Displays the community calendar with universal sheet management
 * and supports highlighting events from deep links.
 */
function CalendarPage() {
  const { data: events } = useEvents();
  
  // Universal page controller for sheet management
  const {
    isSheetOpen,
    sheetItem,
    openSheet,
    closeSheet
  } = usePageSheetController({
    contentType: 'event',
    fetchItem: async (id: string) => {
      // Find event in the current data
      return events?.find(event => event.id === id) || null;
    },
    pageName: 'CalendarPage'
  });
  return (
    <>
      <ModuleLayout
        title="Community Calendar"
        description="Upcoming events in your neighborhood"
        themeColor="calendar"
      >
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg">
          <CommunityCalendar />
        </div>
      </ModuleLayout>

      {/* Universal sheet management */}
      {isSheetOpen && sheetItem && (
        <Sheet open={isSheetOpen} onOpenChange={(open) => !open && closeSheet()}>
          <EventSheetContent 
            event={sheetItem} 
            onOpenChange={closeSheet}
          />
        </Sheet>
      )}
    </>
  );
}
export default CalendarPage;