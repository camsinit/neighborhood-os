import React from 'react';
import { ModuleContainer, ModuleContent, ModuleHeader } from '@/components/layout/module';
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
    <ModuleContainer themeColor="calendar">
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

      {/* Universal sheet management */}
      {isSheetOpen && sheetItem && (
        <Sheet open={isSheetOpen} onOpenChange={(open) => !open && closeSheet()}>
          <EventSheetContent 
            event={sheetItem} 
            onOpenChange={closeSheet}
          />
        </Sheet>
      )}
    </ModuleContainer>
  );
}
export default CalendarPage;