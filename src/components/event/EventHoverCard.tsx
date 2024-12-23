import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Clock, User, MapPin } from "lucide-react";
import { format } from "date-fns";
import RSVPButton from "./RSVPButton";
import { EventCardProps } from "./types";

interface EventHoverCardProps extends EventCardProps {
  children: React.ReactNode;
  EditButton: () => JSX.Element | null;
}

const EventHoverCard = ({ event, children, EditButton }: EventHoverCardProps) => {
  const displayTime = format(new Date(event.time), 'h:mm a');

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-2">
          <h4 className="font-semibold">{event.title}</h4>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-gray-500" />
            <span>{displayTime}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-gray-500" />
            <span>{event.profiles?.display_name || 'Anonymous'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span>{event.location}</span>
          </div>
          <p className="text-sm text-gray-600">{event.description}</p>
          <div className="flex gap-2">
            <RSVPButton eventId={event.id} />
            <EditButton />
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default EventHoverCard;