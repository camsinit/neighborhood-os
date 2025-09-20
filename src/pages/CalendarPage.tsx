import React, { useState, useEffect } from 'react';
import ModuleLayout from '@/components/layout/ModuleLayout';
import { usePageSheetController } from '@/hooks/usePageSheetController';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import EventSheetContent from '@/components/event/EventSheetContent';
import CommunityCalendar from '@/components/CommunityCalendar';
import EventForm from '@/components/events/EventForm';
import { useEvents } from '@/utils/queries/useEvents';
import { moduleThemeColors } from '@/theme/moduleTheme';
import { useSearchParams } from 'react-router-dom';
import { useNeighborhood } from '@/contexts/neighborhood';
import { supabase } from '@/integrations/supabase/client';

/**
 * CalendarPage Component
 * 
 * Displays the community calendar with universal sheet management
 * and supports highlighting events from deep links.
 */
function CalendarPage() {
  const { data: events } = useEvents();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentNeighborhood } = useNeighborhood();
  
  // Universal page controller for sheet management (viewing existing events)
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
  
  // State management for add event sheet
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [initialEventDate, setInitialEventDate] = useState<Date | null>(null);
  const [preSelectedGroupId, setPreSelectedGroupId] = useState<string | undefined>(undefined);
  const [neighborhoodTimezone, setNeighborhoodTimezone] = useState<string>('America/Los_Angeles');
  
  // Handle URL parameters to auto-open add event sheet
  useEffect(() => {
    const action = searchParams.get('action');
    const dateParam = searchParams.get('date');
    const groupIdParam = searchParams.get('groupId');
    
    if (action === 'add' || action === 'add_event') {
      // Capture the group ID before clearing URL params
      if (groupIdParam) {
        setPreSelectedGroupId(groupIdParam);
      }
      
      // Set initial date if provided
      if (dateParam) {
        try {
          const targetDate = new Date(dateParam);
          if (!isNaN(targetDate.getTime())) {
            setInitialEventDate(targetDate);
          }
        } catch (error) {
          console.error('Invalid date in URL parameter:', dateParam);
        }
      }
      setIsAddEventOpen(true);
      setSearchParams({}); // Clear URL params
    }
  }, [searchParams, setSearchParams]);
  
  // Fetch neighborhood timezone when add event sheet opens
  useEffect(() => {
    const fetchNeighborhoodTimezone = async () => {
      if (currentNeighborhood?.id) {
        const { data, error } = await supabase
          .from('neighborhoods')
          .select('timezone')
          .eq('id', currentNeighborhood.id)
          .single();
          
        if (data && !error) {
          setNeighborhoodTimezone(data.timezone || 'America/Los_Angeles');
          console.log(`[CalendarPage] Using timezone: ${data.timezone || 'America/Los_Angeles'}`);
        }
      }
    };
    
    if (isAddEventOpen && currentNeighborhood) {
      fetchNeighborhoodTimezone();
    }
  }, [isAddEventOpen, currentNeighborhood]);
  
  // Handler for opening add event sheet
  const handleAddEvent = (date?: Date) => {
    setInitialEventDate(date || null);
    setIsAddEventOpen(true);
  };
  
  const closeAddEventSheet = () => {
    setIsAddEventOpen(false);
    setInitialEventDate(null);
    setPreSelectedGroupId(undefined); // Clear pre-selected group when closing
  };
  
  // Handler for when event is successfully added
  const handleEventAdded = async () => {
    // Refresh events data
    await events;
    closeAddEventSheet();
  };
  return (
    <>
      <ModuleLayout
        title="Community Calendar"
        description="The neighborhood calendar is the perfect place for you to share any gathering or happening that you'd like neighbors to know about."
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
          <CommunityCalendar onAddEvent={handleAddEvent} />
        </div>
      </ModuleLayout>

      {/* Sheet for viewing existing events */}
      {isSheetOpen && sheetItem && (
        <Sheet open={isSheetOpen} onOpenChange={(open) => !open && closeSheet()}>
          <EventSheetContent 
            event={sheetItem} 
            onOpenChange={closeSheet}
          />
        </Sheet>
      )}
      
      {/* Sheet for adding new events */}
      {isAddEventOpen && (
        <Sheet open={isAddEventOpen} onOpenChange={(open) => !open && closeAddEventSheet()}>
          <SheetContent className="sm:max-w-md overflow-y-auto">
            <SheetHeader className="mb-4">
              <SheetTitle className="text-xl font-bold">
                Add New Event
              </SheetTitle>
              <div className="text-sm text-gray-500">
                All times are in {neighborhoodTimezone.replace('_', ' ')} timezone
              </div>
            </SheetHeader>
            <EventForm 
              onClose={closeAddEventSheet}
              onAddEvent={handleEventAdded}
              initialValues={{
                date: initialEventDate ? initialEventDate.toISOString().split('T')[0] : '',
                time: initialEventDate ? initialEventDate.toTimeString().slice(0, 5) : '',
                groupId: preSelectedGroupId // Use captured group ID from URL
              }}
              neighborhoodTimezone={neighborhoodTimezone}
            />
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}
export default CalendarPage;