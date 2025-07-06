
import { Calendar as CalIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useEventRSVPs } from "@/utils/queries/useEventRSVPs";
import { useUser } from "@supabase/auth-helpers-react";

/**
 * EventAttendeesList component - Displays a list of event attendees including the host
 * 
 * This component fetches and displays the list of users who have RSVP'd to an event
 * as well as the event host (even if they haven't RSVP'd)
 * 
 * @param eventId - ID of the event
 */
interface EventAttendeesListProps {
  eventId: string;
}

const EventAttendeesList = ({ eventId }: EventAttendeesListProps) => {
  // Get current user to highlight their own RSVP
  const user = useUser();
  
  // Fetch RSVPs for this event using the custom hook
  const { data: attendees, isLoading } = useEventRSVPs(eventId);
  
  // Count of RSVPs
  const rsvpCount = attendees?.length || 0;

  return (
    <div className="bg-white rounded-xl border border-hsl(var(--border)) p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-hsl(var(--calendar-color)/0.1) flex items-center justify-center">
          <CalIcon className="h-4 w-4 text-hsl(var(--calendar-color))" />
        </div>
        <h3 className="font-semibold text-hsl(var(--foreground))">
          Attendees ({rsvpCount})
        </h3>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-hsl(var(--calendar-color)) border-t-transparent"></div>
        </div>
      ) : attendees && attendees.length > 0 ? (
        <div className="space-y-3">
          {attendees.map((attendee) => {
            // Check if this person is the host
            const isEventHost = (attendee as any).isHost || false;
            const isCurrentUser = user?.id === attendee.user_id;
            
            return (
              <div key={attendee.user_id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-hsl(var(--accent)) transition-colors">
                <Avatar className="h-8 w-8 border-2 border-hsl(var(--border))">
                  {attendee.profiles?.avatar_url ? (
                    <AvatarImage src={attendee.profiles.avatar_url} />
                  ) : null}
                  <AvatarFallback className="bg-hsl(var(--calendar-color)/0.1) text-hsl(var(--calendar-color)) font-medium">
                    {(attendee.profiles?.display_name || 'A')[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-hsl(var(--foreground)) truncate">
                      {attendee.profiles?.display_name || 'Anonymous'}
                    </span>
                    {isEventHost && (
                      <Badge variant="secondary" className="text-xs bg-hsl(var(--calendar-color)/0.1) text-hsl(var(--calendar-color)) border-hsl(var(--calendar-color)/0.2)">
                        Host
                      </Badge>
                    )}
                    {!isEventHost && isCurrentUser && (
                      <Badge variant="outline" className="text-xs">You</Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-full bg-hsl(var(--muted)) mx-auto mb-3 flex items-center justify-center">
            <CalIcon className="h-6 w-6 text-hsl(var(--muted-foreground))" />
          </div>
          <p className="text-sm text-hsl(var(--muted-foreground))">No attendees yet. Be the first to RSVP!</p>
        </div>
      )}
    </div>
  );
};

export default EventAttendeesList;
