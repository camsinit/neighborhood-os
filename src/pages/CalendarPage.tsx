import { useState, useEffect } from "react";
import CommunityCalendar from "@/components/CommunityCalendar";
import GodModeSelector from "@/components/neighbors/GodModeSelector";
import { useNeighborhood } from "@/contexts/neighborhood";
import GlowingDescriptionBox from "@/components/ui/glowing-description-box";
import { createHighlightListener } from "@/utils/highlightNavigation";

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
    <div className="page-gradient calendar-gradient">
      <div className="relative z-10">
        <div className="min-h-full w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Community Calendar</h2>
                <GodModeSelector />
              </div>
              
              <div className="mt-4 bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-100 shadow-sm">
                <p className="text-gray-700 text-sm">
                  Stay connected with your community through local events. View upcoming gatherings, 
                  create new events, and join your neighbors in building stronger connections.
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg mt-6">
                <CommunityCalendar />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CalendarPage;
