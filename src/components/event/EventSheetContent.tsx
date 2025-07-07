
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import ShareButton from "@/components/ui/share-button";
import EditEventDialog from "./EditEventDialog";

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
      <SheetHeader className="mb-4">
        <SheetTitle className="text-xl font-bold flex justify-between items-start">
          <span>{event.title}</span>
          <div className="flex items-center gap-2">
            <ShareButton
              contentType="events"
              contentId={event.id}
              neighborhoodId={event.neighborhood_id}
              size="sm"
              variant="ghost"
            />
            {(EditButton && <EditButton onSheetClose={handleSheetClose} />) || 
             (isHost && (
               <EditEventDialog 
                 event={event} 
                 onSheetClose={handleSheetClose}
               >
                 <div className="flex items-center gap-2 text-foreground hover:text-primary cursor-pointer">
                   <span className="text-sm">Edit</span>
                 </div>
               </EditEventDialog>
             ))}
          </div>
        </SheetTitle>
      </SheetHeader>

      <div className="space-y-6">
        {/* Event details using our new components */}
        <EventDateTime 
          date={event.time} 
          neighborhoodTimezone={neighborhoodTimezone} 
        />
        
        <EventLocation location={event.location} />
        
        <EventHost 
          hostName={event.profiles?.display_name} 
          isCurrentUserHost={isHost} 
        />
        
        <EventDescription description={event.description} />
        
        {/* RSVP button */}
        <EventRSVPButton 
          eventId={event.id} 
          isHost={isHost}
          neighborhoodId={event.neighborhood_id}
        />
        
        {/* Attendees section */}
        <EventAttendeesList eventId={event.id} />
      </div>
    </SheetContent>
  );
};

export default EventSheetContent;
