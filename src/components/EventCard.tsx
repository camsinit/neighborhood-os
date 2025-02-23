
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "./ui/button";
import { Pencil, Clock } from "lucide-react";
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
  const displayTime = format(new Date(event.time), 'h:mm a');
  const isHost = user?.id === event.host_id;

  // Check if the current user has RSVP'd to this event
  useEffect(() => {
    if (user) {
      checkRsvpStatus();
    }
  }, [user, event.id]);

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

  const eventPreview = (
    <div className={`rounded-md px-2 py-1.5 mb-1 text-xs cursor-pointer hover:bg-opacity-80 border-l-4 ${getEventColor()} w-full`}>
      <div className="font-medium line-clamp-2">{event.title}</div>
    </div>
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <EventHoverCard event={event} EditButton={EditButton}>
          {eventPreview}
        </EventHoverCard>
      </SheetTrigger>
      <EventSheetContent event={event} EditButton={EditButton} />
    </Sheet>
  );
};

export default EventCard;
