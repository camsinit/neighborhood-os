
import React, { useEffect } from 'react';
import { ModuleLayout } from '@/components/layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSearchParams } from 'react-router-dom'; 
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useHighlightedItem } from '@/hooks/useHighlightedItem';
import { highlightItem } from '@/utils/highlight';
import CommunityCalendar from '@/components/CommunityCalendar';
import AddEventDialog from '@/components/AddEventDialog';
import { useState } from 'react';

/**
 * CalendarPage component displays the community calendar with various views
 * 
 * This component provides:
 * - Month, week, and agenda views of community events
 * - Deep linking to specific events
 * - Add event functionality
 */
function CalendarPage() {
  // Get URL parameters and highlighted events
  const [searchParams] = useSearchParams();
  const view = searchParams.get('view') || 'month';
  const highlightedEvent = useHighlightedItem('event');
  
  // State for the Add Event dialog
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);

  // Effect to handle deep linking to specific events
  useEffect(() => {
    const eventId = searchParams.get('eventId');
    if (eventId) {
      highlightItem('event', eventId);
    }
  }, [searchParams]);

  // Handle event addition
  const handleAddEvent = () => {
    // Simply close the dialog after adding an event
    setIsAddEventOpen(false);
  };

  return (
    <ModuleLayout
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
    >
      <Tabs defaultValue={view} className="w-full">
        <div className="flex justify-between items-center mb-6">
          <TabsList>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="agenda">Agenda</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="month" className="mt-0">
          <CommunityCalendar view="month" />
        </TabsContent>
        
        <TabsContent value="week" className="mt-0">
          <CommunityCalendar view="week" />
        </TabsContent>
        
        <TabsContent value="agenda" className="mt-0">
          <CommunityCalendar view="agenda" />
        </TabsContent>
      </Tabs>
      
      {/* Add Event Dialog */}
      <AddEventDialog
        open={isAddEventOpen}
        onOpenChange={setIsAddEventOpen}
        onAddEvent={handleAddEvent}
      />
    </ModuleLayout>
  );
}

export default CalendarPage;
