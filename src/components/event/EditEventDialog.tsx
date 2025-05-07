
import { useState, useEffect } from "react";
import UniversalDialog from "../ui/universal-dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import EventForm from "../events/EventForm";
import { Button } from "../ui/button";
import { Trash } from "lucide-react";
import { format, parseISO } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface EditEventDialogProps {
  event: {
    id: string;
    title: string;
    description?: string;
    location: string;
    time: string;
    is_recurring?: boolean;
    recurrence_pattern?: string;
    recurrence_end_date?: string;
    neighborhood_id: string;
  };
  onDelete?: () => void;
  children?: React.ReactNode;
  onSheetClose?: () => void; // Prop to handle sheet closure
}

/**
 * Edit Event Dialog Component
 * 
 * This component displays a modal dialog for editing an existing event.
 * It also includes a confirmation dialog for deleting events.
 */
const EditEventDialog = ({ 
  event, 
  onDelete, 
  children, 
  onSheetClose 
}: EditEventDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [neighborhoodTimezone, setNeighborhoodTimezone] = useState<string>('America/Los_Angeles');
  
  const queryClient = useQueryClient();

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
          console.log(`[EditEventDialog] Fetched timezone: ${data.timezone}`);
        }
      }
    };
    
    if (open) {
      fetchNeighborhoodTimezone();
    }
  }, [open, event.neighborhood_id]);

  // Handle event deletion
  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      // Close the parent sheet first if the callback is provided
      if (onSheetClose) {
        onSheetClose();
      }
      
      // Add a small delay to ensure sheet animation completes
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Now proceed with deletion
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', event.id);
        
      if (error) throw error;
      
      toast.success("Event deleted successfully");
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['events'] });
      
      // Close dialogs
      setIsDeleteDialogOpen(false);
      setOpen(false);
      
      // Call onDelete callback if provided (after everything else is done)
      if (onDelete) {
        setTimeout(() => {
          onDelete();
        }, 100);
      }
      
    } catch (error: any) {
      console.error('Error deleting event:', error);
      toast.error(`Failed to delete event: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Delete button component that will be passed to the event form
  const DeleteButton = (
    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50">
          <Trash className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </AlertDialogTrigger>
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
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-500 hover:bg-red-700"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return (
    <>
      <div onClick={() => setOpen(true)}>
        {children}
      </div>
      <UniversalDialog
        open={open}
        onOpenChange={setOpen}
        title="Edit Event"
      >
        <div className="mb-4 text-sm text-gray-500">
          All times are in {neighborhoodTimezone.replace('_', ' ')} timezone
        </div>
        <EventForm 
          onClose={() => setOpen(false)}
          initialValues={initialValues}
          eventId={event.id}
          mode="edit"
          deleteButton={DeleteButton}
          neighborhoodTimezone={neighborhoodTimezone}
        />
      </UniversalDialog>
    </>
  );
};

export default EditEventDialog;
