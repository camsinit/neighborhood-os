
import { Calendar as CalIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEventRSVPs } from "@/utils/queries/useEventRSVPs";
import { useUser } from "@supabase/auth-helpers-react";

/**
 * EventAttendeesList component - Displays a list of event attendees
 * 
 * This component fetches and displays the list of users who have RSVP'd to an event
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
    <div className="mt-4">
      <Separator className="my-4" />
      <h3 className="font-medium flex items-center mb-2">
        <CalIcon className="h-4 w-4 mr-2 text-gray-500" />
        Attendees ({rsvpCount})
      </h3>
      
      {isLoading ? (
        <p className="text-sm text-gray-500">Loading attendees...</p>
      ) : attendees && attendees.length > 0 ? (
        <div className="space-y-2">
          {attendees.map((attendee) => (
            <div key={attendee.user_id} className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                {attendee.profiles?.avatar_url ? (
                  <AvatarImage src={attendee.profiles.avatar_url} />
                ) : null}
                <AvatarFallback>
                  {(attendee.profiles?.display_name || 'A')[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">
                {attendee.profiles?.display_name || 'Anonymous'}
                {user?.id === attendee.user_id && <span className="text-xs text-gray-500 ml-1">(You)</span>}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No attendees yet. Be the first to RSVP!</p>
      )}
    </div>
  );
};

export default EventAttendeesList;
