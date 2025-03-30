
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Clock, User, MapPin, Users } from "lucide-react";
import { format } from "date-fns";
import RSVPButton from "./RSVPButton";
import { EventCardProps } from "./types";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface EventHoverCardProps extends EventCardProps {
  children: React.ReactNode;
  EditButton: () => JSX.Element | null;
}

const EventHoverCard = ({ event, children, EditButton }: EventHoverCardProps) => {
  const displayTime = format(new Date(event.time), 'h:mm a');
  const [rsvpCount, setRsvpCount] = useState(0);
  
  // Get RSVP count for this event
  useEffect(() => {
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
    
    fetchRsvpCount();
  }, [event.id]);

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
          {rsvpCount > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-gray-500" />
              <span>{rsvpCount} attendee{rsvpCount !== 1 ? 's' : ''}</span>
            </div>
          )}
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
