import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "./ui/button";
import { Pencil, Clock } from "lucide-react";
import { format } from "date-fns";
import EditEventDialog from "./event/EditEventDialog";
import { useUser } from "@supabase/auth-helpers-react";
import EventHoverCard from "./event/EventHoverCard";
import EventSheetContent from "./event/EventSheetContent";
import { EventCardProps } from "./event/types";

const EventCard = ({ event, onDelete }: EventCardProps) => {
  const user = useUser();
  const displayTime = format(new Date(event.time), 'h:mm a');
  const isHost = user?.id === event.host_id;

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

  const eventPreview = (
    <div className={`rounded-md px-2 py-1.5 mb-1 text-xs cursor-pointer hover:bg-opacity-80 border-l-4 ${event.color} w-full`}>
      <div className="font-medium truncate">{event.title}</div>
      <div className="flex items-center gap-1 text-gray-600">
        <Clock className="h-3 w-3" />
        <span>{displayTime}</span>
      </div>
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