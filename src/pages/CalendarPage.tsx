
import React, { useEffect, useState } from 'react';
import { ModuleLayout } from '@/components/layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSearchParams } from 'react-router-dom'; 
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useHighlightedItem } from '@/hooks/useHighlightedItem';
import { highlightItem } from '@/utils/highlight';
import CommunityCalendar from '@/components/CommunityCalendar';
import AddEventDialog from '@/components/AddEventDialog';

/**
 * CalendarPage Component
 * 
 * This is the main calendar page that displays events in the community.
 * It supports different view modes (month, week, agenda) and event highlighting.
 */
function CalendarPage() {
  // Get view from URL parameters or default to month
  const [searchParams] = useSearchParams();
  const view = searchParams.get('view') || 'month';
  
  // State for highlighted events and add event dialog
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
    <ModuleLayout
      title="Community Calendar"
      description="Upcoming events in your neighborhood"
      themeColor="calendar"
      actions={
        <Button 
          onClick={() => setIsAddEventOpen(true)} 
          className="whitespace-nowrap flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white"
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
        
        <TabsContent value="month" className="mt-0 transition-opacity duration-200 ease-in-out">
          <CommunityCalendar initialView="month" highlightedId={highlightedEvent.id} />
        </TabsContent>
        
        <TabsContent value="week" className="mt-0 transition-opacity duration-200 ease-in-out">
          <CommunityCalendar initialView="week" highlightedId={highlightedEvent.id} />
        </TabsContent>
        
        <TabsContent value="agenda" className="mt-0 transition-opacity duration-200 ease-in-out">
          <CommunityCalendar initialView="agenda" highlightedId={highlightedEvent.id} />
        </TabsContent>
      </Tabs>
      
      {/* Add Event Dialog */}
      <AddEventDialog
        open={isAddEventOpen}
        onOpenChange={setIsAddEventOpen}
        onAddEvent={() => {}}
      />
    </ModuleLayout>
  );
}

export default CalendarPage;
