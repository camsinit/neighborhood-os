import React from 'react';
import ModuleLayout from '@/components/layout/ModuleLayout';
import { usePageSheetController } from '@/hooks/usePageSheetController';
import { Sheet } from '@/components/ui/sheet';
import EventSheetContent from '@/components/event/EventSheetContent';
import CommunityCalendar from '@/components/CommunityCalendar';
import { useEvents } from '@/utils/queries/useEvents';
import { moduleThemeColors } from '@/theme/moduleTheme';

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
        <div 
          className="backdrop-blur-sm rounded-lg p-6 shadow-lg border"
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderColor: moduleThemeColors.calendar.primary + '40',
            boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 0 0 1px ${moduleThemeColors.calendar.primary}10`
          }}
        >
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