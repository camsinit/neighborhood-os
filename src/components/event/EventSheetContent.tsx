
import { Clock, MapPin, User } from "lucide-react";
import { parseISO } from "date-fns";
import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import RSVPButton from "./RSVPButton";
import { Event } from "@/types/localTypes";
import { formatInNeighborhoodTimezone } from "@/utils/dateUtils";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface EventSheetContentProps {
  event: Event;
  EditButton?: React.FC;
}

/**
 * EventSheetContent displays detailed information about an event in a slide-out sheet
 * 
 * This component shows:
 * - Event title and description
 * - Date, time, and location details
 * - Host information
 * - RSVP button for users to indicate attendance
 * - Edit button for event hosts
 * 
 * @param event - The event data to display
 * @param EditButton - Optional component for editing the event (shown to hosts only)
 */
const EventSheetContent = ({ event, EditButton }: EventSheetContentProps) => {
  const [neighborhoodTimezone, setNeighborhoodTimezone] = useState<string>("America/Los_Angeles");
  
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
          setNeighborhoodTimezone(data.timezone || "America/Los_Angeles");
        }
      }
    };
    
    fetchNeighborhoodTimezone();
  }, [event.neighborhood_id]);
  
  // Format the event date in the neighborhood timezone
  const formattedDate = formatInNeighborhoodTimezone(
    parseISO(event.time),
    "EEEE, MMMM d, yyyy 'at' h:mm a",
    neighborhoodTimezone
  );
  
  return (
    <SheetContent className="overflow-y-auto">
      <SheetHeader>
        <div className="flex justify-between items-center">
          <SheetTitle className="text-xl font-bold pr-8">{event.title}</SheetTitle>
          {EditButton && <EditButton />}
        </div>
        <SheetDescription>
          {/* Date and Time */}
          <div className="flex items-center gap-2 text-gray-600 mt-4">
            <Clock className="h-4 w-4" />
            <span>{formattedDate}</span>
          </div>
          
          {/* Location */}
          <div className="flex items-center gap-2 text-gray-600 mt-2">
            <MapPin className="h-4 w-4" />
            <span>{event.location}</span>
          </div>
          
          {/* Host */}
          <div className="flex items-center gap-2 text-gray-600 mt-2">
            <User className="h-4 w-4" />
            <span>Hosted by {event.profiles?.display_name || "Unknown"}</span>
          </div>
        </SheetDescription>
      </SheetHeader>
      
      {/* Description */}
      <div className="mt-6">
        <h3 className="font-medium mb-2">About this event</h3>
        <p className="text-gray-700 whitespace-pre-wrap">
          {event.description || "No description provided."}
        </p>
      </div>
      
      {/* RSVP Button */}
      <div className="mt-6">
        <RSVPButton 
          eventId={event.id} 
          neighborhoodId={event.neighborhood_id} 
          className="w-full hover:bg-blue-500" 
        />
      </div>
    </SheetContent>
  );
};

export default EventSheetContent;
