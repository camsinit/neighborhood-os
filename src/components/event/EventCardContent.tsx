
/**
 * EventCardContent component
 * 
 * This component:
 * - Displays event details in a compact card format
 * - Shows different styling based on RSVP status
 * - Shows popover with RSVP information when clicked
 */
import { Clock, Users, Pencil } from "lucide-react";
import { Event } from "@/types/localTypes";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import RSVPList from "../event/RSVPList";
import { formatInNeighborhoodTimezone } from "@/utils/dateUtils";
import { parseISO } from "date-fns";
import EditEventDialog from "./EditEventDialog"; // Import the edit dialog component
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"; // Import avatar component

interface EventCardContentProps {
  event: Event;
  isHost: boolean;
  isRsvped: boolean;
  rsvpCount: number;
  displayTime: string;
  isHighlighted?: boolean;
}
const EventCardContent = ({
  event,
  isHost,
  isRsvped,
  rsvpCount,
  displayTime,
  isHighlighted = false
}: EventCardContentProps) => {
  // Determine event color based on RSVP status
  const getEventColor = () => {
    if (isRsvped) {
      return isHost ? "border-blue-300 bg-blue-50 shadow-sm" : "border-green-300 bg-green-50 shadow-sm";
    }
    return "border-gray-200 bg-white shadow-sm";
  };

  // Format date for the popover
  const formattedDate = event.time ? formatInNeighborhoodTimezone(parseISO(event.time), 'EEE, MMM d', 'America/Los_Angeles') : '';
  return <Popover>
      <PopoverTrigger asChild>
        <motion.div data-event-id={event.id} className={cn("rounded-md px-2 py-1.5 mb-1.5 text-xs cursor-pointer hover:bg-opacity-80 border-l-4", getEventColor(), isHighlighted ? "ring-2 ring-blue-400" : "", isHost ? "border-l-blue-500" : isRsvped ? "border-l-green-500" : "border-l-gray-300")} animate={isHighlighted ? {
        scale: [1, 1.05, 1]
      } : {}} transition={{
        duration: 0.5
      }}>      
          <div className="font-medium line-clamp-2 text-gray-800">{event.title}</div>
          <div className="flex items-center gap-1 text-gray-600 mt-1">
            <Clock className="h-3 w-3" />
            <span className="truncate">{displayTime}</span>
          </div>
          {rsvpCount > 0}
        </motion.div>
      </PopoverTrigger>
      
      {/* Popover content showing RSVPs with stacked avatars */}
      <PopoverContent className="w-72 p-4 shadow-md border-light" sideOffset={5}>
        <div className="space-y-3">
          {/* Host avatar and event title in a flex row */}
          <div className="flex items-center gap-2">
            {/* Host avatar - displays profile image or fallback with initials */}
            <Avatar className="h-8 w-8">
              <AvatarImage src={event.profiles?.avatar_url || ''} alt={event.profiles?.display_name || 'Host'} />
              <AvatarFallback>
                {(event.profiles?.display_name || 'H').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            {/* Event title */}
            <h3 className="font-medium text-base">{event.title}</h3>
          </div>
          
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <Clock className="h-3.5 w-3.5" />
            <span>{displayTime}</span>
          </div>
          
          {event.location && <div className="text-sm text-gray-500 mb-2">
              {event.location}
            </div>}
          
          {/* RSVPs section with stacked avatars */}
          <RSVPList eventId={event.id} className="mt-2" showEmptyState={false} />
          
          {/* Edit button for hosts */}
          {isHost && <EditEventDialog event={event}>
              <div className="flex items-center gap-2 text-blue-600 mt-2 cursor-pointer hover:text-blue-700">
                <Pencil className="h-4 w-4" />
                <span className="text-sm">Edit event</span>
              </div>
            </EditEventDialog>}
        </div>
      </PopoverContent>
    </Popover>;
};
export default EventCardContent;
