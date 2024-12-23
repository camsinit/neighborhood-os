import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Clock, User, MapPin } from "lucide-react";
import { format } from "date-fns";
import RSVPButton from "./RSVPButton";
import { EventCardProps } from "./types";

interface EventSheetContentProps extends EventCardProps {
  EditButton: () => JSX.Element | null;
}

const EventSheetContent = ({ event, EditButton }: EventSheetContentProps) => {
  const displayTime = format(new Date(event.time), 'h:mm a');

  return (
    <SheetContent>
      <SheetHeader>
        <SheetTitle>{event.title}</SheetTitle>
      </SheetHeader>
      <div className="mt-6 space-y-4">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-gray-500" />
          <span className="text-gray-700">{event.profiles?.display_name || 'Anonymous'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-gray-500" />
          <span className="text-gray-700">{displayTime}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-gray-500" />
          <span className="text-gray-700">{event.location}</span>
        </div>
        <div className="pt-4 border-t">
          <h3 className="font-medium mb-2">About this event</h3>
          <p className="text-gray-600">{event.description}</p>
        </div>
        <div className="flex gap-2">
          <RSVPButton eventId={event.id} />
          <EditButton />
        </div>
      </div>
    </SheetContent>
  );
};

export default EventSheetContent;