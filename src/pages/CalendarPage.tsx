
import React, { useEffect } from 'react';
import { ModuleContainer, ModuleContent, ModuleHeader } from '@/components/layout/module';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSearchParams } from 'react-router-dom'; 
import CalendarEvents from '@/components/calendar/CalendarEvents';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useHighlightedItem } from '@/hooks/useHighlightedItem';
import { highlightItem } from '@/utils/highlight';
import AddEventDialog from '@/components/AddEventDialog';

/**
 * CalendarPage Component
 * 
 * This page displays the community calendar events.
 * Uses the module system for consistent layout and theming.
 */
function CalendarPage() {
  // Get URL parameters and manage highlighting
  const [searchParams] = useSearchParams();
  const view = searchParams.get('view') || 'month';
  const highlightedEvent = useHighlightedItem('event');
  const [isAddEventOpen, setIsAddEventOpen] = React.useState(false);

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
        <Tabs defaultValue={view} className="w-full">
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="agenda">Agenda</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="month" className="mt-0">
            <CalendarEvents view="month" />
          </TabsContent>
          
          <TabsContent value="week" className="mt-0">
            <CalendarEvents view="week" />
          </TabsContent>
          
          <TabsContent value="agenda" className="mt-0">
            <CalendarEvents view="agenda" />
          </TabsContent>
        </Tabs>
      </ModuleContent>
      
      {/* Add Event Dialog */}
      <AddEventDialog 
        open={isAddEventOpen} 
        onOpenChange={setIsAddEventOpen} 
        onAddEvent={() => {}}
      />
    </ModuleContainer>
  );
}

export default CalendarPage;
