import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Clock, User, MapPin, Users } from "lucide-react";
import { useState } from "react";
import { CalendarEvent } from "@/types/calendar";
import { toast } from "sonner";

interface EventCardProps {
  event: CalendarEvent;
}

const EventCard = ({ event }: EventCardProps) => {
  const [isRsvped, setIsRsvped] = useState(false);

  const handleRSVP = () => {
    setIsRsvped(!isRsvped);
    toast(isRsvped ? "RSVP cancelled" : "Successfully RSVP'd to event!");
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <HoverCard>
          <HoverCardTrigger asChild>
            <div className={`rounded-md p-1.5 mb-1 text-xs cursor-pointer hover:bg-opacity-80 border-l-4 ${event.color}`}>
              <div className="font-medium truncate">{event.title}</div>
              <div className="flex items-center gap-1 text-gray-600">
                <Clock className="h-3 w-3" />
                <span>{event.time}</span>
              </div>
            </div>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="space-y-2">
              <h4 className="font-semibold">{event.title}</h4>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-gray-500" />
                <span>{event.host}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-gray-500" />
                <span>{event.attendees} attending</span>
              </div>
              <p className="text-sm text-gray-600">{event.description}</p>
              <Button 
                variant={isRsvped ? "destructive" : "default"}
                className="w-full mt-2"
                onClick={(e) => {
                  e.preventDefault();
                  handleRSVP();
                }}
              >
                {isRsvped ? "Cancel RSVP" : "RSVP"}
              </Button>
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
            <span className="text-gray-700">{event.host}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-500" />
            <span className="text-gray-700">{event.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-gray-500" />
            <span className="text-gray-700">{event.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-500" />
            <span className="text-gray-700">{event.attendees} attending</span>
          </div>
          <div className="pt-4 border-t">
            <h3 className="font-medium mb-2">About this event</h3>
            <p className="text-gray-600">{event.description}</p>
          </div>
          <Button 
            variant={isRsvped ? "destructive" : "default"}
            className="w-full mt-4"
            onClick={handleRSVP}
          >
            {isRsvped ? "Cancel RSVP" : "RSVP"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default EventCard;