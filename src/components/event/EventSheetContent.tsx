
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, User, Calendar as CalIcon, X } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useState, useEffect } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { formatInNeighborhoodTimezone } from "@/utils/dateUtils";

/**
 * EventSheetContent component displays the full details of an event
 * in a slide-out sheet
 * 
 * @param event - The event data to display
 * @param EditButton - Optional edit button component
 * @param onOpenChange - Function to control the sheet's open state
 */
const EventSheetContent = ({ 
  event, 
  EditButton,
  onOpenChange
}: { 
  event: any;
  EditButton?: React.FC<{onSheetClose?: () => void}>;
  onOpenChange?: (open: boolean) => void;
}) => {
  // Get current authenticated user
  const user = useUser();
  const [isRsvped, setIsRsvped] = useState(false);
  const [rsvpCount, setRsvpCount] = useState(0);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [neighborhoodTimezone, setNeighborhoodTimezone] = useState<string>('America/Los_Angeles');
  
  // Function to close the sheet
  const handleSheetClose = () => {
    if (onOpenChange) {
      // Pass false to the onOpenChange prop to close the sheet
      onOpenChange(false);
    }
  };
  
  // Check if current user is the event host
  const isHost = user?.id === event.host_id;
  
  // Format dates with neighborhood timezone
  const eventDate = parseISO(event.time);
  const formattedDate = formatInNeighborhoodTimezone(eventDate, 'EEEE, MMMM d, yyyy', neighborhoodTimezone);
  const formattedTime = formatInNeighborhoodTimezone(eventDate, 'h:mm a', neighborhoodTimezone);

  // Get the neighborhood timezone
  useEffect(() => {
    const fetchNeighborhoodTimezone = async () => {
      if (event.neighborhood_id) {
        const { data, error } = await supabase
          .from('neighborhoods')
          .select('timezone')
          .eq('id', event.neighborhood_id)
          .single();
          
        if (!error && data) {
          setNeighborhoodTimezone(data.timezone || 'America/Los_Angeles');
        }
      }
    };
    fetchNeighborhoodTimezone();
  }, [event.neighborhood_id]);
  
  // Load RSVP status and attendees on component mount
  useEffect(() => {
    if (user && event.id) {
      checkRsvpStatus();
      fetchAttendees();
    }
  }, [user, event.id]);

  // Check if current user has RSVPed
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
  
  // Fetch all RSVPs for this event
  const fetchAttendees = async () => {
    setIsLoading(true);
    
    const { data, error, count } = await supabase
      .from('event_rsvps')
      .select(`
        user_id,
        profiles:user_id (
          id,
          display_name,
          avatar_url
        )
      `)
      .eq('event_id', event.id);
      
    if (error) {
      console.error('Error fetching attendees:', error);
      return;
    }
    
    setRsvpCount(count || 0);
    setAttendees(data || []);
    setIsLoading(false);
  };

  // Handle RSVP button click
  const handleRsvp = async () => {
    if (!user) {
      toast.error("Please sign in to RSVP");
      return;
    }

    try {
      if (isRsvped) {
        // Remove RSVP
        await supabase
          .from('event_rsvps')
          .delete()
          .eq('event_id', event.id)
          .eq('user_id', user.id);
          
        setIsRsvped(false);
        toast.success("RSVP removed");
      } else {
        // Add RSVP
        await supabase
          .from('event_rsvps')
          .insert({
            event_id: event.id,
            user_id: user.id,
            neighborhood_id: event.neighborhood_id
          });
          
        setIsRsvped(true);
        toast.success("RSVP confirmed!");
      }
      
      // Refresh attendees list
      fetchAttendees();
    } catch (error) {
      console.error('RSVP error:', error);
      toast.error("Failed to update RSVP");
    }
  };

  return (
    <SheetContent className="sm:max-w-md overflow-y-auto">
      <SheetHeader className="mb-4">
        <SheetTitle className="text-xl font-bold flex justify-between items-start">
          <span>{event.title}</span>
          {EditButton && <EditButton onSheetClose={handleSheetClose} />}
        </SheetTitle>
      </SheetHeader>

      <div className="space-y-6">
        {/* Event date and time */}
        <div className="flex items-start gap-3">
          <Calendar className="h-5 w-5 text-gray-500 mt-0.5 shrink-0" />
          <div>
            <div className="font-medium">{formattedDate}</div>
            <div className="text-sm text-gray-500">
              {formattedTime} ({neighborhoodTimezone.replace('_', ' ')})
            </div>
          </div>
        </div>
        
        {/* Event location */}
        {event.location && (
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-gray-500 mt-0.5 shrink-0" />
            <div>
              <div className="font-medium">Location</div>
              <div className="text-sm text-gray-600">{event.location}</div>
            </div>
          </div>
        )}
        
        {/* Event host */}
        <div className="flex items-start gap-3">
          <User className="h-5 w-5 text-gray-500 mt-0.5 shrink-0" />
          <div>
            <div className="font-medium">Host</div>
            <div className="text-sm text-gray-600">
              {event.profiles?.display_name || 'Unknown Host'}
              {isHost && <Badge variant="outline" className="ml-2">You</Badge>}
            </div>
          </div>
        </div>
        
        {/* Event description */}
        {event.description && (
          <div className="mt-4">
            <h3 className="font-medium mb-1">Details</h3>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{event.description}</p>
          </div>
        )}
        
        {/* RSVP button */}
        {!isHost && (
          <Button 
            className={`w-full ${isRsvped ? 'bg-green-600 hover:bg-green-700' : ''}`} 
            onClick={handleRsvp}
          >
            {isRsvped ? 'Attending ✓' : 'RSVP'}
          </Button>
        )}
        
        {/* Attendees section */}
        <div className="mt-4">
          <Separator className="my-4" />
          <h3 className="font-medium flex items-center mb-2">
            <CalIcon className="h-4 w-4 mr-2 text-gray-500" />
            Attendees ({rsvpCount})
          </h3>
          
          {isLoading ? (
            <p className="text-sm text-gray-500">Loading attendees...</p>
          ) : attendees.length > 0 ? (
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
      </div>
    </SheetContent>
  );
};

export default EventSheetContent;
