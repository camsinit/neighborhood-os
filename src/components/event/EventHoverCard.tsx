
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Event } from "@/types/localTypes"; 
import { format, parseISO } from "date-fns";
import { ClockIcon, MapPinIcon, UserIcon, Pencil, Calendar } from "lucide-react";
import RSVPButton from "./RSVPButton";
import { formatInNeighborhoodTimezone } from "@/utils/dateUtils";
import { useUser } from "@supabase/auth-helpers-react";
import EditEventDialog from "./EditEventDialog";
import { motion } from "framer-motion";

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
        className="w-80 z-[100] border border-gray-200 shadow-lg bg-white/95 backdrop-blur-sm p-4"
        sideOffset={5}
        alignOffset={5}
        align="start"
      >
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-gray-800">{event.title}</h4>
          
          {/* Date and Time */}
          <div className="flex items-center gap-2.5 text-gray-600">
            <div className="bg-blue-50 p-1.5 rounded-full">
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
            <span>{formattedDate}</span>
          </div>
          
          {/* Time */}
          <div className="flex items-center gap-2.5 text-gray-600">
            <div className="bg-blue-50 p-1.5 rounded-full">
              <ClockIcon className="h-4 w-4 text-blue-600" />
            </div>
            <span>{formattedTime}</span>
          </div>
          
          {/* Location */}
          <div className="flex items-center gap-2.5 text-gray-600">
            <div className="bg-blue-50 p-1.5 rounded-full">
              <MapPinIcon className="h-4 w-4 text-blue-600" />
            </div>
            <span>{event.location}</span>
          </div>
          
          {/* Host */}
          <div className="flex items-center gap-2.5 text-gray-600">
            <div className="bg-blue-50 p-1.5 rounded-full">
              <UserIcon className="h-4 w-4 text-blue-600" />
            </div>
            <span>Hosted by {event.profiles?.display_name || "Unknown"}</span>
          </div>
          
          {/* Description preview */}
          {event.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mt-2 border-t border-gray-100 pt-2">
              {event.description}
            </p>
          )}
          
          {/* Conditionally show Edit button or RSVP button based on whether user is the host */}
          <div className="pt-2">
            {isHost ? (
              <EditEventDialog event={event}>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                  Edit Event
                </motion.button>
              </EditEventDialog>
            ) : (
              <RSVPButton 
                eventId={event.id} 
                neighborhoodId={event.neighborhood_id}
                className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white" 
              />
            )}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default EventHoverCard;
