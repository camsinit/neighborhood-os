
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
              {/* Enhanced Event Details Card with Gradient Background */}
              <div 
                className="p-6 rounded-xl border-2" 
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--calendar-light)) 0%, hsl(var(--background)) 100%)',
                  borderColor: 'hsl(var(--calendar-color) / 0.2)'
                }}
              >
                {/* Event Details Grid */}
                <div className="space-y-4">
                  {/* Date and Time */}
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center" style={{
                      backgroundColor: 'hsl(var(--calendar-color) / 0.1)'
                    }}>
                      <Calendar className="h-5 w-5" style={{ color: 'hsl(var(--calendar-color))' }} />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">
                        {formatInNeighborhoodTimezone(
                          parseISO(event.time), 
                          'EEEE, MMMM d, yyyy', 
                          neighborhoodTimezone
                        )}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <Clock className="h-4 w-4" />
                        {formatInNeighborhoodTimezone(
                          parseISO(event.time), 
                          'h:mm a', 
                          neighborhoodTimezone
                        )} ({neighborhoodTimezone.replace('_', ' ')})
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  {event.location && (
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center" style={{
                        backgroundColor: 'hsl(var(--calendar-color) / 0.1)'
                      }}>
                        <MapPin className="h-5 w-5" style={{ color: 'hsl(var(--calendar-color))' }} />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">Location</div>
                        <div className="text-sm text-gray-600 mt-1">{event.location}</div>
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {event.description && (
                    <div className="pt-2">
                      <div className="font-semibold text-gray-900 mb-2">Details</div>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{event.description}</p>
                    </div>
                  )}

                  {/* Host Information */}
                  <div className="flex items-start gap-3 pt-2">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center" style={{
                      backgroundColor: 'hsl(var(--calendar-color) / 0.1)'
                    }}>
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
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
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">Host</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {event.profiles?.display_name || 'Anonymous'}
                        {isHost && <span className="ml-2 text-xs text-gray-500">(You)</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
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
              
              {/* Secondary information with consistent spacing */}
              <div className="space-y-6">
                {/* Attendees section */}
                <EventAttendeesList eventId={event.id} />
              </div>
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
