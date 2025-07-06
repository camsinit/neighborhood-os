
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import ShareButton from "@/components/ui/share-button";

// Import our new component modules
import EventDateTime from "./details/EventDateTime";
import EventLocation from "./details/EventLocation";
import EventHost from "./details/EventHost";
import EventDescription from "./details/EventDescription";
import EventRSVPButton from "./details/EventRSVPButton";
import EventAttendeesList from "./details/EventAttendeesList";

/**
 * EventSheetContent component displays the full details of an event
 * in a slide-out sheet
 * 
 * @param event - The event data to display
 * @param EditButton - Optional edit button component
 * @param onOpenChange - Function to control the sheet's open state
 */
const EventSheetContent = ({ 
  event, 
  EditButton,
  onOpenChange
}: { 
  event: any;
  EditButton?: React.FC<{onSheetClose?: () => void}>;
  onOpenChange?: (open: boolean) => void;
}) => {
  // Get current authenticated user
  const user = useUser();
  
  // State for neighborhood timezone
  const [neighborhoodTimezone, setNeighborhoodTimezone] = useState<string>('America/Los_Angeles');
  
  // Function to close the sheet
  const handleSheetClose = () => {
    if (onOpenChange) {
      onOpenChange(false);
    }
  };
  
  // Check if current user is the event host
  const isHost = user?.id === event.host_id;

  // Get the neighborhood timezone
  useEffect(() => {
    const fetchNeighborhoodTimezone = async () => {
      if (event.neighborhood_id) {
        const { data, error } = await supabase
          .from('neighborhoods')
          .select('timezone')
          .eq('id', event.neighborhood_id)
          .single();
          
        if (!error && data) {
          setNeighborhoodTimezone(data.timezone || 'America/Los_Angeles');
        }
      }
    };
    fetchNeighborhoodTimezone();
  }, [event.neighborhood_id]);

  return (
    <SheetContent className="sm:max-w-md overflow-y-auto">
      {/* Modern header with gradient background */}
      <div className="relative -m-6 mb-0 p-6 bg-gradient-to-br from-hsl(var(--calendar-color)) to-hsl(var(--calendar-color)/0.8) text-white rounded-t-lg">
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-2xl font-bold leading-tight">{event.title}</h1>
          <div className="flex items-center gap-2 opacity-90">
            <ShareButton
              contentType="events"
              contentId={event.id}
              neighborhoodId={event.neighborhood_id}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20"
            />
            {EditButton && <EditButton onSheetClose={handleSheetClose} />}
          </div>
        </div>
        
        {/* Date and time prominently displayed in header */}
        <EventDateTime 
          date={event.time} 
          neighborhoodTimezone={neighborhoodTimezone}
          isHeaderVersion={true}
        />
      </div>

      <div className="space-y-4 pt-6">
        {/* Key event details in a compact card */}
        <div className="bg-hsl(var(--calendar-light)) rounded-xl p-4 space-y-3">
          <EventLocation location={event.location} />
          <EventHost 
            hostName={event.profiles?.display_name} 
            isCurrentUserHost={isHost} 
          />
        </div>
        
        {/* Description section */}
        <EventDescription description={event.description} />
        
        {/* RSVP button - more prominent */}
        <div className="py-2">
          <EventRSVPButton 
            eventId={event.id} 
            isHost={isHost}
            neighborhoodId={event.neighborhood_id}
          />
        </div>
        
        {/* Attendees section with better styling */}
        <EventAttendeesList eventId={event.id} />
      </div>
    </SheetContent>
  );
};

export default EventSheetContent;
