
import React, { useEffect, useState } from 'react';
import { ModuleLayout } from '@/components/layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSearchParams, useNavigate } from 'react-router-dom'; 
import { useHighlightedItem } from '@/hooks/useHighlightedItem';
import { highlightItem } from '@/utils/highlight';
import CommunityCalendar from '@/components/CommunityCalendar';
import AddEventDialog from '@/components/AddEventDialog';
import { motion } from 'framer-motion';

/**
 * CalendarPage Component
 * 
 * This is the main calendar page that displays events in the community.
 * It supports different view modes (month, week, agenda) and event highlighting.
 */
function CalendarPage() {
  // Get view from URL parameters or default to month
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get('view') || 'month';
  const navigate = useNavigate();
  
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

  // Handle tab change
  const handleViewChange = (value: string) => {
    // Update the URL parameters when the view changes
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('view', value);
      return newParams;
    });
  };

  // Page transition animation
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  };

  return (
    <ModuleLayout
      title="Community Calendar"
      description="Plan, discover, and join upcoming events in your neighborhood"
      themeColor="calendar"
    >
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={{ duration: 0.3 }}
      >
        <Tabs 
          defaultValue={view} 
          value={view} 
          onValueChange={handleViewChange}
          className="w-full"
        >
          <div className="hidden">
            <TabsList className="bg-slate-100 p-1">
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
      </motion.div>
    </ModuleLayout>
  );
}

export default CalendarPage;
