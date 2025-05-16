
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
 */
import { useState } from "react";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { format, parseISO } from "date-fns";
import { EventCardProps } from "./event/types";
import EventHoverCard from "./event/EventHoverCard";
import EventSheetContent from "./event/EventSheetContent";
import { formatInNeighborhoodTimezone } from "@/utils/dateUtils";
import CardActions from "./event/CardActions";
import EventCardContent from "./event/EventCardContent";
import EventCardList from "./event/EventCardList";
import { useEventRsvpStatus } from "@/hooks/events/useEventRsvpStatus";
import { useNeighborhoodTimezone } from "@/hooks/events/useNeighborhoodTimezone";

/**
 * EventCard Component
 * 
 * Displays an event in either compact calendar view or expanded list view
 */
const EventCard = ({
  event,
  onDelete,
  isHighlighted = false,
  listView = false
}: EventCardProps & { isHighlighted?: boolean, listView?: boolean }) => {
  // State for controlling the Sheet open state
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  // Get RSVP status and neighborhood timezone
  const { isRsvped, rsvpCount, isHost } = useEventRsvpStatus(event);
  const { neighborhoodTimezone } = useNeighborhoodTimezone(event.neighborhood_id);

  // Format display time using the neighborhood timezone
  const displayTime = formatInNeighborhoodTimezone(parseISO(event.time), 'h:mm a', neighborhoodTimezone);
  const displayDate = formatInNeighborhoodTimezone(parseISO(event.time), 'EEE, MMM d', neighborhoodTimezone);

  // Create a simple event object with just the required fields from our Event type
  const eventWithRequiredProps = {
    ...event,
    created_at: event.created_at || new Date().toISOString()
  };
  
  // Function to handle sheet closing
  const handleSheetClose = () => {
    setIsSheetOpen(false);
  };

  // Edit Button component with props for the sheet
  const EditButton = ({ onSheetClose }: { onSheetClose?: () => void }) => (
    <CardActions 
      event={event}
      isHost={isHost}
      onDelete={onDelete}
      onSheetClose={onSheetClose}
    />
  );

  // Different rendering for list view vs calendar view
  if (listView) {
    return (
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <EventCardList
            event={event}
            isHost={isHost}
            isRsvped={isRsvped}
            rsvpCount={rsvpCount}
            displayTime={displayTime}
            displayDate={displayDate}
            isHighlighted={isHighlighted}
          />
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
  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <EventHoverCard event={eventWithRequiredProps}>
          <EventCardContent
            event={event}
            isHost={isHost}
            isRsvped={isRsvped}
            rsvpCount={rsvpCount}
            displayTime={displayTime}
            isHighlighted={isHighlighted}
          />
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
