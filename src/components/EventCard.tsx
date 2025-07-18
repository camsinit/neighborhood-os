
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "./ui/button";
import { Pencil, Clock, Users } from "lucide-react";
import { format, parseISO } from "date-fns";
import EditEventDialog from "./event/EditEventDialog";
import { useUser } from "@supabase/auth-helpers-react";
import EventSheetContent from "./event/EventSheetContent";
import { EventCardProps } from "./event/types";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatInNeighborhoodTimezone } from "@/utils/dateUtils";
import { useNavigate } from "react-router-dom";
import { createItemNavigationService } from "@/services/navigation/ItemNavigationService";

/**
 * EventCard component displays an event in the calendar
 * 
 * This component:
 * - Shows a compact view of the event in the calendar grid
 * - Changes color based on RSVP status
 * - Shows event details on hover
 * - Opens a full event sheet when clicked
 * - Shows edit controls for event hosts
 * 
 * @param event - The event data to display
 * @param onDelete - Callback function when event is deleted
 */
const EventCard = ({
  event,
  onDelete
}: EventCardProps) => {
  const navigate = useNavigate();
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
      <div className="flex items-center gap-2 text-white">
        <Pencil className="h-4 w-4" />
        Edit
      </div>
    </EditEventDialog>
  ) : null;

  // Determine event color based on RSVP status
  const getEventColor = () => {
    if (isRsvped) {
      return "border-blue-300 bg-blue-100";
    }
    return "border-gray-300 bg-gray-100";
  };

  // Create a simple event object with just the required fields from our Event type
  const eventWithRequiredProps = {
    ...event,
    created_at: event.created_at || new Date().toISOString()
  };
  
  // Handle event click - now uses navigation service instead of internal state
  const handleEventClick = () => {
    const navigationService = createItemNavigationService(navigate);
    navigationService.navigateToItem('event', event.id, { 
      showToast: false 
    });
  };

  // Event preview card with click effect for showing details
  // Added mb-2 (margin-bottom) to create space between events
  const eventPreview = <div 
      data-event-id={event.id} 
      className={`rounded-md px-2 py-1.5 mb-2 text-xs cursor-pointer hover:bg-opacity-80 border-l-4 ${getEventColor()} w-full hover:bg-blue-100 transition-colors relative`} 
      onClick={handleEventClick}
    >
      {/* Host edit button - only shows when hovering on events you created */}
      {isHost && isHovering}
      
      <div className="font-medium line-clamp-2">{event.title}</div>
      {rsvpCount > 0 && <div className="flex items-center gap-1 text-gray-600 mt-1">
          <Users className="h-3 w-3" />
          <span>{rsvpCount}</span>
        </div>}
    </div>;

  return eventPreview;
};

export default EventCard;
