
import { useState, useEffect } from "react";
import CommunityCalendar from "@/components/CommunityCalendar";
import GodModeSelector from "@/components/neighbors/GodModeSelector";
import { useNeighborhood } from "@/contexts/neighborhood";

const CalendarPage = () => {
  // Get neighborhood context - removed isCoreContributor reference
  const { currentNeighborhood } = useNeighborhood();
  
  useEffect(() => {
    const handleHighlightItem = (e: CustomEvent) => {
      if (e.detail.type === 'event') {
        // Dispatch a custom event for the calendar component
        const event = new CustomEvent('navigateToEvent', {
          detail: {
            eventId: e.detail.id
          }
        });
        window.dispatchEvent(event);
      }
    };

    window.addEventListener('highlightItem', handleHighlightItem as EventListener);
    return () => {
      window.removeEventListener('highlightItem', handleHighlightItem as EventListener);
    };
  }, []);

  return (
    <div className="min-h-full w-full bg-gradient-to-b from-[#F2FCE2] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Community Calendar</h2>
            
            {/* GodModeSelector has been disabled and returns null */}
            <GodModeSelector />
          </div>
          
          <div className="bg-white rounded-lg p-4 mt-2 mb-6 shadow-md">
            <p className="text-gray-700 text-sm">
              Stay connected with your community through local events. View upcoming gatherings, 
              create new events, and join your neighbors in building stronger connections.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-lg">
            <CommunityCalendar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
