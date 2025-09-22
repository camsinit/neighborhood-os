
import { Sheet, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AppSheetContent } from "@/components/ui/app-sheet-content";
import { useState, useEffect } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import ShareButton from "@/components/ui/share-button";
import EventForm from "../events/EventForm";
import { Button } from "@/components/ui/button";
import { Edit, Trash, Calendar, MapPin, Clock, Download } from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Import our new component modules
import EventDateTime from "./details/EventDateTime";
import EventLocation from "./details/EventLocation";
import EventHost from "./details/EventHost";
import EventDescription from "./details/EventDescription";
import EventRSVPButton from "./details/EventRSVPButton";
import EventAttendeesList from "./details/EventAttendeesList";
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
  const queryClient = useQueryClient();
  
  // State for neighborhood timezone and edit mode
  const [neighborhoodTimezone, setNeighborhoodTimezone] = useState<string>('America/Los_Angeles');
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Function to close the sheet
  const handleSheetClose = () => {
    if (onOpenChange) {
      onOpenChange(false);
    }
  };
  
  // Check if current user is the event host
  const isHost = user?.id === event.host_id;

  // Prepare initial values for the event form
  const initialValues = {
    title: event.title,
    description: event.description || '',
    date: format(parseISO(event.time), 'yyyy-MM-dd'),
    time: format(parseISO(event.time), 'HH:mm'),
    location: event.location,
    isRecurring: event.is_recurring || false,
    recurrencePattern: event.recurrence_pattern || '',
    recurrenceEndDate: event.recurrence_end_date 
      ? format(parseISO(event.recurrence_end_date), 'yyyy-MM-dd') 
      : '',
  };

  // Handle confirmed deletion
  const handleConfirmedDelete = async () => {
    setIsDeleting(true);
    
    try {
      // Close the sheet first
      handleSheetClose();
      
      // Add a small delay to ensure sheet animation completes
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', event.id);
        
      if (error) throw error;
      toast.success("Event deleted successfully");
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['events'] });
      
    } catch (error: any) {
      console.error('Error deleting event:', error);
      toast.error(`Failed to delete event: ${error.message}`);
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

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

  // Function to generate and download .ics file
  const downloadICS = () => {
    try {
      const eventDate = parseISO(event.time);
      const startDate = format(eventDate, "yyyyMMdd'T'HHmmss'Z'");
      const endDate = format(new Date(eventDate.getTime() + 2 * 60 * 60 * 1000), "yyyyMMdd'T'HHmmss'Z'"); // 2 hours later
      
      const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//NeighborhoodOS//Event//EN',
        'BEGIN:VEVENT',
        `UID:${event.id}@neighborhoodos.com`,
        `DTSTART:${startDate}`,
        `DTEND:${endDate}`,
        `SUMMARY:${event.title}`,
        `DESCRIPTION:${event.description || ''}`,
        `LOCATION:${event.location}`,
        'STATUS:CONFIRMED',
        'TRANSP:OPAQUE',
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n');

      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("Calendar file downloaded!");
    } catch (error) {
      console.error('Error generating ICS file:', error);
      toast.error("Failed to download calendar file");
    }
  };

  // Delete button component
  const DeleteButton = (
    <Button 
      variant="ghost" 
      size="sm"
      className="text-destructive hover:bg-destructive/10"
      onClick={() => setIsDeleteDialogOpen(true)}
    >
      <Trash className="h-4 w-4 mr-2" />
      Delete
    </Button>
  );

  return (
    <>
      <AppSheetContent 
        moduleTheme="calendar"
        className="space-y-0"
      >

        {/* Main content with consistent spacing pattern */}
        <div className="space-y-6 pt-6">
          {isEditing ? (
            <div className="space-y-4">
              <div className="mb-4 text-sm text-muted-foreground">
                All times are in {neighborhoodTimezone.replace('_', ' ')} timezone
              </div>
              <EventForm 
                onClose={() => setIsEditing(false)}
                initialValues={initialValues}
                eventId={event.id}
                mode="edit"
                deleteButton={DeleteButton}
                neighborhoodTimezone={neighborhoodTimezone}
              />
            </div>
          ) : (
            <>
              {/* Condensed Event Details Card */}
              <div 
                className="p-4 rounded-xl border-2" 
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--calendar-light)) 0%, hsl(var(--background)) 100%)',
                  borderColor: 'hsl(var(--calendar-color) / 0.2)'
                }}
              >
                {/* Event Title at top of card */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">{event.title}</h3>

                {/* Condensed Date, Time and Location - Single Row */}
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  {/* Date and Time - Condensed */}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" style={{ color: 'hsl(var(--calendar-color))' }} />
                    <div className="flex items-center gap-1">
                      <span className="font-medium">
                        {formatInNeighborhoodTimezone(parseISO(event.time), 'MMM d', neighborhoodTimezone)}
                      </span>
                      <span className="text-gray-600">•</span>
                      <Clock className="h-3 w-3 text-gray-500" />
                      <span className="text-gray-600">
                        {formatInNeighborhoodTimezone(parseISO(event.time), 'h:mm a', neighborhoodTimezone)}
                      </span>
                    </div>
                  </div>

                  {/* Location - Condensed */}
                  {event.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" style={{ color: 'hsl(var(--calendar-color))' }} />
                      <span className="text-gray-600">{event.location}</span>
                    </div>
                  )}

                  {/* Host - Condensed in same line as date/location */}
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {event.profiles?.avatar_url ? (
                        <img 
                          src={event.profiles.avatar_url} 
                          alt={event.profiles.display_name || 'Host'} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-medium text-gray-600">
                          {event.profiles?.display_name?.[0] || '?'}
                        </span>
                      )}
                    </div>
                    <span className="text-gray-600">
                      {event.profiles?.display_name || 'Anonymous'}
                      {isHost && <span className="ml-1 text-xs text-gray-500">(You)</span>}
                    </span>
                  </div>
                </div>

                {/* Description - Separate section if exists */}
                {event.description && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{event.description}</p>
                  </div>
                )}

                {/* Action Buttons at bottom of card */}
                <div className="flex gap-3 mt-6 pt-4">
                  {isHost && (
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      style={{
                        borderColor: 'hsl(var(--calendar-color) / 0.3)',
                        color: 'hsl(var(--calendar-color))'
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                  <Button
                    onClick={downloadICS}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    style={{
                      borderColor: 'hsl(var(--calendar-color) / 0.3)',
                      color: 'hsl(var(--calendar-color))'
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Add to Calendar
                  </Button>
                  <EventRSVPButton 
                    eventId={event.id} 
                    isHost={isHost}
                    neighborhoodId={event.neighborhood_id}
                  />
                </div>
              </div>
              
              {/* Attendees section */}
              <EventAttendeesList eventId={event.id} />
            </>
          )}
        </div>
      </AppSheetContent>

      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this event. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmedDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EventSheetContent;
