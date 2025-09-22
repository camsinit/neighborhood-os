
import { Sheet, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AppSheetContent } from "@/components/ui/app-sheet-content";
import { useState, useEffect } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import ShareButton from "@/components/ui/share-button";
import EventForm from "../events/EventForm";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
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
        {/* Header section with title and actions - following skills/groups pattern */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold text-foreground leading-tight pr-4">
              {isEditing ? "Edit Event" : event.title}
            </h2>
          </div>
          
          {/* Action buttons positioned in top-right like other panels */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {!isEditing && (
              <ShareButton
                contentType="events"
                contentId={event.id}
                neighborhoodId={event.neighborhood_id}
                size="sm"
                variant="ghost"
              />
            )}
            {(EditButton && <EditButton onSheetClose={handleSheetClose} />) || 
             (isHost && !isEditing && (
               <Button
                 variant="ghost"
                 size="sm"
                 onClick={() => setIsEditing(true)}
                 className="text-foreground hover:bg-accent"
               >
                 <Edit className="h-4 w-4 mr-2" />
                 Edit
               </Button>
             ))}
            {isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(false)}
                className="text-muted-foreground hover:bg-accent"
              >
                Cancel
              </Button>
            )}
          </div>
        </div>

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
              {/* Highlighted key information section - following established pattern */}
              <div className="bg-accent/30 rounded-lg p-4 space-y-4 border border-accent/20">
                <EventDateTime 
                  date={event.time} 
                  neighborhoodTimezone={neighborhoodTimezone} 
                />
                <EventLocation location={event.location} />
              </div>
              
              {/* Secondary information with consistent spacing */}
              <div className="space-y-6">
                <EventHost 
                  hostName={event.profiles?.display_name} 
                  isCurrentUserHost={isHost} 
                />
                
                <EventDescription description={event.description} />
                
                {/* RSVP button */}
                <EventRSVPButton 
                  eventId={event.id} 
                  isHost={isHost}
                  neighborhoodId={event.neighborhood_id}
                />
                
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
