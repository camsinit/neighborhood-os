
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Event } from "@/types/calendar";
import { format, parseISO } from "date-fns";
import { LocateIcon, MapPinIcon, ClockIcon, UserIcon } from "lucide-react";
import EventSheetContent from "./EventSheetContent";

interface EventHoverCardProps {
  event: Event;
  children: React.ReactNode;
}

/**
 * EventHoverCard component displays a hover card with event details
 * 
 * @param event - The event data to display
 * @param children - The trigger element that activates the hover card
 */
const EventHoverCard = ({ event, children }: EventHoverCardProps) => {
  // Parse the event time
  const eventDate = parseISO(event.time);
  
  // Calculate the specific time for display
  const formattedTime = format(eventDate, "h:mm a");
  const formattedDate = format(eventDate, "EEEE, MMMM d, yyyy");
  
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent 
        className="w-80" 
        side="left" 
        align="start"
        sideOffset={5}
        alignOffset={5}
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
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default EventHoverCard;
