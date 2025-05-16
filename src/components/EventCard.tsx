
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "./ui/button";
import { Pencil, Clock, Users, Calendar, MapPin } from "lucide-react";
import { format, parseISO } from "date-fns";
import EditEventDialog from "./event/EditEventDialog";
import { useUser } from "@supabase/auth-helpers-react";
import EventHoverCard from "./event/EventHoverCard";
import EventSheetContent from "./event/EventSheetContent";
import { EventCardProps } from "./event/types";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatInNeighborhoodTimezone } from "@/utils/dateUtils";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * EventCard component displays an event in the calendar
 * 
 * This component:
 * - Shows a compact view of the event in the calendar grid
 * - Changes color based on RSVP status
 * - Shows event details on hover
 * - Opens a full event sheet when clicked
 * - Shows edit controls for event hosts
 * - Supports highlighted state for focus
 * - Supports list view for agenda display
 * 
 * @param event - The event data to display
 * @param onDelete - Callback function when event is deleted
 * @param isHighlighted - Whether this event should be highlighted
 * @param listView - Whether to display in list view (for agenda)
 */
const EventCard = ({
  event,
  onDelete,
  isHighlighted = false,
  listView = false
}: EventCardProps & { isHighlighted?: boolean, listView?: boolean }) => {
  // Get current user and set up state
  const user = useUser();
  const [isRsvped, setIsRsvped] = useState(false);
  const [rsvpCount, setRsvpCount] = useState(0);
  const [neighborhoodTimezone, setNeighborhoodTimezone] = useState<string>("America/Los_Angeles");
  // Add state to track hover state for showing edit button
  const [isHovering, setIsHovering] = useState(false);
  // Add state to control the Sheet open state
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Format display time using the neighborhood timezone
  const displayTime = formatInNeighborhoodTimezone(parseISO(event.time), 'h:mm a', neighborhoodTimezone);
  const displayDate = formatInNeighborhoodTimezone(parseISO(event.time), 'EEE, MMM d', neighborhoodTimezone);

  // Check if current user is the host of the event
  const isHost = user?.id === event.host_id;

  // Get the neighborhood timezone
  useEffect(() => {
    const fetchNeighborhoodTimezone = async () => {
      if (event.neighborhood_id) {
        const {
          data,
          error
        } = await supabase.from('neighborhoods').select('timezone').eq('id', event.neighborhood_id).single();
        if (!error && data) {
          setNeighborhoodTimezone(data.timezone || "America/Los_Angeles");
        }
      }
    };
    fetchNeighborhoodTimezone();
  }, [event.neighborhood_id]);

  // Check if the current user has RSVP'd to this event and get the count
  useEffect(() => {
    if (user && event.id) {
      checkRsvpStatus();
      fetchRsvpCount();
    }
  }, [user, event.id]);

  // Check if current user has RSVP'd
  const checkRsvpStatus = async () => {
    if (!user) return;
    const {
      data
    } = await supabase.from('event_rsvps').select().eq('event_id', event.id).eq('user_id', user.id).maybeSingle();
    setIsRsvped(!!data);
  };

  // Get total RSVP count for this event
  const fetchRsvpCount = async () => {
    const {
      count,
      error
    } = await supabase.from('event_rsvps').select('id', {
      count: 'exact',
      head: true
    }).eq('event_id', event.id);
    if (error) {
      console.error('Error fetching RSVP count:', error);
      return;
    }
    setRsvpCount(count || 0);
  };

  // Handle event deletion
  const handleDelete = () => {
    // Close the sheet when the event is deleted
    setIsSheetOpen(false);
    
    // Add a small delay before calling onDelete to ensure sheet animations complete
    setTimeout(() => {
      // Call the onDelete callback if provided
      if (onDelete) onDelete();
    }, 200);
  };

  // Edit Button component with white styling for the hover state
  const EditButton = ({ onSheetClose }: { onSheetClose?: () => void }) => isHost ? (
    <EditEventDialog 
      event={event} 
      onDelete={handleDelete}
      onSheetClose={onSheetClose}
    >
      <div className="flex items-center gap-2 text-blue-600">
        <Pencil className="h-4 w-4" />
        Edit
      </div>
    </EditEventDialog>
  ) : null;

  // Determine event color based on RSVP status
  const getEventColor = () => {
    if (isRsvped) {
      return isHost 
        ? "border-blue-300 bg-blue-50 shadow-sm" 
        : "border-green-300 bg-green-50 shadow-sm";
    }
    return "border-gray-200 bg-white shadow-sm";
  };

  // Create a simple event object with just the required fields from our Event type
  const eventWithRequiredProps = {
    ...event,
    created_at: event.created_at || new Date().toISOString()
  };
  
  // Function to handle sheet closing
  const handleSheetClose = () => {
    setIsSheetOpen(false);
  };

  // Different card rendering for list view vs calendar view
  if (listView) {
    return (
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={`p-4 cursor-pointer rounded-xl ${isHighlighted ? 'ring-2 ring-blue-300' : ''}`}
            data-event-id={event.id}
          >
            <div className="flex justify-between">
              <div>
                <h3 className="font-semibold text-lg text-gray-800">{event.title}</h3>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-gray-600 mt-2">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span>{displayDate}</span>
                  </div>
                  <span className="hidden sm:inline mx-1">•</span>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span>{displayTime}</span>
                  </div>
                  <span className="hidden sm:inline mx-1">•</span>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    <span>{event.location}</span>
                  </div>
                </div>
              </div>
              {rsvpCount > 0 && (
                <div className="flex items-center gap-1.5 bg-blue-50 text-blue-600 px-3 py-1 rounded-full h-fit">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">{rsvpCount}</span>
                </div>
              )}
            </div>
            {isRsvped && (
              <div className="mt-3">
                <span className={cn(
                  "text-xs font-medium px-2 py-1 rounded-full",
                  isHost 
                    ? "bg-blue-100 text-blue-800" 
                    : "bg-green-100 text-green-800"
                )}>
                  {isHost ? "You're hosting" : "You're attending"}
                </span>
              </div>
            )}
          </motion.div>
        </SheetTrigger>
        <EventSheetContent 
          event={eventWithRequiredProps} 
          EditButton={EditButton} 
          onOpenChange={setIsSheetOpen}
        />
      </Sheet>
    );
  }

  // Standard calendar view event card
  const eventPreview = (
    <motion.div 
      data-event-id={event.id} 
      className={cn(
        "rounded-md px-2 py-1.5 mb-1.5 text-xs cursor-pointer hover:bg-opacity-80 border-l-4",
        getEventColor(),
        isHighlighted ? "ring-2 ring-blue-400" : "",
        isHost ? "border-l-blue-500" : isRsvped ? "border-l-green-500" : "border-l-gray-300"
      )}
      onMouseEnter={() => setIsHovering(true)} 
      onMouseLeave={() => setIsHovering(false)}
      animate={isHighlighted ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 0.5 }}
    >      
      <div className="font-medium line-clamp-2 text-gray-800">{event.title}</div>
      <div className="flex items-center gap-1 text-gray-600 mt-1">
        <Clock className="h-3 w-3" />
        <span className="truncate">{displayTime}</span>
      </div>
      {rsvpCount > 0 && (
        <div className="flex items-center gap-1 text-gray-600 mt-1">
          <Users className="h-3 w-3" />
          <span>{rsvpCount}</span>
        </div>
      )}
    </motion.div>
  );

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <EventHoverCard event={eventWithRequiredProps}>
          {eventPreview}
        </EventHoverCard>
      </SheetTrigger>
      <EventSheetContent 
        event={eventWithRequiredProps} 
        EditButton={EditButton} 
        onOpenChange={setIsSheetOpen}
      />
    </Sheet>
  );
};

export default EventCard;
