
import { useState, useEffect } from "react";
import CommunityCalendar from "@/components/CommunityCalendar";
import GodModeSelector from "@/components/neighbors/GodModeSelector";
import { useNeighborhood } from "@/contexts/neighborhood";
import GlowingDescriptionBox from "@/components/ui/glowing-description-box";

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
    // Wrapper div with relative positioning for the gradient
    <div className="relative min-h-screen">
      {/* 
        Background gradient using the calendar-color CSS variable
        The gradient starts with the section color at reduced opacity at the top
        and fades to completely transparent toward the bottom
      */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{ 
          background: `linear-gradient(to bottom, hsla(var(--calendar-color), 0.15) 0%, hsla(var(--calendar-color), 0) 60%)`,
          zIndex: 0 
        }}
        aria-hidden="true"
      />
      
      {/* Content div placed above the gradient background */}
      <div className="relative z-10">
        <div className="min-h-full w-full bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Community Calendar</h2>
                
                {/* GodModeSelector has been disabled and returns null */}
                <GodModeSelector />
              </div>
              
              {/* Using our standardized GlowingDescriptionBox with consistent margins */}
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
