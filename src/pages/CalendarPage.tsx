import { useState, useEffect } from "react";
import CommunityCalendar from "@/components/CommunityCalendar";
import GodModeSelector from "@/components/neighbors/GodModeSelector";
import { useNeighborhood } from "@/contexts/neighborhood";
import GlowingDescriptionBox from "@/components/ui/glowing-description-box";
import { createHighlightListener } from "@/utils/highlightNavigation";

const CalendarPage = () => {
  const { currentNeighborhood } = useNeighborhood();
  
  useEffect(() => {
    const handleHighlightItem = createHighlightListener("event");

    window.addEventListener('highlightItem', handleHighlightItem as EventListener);
    
    return () => {
      window.removeEventListener('highlightItem', handleHighlightItem as EventListener);
    };
  }, []);

  return (
    <div className="relative min-h-screen">
      <div 
        className="absolute inset-0 pointer-events-none animate-gradient-shift"
        style={{ 
          background: `linear-gradient(60deg, 
            hsla(var(--calendar-color), 0.03) 0%,
            hsla(var(--calendar-color), 0.08) 50%,
            hsla(var(--calendar-color), 0.03) 100%
          )`,
          backgroundSize: '400% 400%',
          zIndex: 0
        }}
        aria-hidden="true"
      />
      
      <div className="relative z-10">
        <div className="min-h-full w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Community Calendar</h2>
                <GodModeSelector />
              </div>
              
              <GlowingDescriptionBox colorClass="calendar-color">
                <p className="text-gray-700 text-sm">
                  Stay connected with your community through local events. View upcoming gatherings, 
                  create new events, and join your neighbors in building stronger connections.
                </p>
              </GlowingDescriptionBox>

              <div className="bg-white rounded-lg p-6 shadow-lg">
                <CommunityCalendar />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
