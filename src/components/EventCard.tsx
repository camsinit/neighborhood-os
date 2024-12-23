import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Clock, User, MapPin } from "lucide-react";
import { format } from "date-fns";
import RSVPButton from "./event/RSVPButton";
import EditEventDialog from "./event/EditEventDialog";
import { useUser } from "@supabase/auth-helpers-react";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    time: string;
    location: string;
    description: string | null;
    color: string;
    host_id?: string;
    is_recurring?: boolean;
    recurrence_pattern?: string;
    recurrence_end_date?: string | null;
    profiles?: {
      display_name: string | null;
    };
  };
  onDelete?: () => void;
}

const EventCard = ({ event, onDelete }: EventCardProps) => {
  const user = useUser();
  const displayTime = format(new Date(event.time), 'h:mm a');
  const isHost = user?.id === event.host_id;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <HoverCard>
          <HoverCardTrigger asChild>
            <div className={`rounded-md p-1.5 mb-1 text-xs cursor-pointer hover:bg-opacity-80 border-l-4 ${event.color}`}>
              <div className="font-medium truncate">{event.title}</div>
              <div className="flex items-center gap-1 text-gray-600">
                <Clock className="h-3 w-3" />
                <span>{displayTime}</span>
              </div>
            </div>
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
                {isHost && (
                  <EditEventDialog 
                    event={event}
                    onDelete={onDelete}
                  />
                )}
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      </SheetTrigger>
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
            {isHost && (
              <EditEventDialog 
                event={event}
                onDelete={onDelete}
              />
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default EventCard;