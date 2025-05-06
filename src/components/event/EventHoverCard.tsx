
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Event } from "@/types/localTypes"; // Changed from calendar to localTypes
import { format, parseISO } from "date-fns";
import { ClockIcon, MapPinIcon, UserIcon, Pencil } from "lucide-react";
import RSVPButton from "./RSVPButton";
import { formatInNeighborhoodTimezone } from "@/utils/dateUtils";
import { useUser } from "@supabase/auth-helpers-react";
import EditEventDialog from "./EditEventDialog";

interface EventHoverCardProps {
  event: Event;
  children: React.ReactNode;
}

/**
 * EventHoverCard component displays a hover card with event details
 * 
 * This component:
 * - Shows detailed event information when hovering over an event in the calendar
 * - Shows either an RSVP button or Edit button depending on if the user is the host
 * - Uses a high z-index to ensure the popover appears above the sidebar
 * 
 * @param event - The event data to display
 * @param children - The trigger element that activates the hover card
 */
const EventHoverCard = ({ event, children }: EventHoverCardProps) => {
  // Get the current user to check if they're the host
  const user = useUser();
  const isHost = user && user.id === event.host_id;
  
  // Parse the event time
  const eventDate = parseISO(event.time);
  
  // Calculate the specific time for display - now using timezone support
  const formattedTime = formatInNeighborhoodTimezone(eventDate, "h:mm a", "America/Los_Angeles");
  const formattedDate = formatInNeighborhoodTimezone(eventDate, "EEEE, MMMM d, yyyy", "America/Los_Angeles");
  
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent 
        className="w-80 z-[100]" // Added a high z-index to ensure it shows above the sidebar
        sideOffset={5}
        alignOffset={5}
        align="start"
      >
        <div className="space-y-2">
          <h4 className="text-lg font-medium">{event.title}</h4>
          
          {/* Date and Time */}
          <div className="flex items-center gap-2 text-gray-600">
            <ClockIcon className="h-4 w-4" />
            <span>{formattedDate} at {formattedTime}</span>
          </div>
          
          {/* Location */}
          <div className="flex items-center gap-2 text-gray-600">
            <MapPinIcon className="h-4 w-4" />
            <span>{event.location}</span>
          </div>
          
          {/* Host */}
          <div className="flex items-center gap-2 text-gray-600">
            <UserIcon className="h-4 w-4" />
            <span>Hosted by {event.profiles?.display_name || "Unknown"}</span>
          </div>
          
          {/* Description preview */}
          {event.description && (
            <p className="text-sm text-gray-500 line-clamp-3">
              {event.description}
            </p>
          )}
          
          {/* Conditionally show Edit button or RSVP button based on whether user is the host */}
          {isHost ? (
            <EditEventDialog event={event}>
              <button className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors">
                <Pencil className="h-4 w-4" />
                Edit Event
              </button>
            </EditEventDialog>
          ) : (
            <RSVPButton 
              eventId={event.id} 
              neighborhoodId={event.neighborhood_id}
              className="mt-2 w-full bg-blue-500 hover:bg-blue-600" 
            />
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default EventHoverCard;
