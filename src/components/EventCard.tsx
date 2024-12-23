import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Clock, User, MapPin, Users, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
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
    profiles?: {
      display_name: string | null;
    };
  };
  onDelete?: () => void;
}

const EventCard = ({ event, onDelete }: EventCardProps) => {
  const [isRsvped, setIsRsvped] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const user = useUser();

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
      .single();

    setIsRsvped(!!data);
  };

  const handleRSVP = async () => {
    if (!user) {
      toast.error("Please log in to RSVP");
      return;
    }

    setIsLoading(true);
    try {
      if (isRsvped) {
        await supabase
          .from('event_rsvps')
          .delete()
          .eq('event_id', event.id)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('event_rsvps')
          .insert([
            { event_id: event.id, user_id: user.id }
          ]);
      }

      setIsRsvped(!isRsvped);
      toast(isRsvped ? "RSVP cancelled" : "Successfully RSVP'd to event!");
    } catch (error) {
      toast.error("Failed to update RSVP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!user || user.id !== event.host_id) {
      toast.error("You don't have permission to delete this event");
      return;
    }

    setIsLoading(true);
    try {
      // Notify RSVP'd users about the cancellation
      await fetch('/functions/v1/notify-event-changes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          eventId: event.id,
          action: 'delete',
          eventTitle: event.title,
        }),
      });

      // Delete the event
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', event.id);

      if (error) throw error;

      toast.success("Event deleted successfully");
      if (onDelete) onDelete();
    } catch (error) {
      toast.error("Failed to delete event");
    } finally {
      setIsLoading(false);
    }
  };

  const displayTime = format(new Date(event.time), 'h:mm a');

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
                <Button 
                  variant={isRsvped ? "destructive" : "default"}
                  className="flex-1"
                  onClick={(e) => {
                    e.preventDefault();
                    handleRSVP();
                  }}
                  disabled={isLoading}
                >
                  {isRsvped ? "Cancel RSVP" : "RSVP"}
                </Button>
                {user && user.id === event.host_id && (
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete();
                    }}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
            <Button 
              variant={isRsvped ? "destructive" : "default"}
              className="flex-1"
              onClick={handleRSVP}
              disabled={isLoading}
            >
              {isRsvped ? "Cancel RSVP" : "RSVP"}
            </Button>
            {user && user.id === event.host_id && (
              <Button
                variant="destructive"
                size="icon"
                onClick={handleDelete}
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default EventCard;