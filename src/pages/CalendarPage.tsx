
import { useEffect } from "react";
import CommunityCalendar from "@/components/CommunityCalendar";
import GodModeSelector from "@/components/neighbors/GodModeSelector";
import { useNeighborhood } from "@/contexts/neighborhood";
import { createHighlightListener } from "@/utils/highlightNavigation";
import ModuleLayout from "@/components/layout/ModuleLayout";
// Removed LoggingControls import as it's now in DiagnosticsPanel

/**
 * CalendarPage component
 * 
 * This page displays community events and allows users to:
 * - View events in a calendar layout
 * - Create new events
 * - RSVP to existing events
 */
const CalendarPage = () => {
  // Get neighborhood context 
  const { currentNeighborhood } = useNeighborhood();
  
  useEffect(() => {
    // Create a highlight listener specifically for calendar events
    const handleHighlightItem = createHighlightListener("event");

    // Add the event listener
    window.addEventListener('highlightItem', handleHighlightItem as EventListener);
    
    // Clean up the listener when component unmounts
    return () => {
      window.removeEventListener('highlightItem', handleHighlightItem as EventListener);
    };
  }, []);

  return (
    <ModuleLayout
      title="Community Calendar"
      themeColor="calendar"
      description="Stay connected with your community through local events. View upcoming gatherings, create new events, and join your neighbors in building stronger connections."
    >
      <div className="flex justify-end mb-4">
        <GodModeSelector />
      </div>
      <CommunityCalendar />
      {/* Removed LoggingControls component from here */}
    </ModuleLayout>
  );
}

export default CalendarPage;
