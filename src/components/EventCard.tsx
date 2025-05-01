
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "./ui/button";
import { Pencil, Clock, Users } from "lucide-react";
import { format } from "date-fns";
import EditEventDialog from "./event/EditEventDialog";
import { useUser } from "@supabase/auth-helpers-react";
import EventHoverCard from "./event/EventHoverCard";
import EventSheetContent from "./event/EventSheetContent";
import { EventCardProps } from "./event/types";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const EventCard = ({ event, onDelete }: EventCardProps) => {
  const user = useUser();
  const [isRsvped, setIsRsvped] = useState(false);
  const [rsvpCount, setRsvpCount] = useState(0);
  const displayTime = format(new Date(event.time), 'h:mm a');
  const isHost = user?.id === event.host_id;

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

    const { data } = await supabase
      .from('event_rsvps')
      .select()
      .eq('event_id', event.id)
      .eq('user_id', user.id)
      .maybeSingle();

    setIsRsvped(!!data);
  };
  
  // Get total RSVP count for this event
  const fetchRsvpCount = async () => {
    const { count, error } = await supabase
      .from('event_rsvps')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', event.id);
      
    if (error) {
      console.error('Error fetching RSVP count:', error);
      return;
    }
    
    setRsvpCount(count || 0);
  };

  const EditButton = () => isHost ? (
    <EditEventDialog 
      event={event}
      onDelete={onDelete}
    >
      <div className="flex items-center gap-2">
        <Pencil className="h-4 w-4" />
        Edit
      </div>
    </EditEventDialog>
  ) : null;

  // Determine event color based on RSVP status
  const getEventColor = () => {
    if (isRsvped) {
      return "border-green-300 bg-green-100";
    }
    return "border-gray-300 bg-gray-100";
  };

  // Create a complete event object with all required fields and UI-specific properties
  const eventWithRequiredProps = {
    ...event,
    created_at: event.created_at || new Date().toISOString(), // Ensure created_at exists
    // Add color as a UI-specific property, not part of the Event type from the database
    color: getEventColor() 
  };

  const eventPreview = (
    <div 
      data-event-id={event.id}
      className={`rounded-md px-2 py-1.5 mb-1 text-xs cursor-pointer hover:bg-opacity-80 border-l-4 ${getEventColor()} w-full`}
    >
      <div className="font-medium line-clamp-2">{event.title}</div>
      {rsvpCount > 0 && (
        <div className="flex items-center gap-1 text-gray-600 mt-1">
          <Users className="h-3 w-3" />
          <span>{rsvpCount}</span>
        </div>
      )}
    </div>
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <EventHoverCard event={eventWithRequiredProps}>
          {eventPreview}
        </EventHoverCard>
      </SheetTrigger>
      <EventSheetContent event={eventWithRequiredProps} EditButton={EditButton} />
    </Sheet>
  );
};

export default EventCard;
