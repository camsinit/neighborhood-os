
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUser } from "@supabase/auth-helpers-react";
import { useQueryClient } from "@tanstack/react-query";
import refreshEvents, { dispatchRefreshEvent } from "@/utils/refreshEvents";

/**
 * DeleteEventButton component
 * 
 * This button allows event hosts to delete their events and automatically refreshes
 * the calendar view to reflect the deletion without requiring a page reload.
 * 
 * @param eventId - ID of the event to delete
 * @param hostId - ID of the event host
 * @param eventTitle - Title of the event (for notifications)
 * @param onDelete - Optional callback function after successful deletion
 * @param onSheetClose - Optional callback to close parent sheet when event is deleted
 */
interface DeleteEventButtonProps {
  eventId: string;
  hostId: string;
  eventTitle: string;
  onDelete?: () => void;
  onSheetClose?: () => void; 
}

const DeleteEventButton = ({ 
  eventId, 
  hostId, 
  eventTitle, 
  onDelete, 
  onSheetClose 
}: DeleteEventButtonProps) => {
  // State to track the loading state of the delete operation
  const [isLoading, setIsLoading] = useState(false);
  
  // Get the current authenticated user
  const user = useUser();
  
  // Get the query client for cache invalidation
  const queryClient = useQueryClient();

  /**
   * Handle delete button click
   * This function ensures the sheet is closed first, then deletes the event
   */
  const handleDelete = async () => {
    // Check if the user is authorized to delete this event
    if (!user || user.id !== hostId) {
      toast.error("You don't have permission to delete this event");
      return;
    }
    
    // First close the sheet if a callback is provided
    // This ensures the UI remains interactive
    if (onSheetClose) {
      onSheetClose();
    }

    // Short timeout to allow sheet animation to complete
    // This prevents the UI from becoming unresponsive
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Set loading state while performing the deletion
    setIsLoading(true);
    
    try {
      // Delete the event
      const { error: deleteError } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (deleteError) {
        console.error('Error deleting event:', deleteError);
        throw new Error(deleteError.message);
      }

      // If event deletion was successful, notify RSVP'd users
      try {
        const { error } = await supabase.functions.invoke('notify-event-changes', {
          body: {
            eventId,
            action: 'delete',
            eventTitle,
          },
        });

        if (error) {
          console.error('Error notifying users:', error);
        }
      } catch (notifyError) {
        // If notification fails, we still consider the deletion successful
        console.error('Error notifying users:', notifyError);
      }

      // Show success message
      toast.success("Event deleted successfully");
      
      // Invalidate and refetch the events query to update the UI
      queryClient.invalidateQueries({ queryKey: ['events'] });
      
      // Dispatch a custom event to trigger data refresh in components listening for this event
      dispatchRefreshEvent('events-updated');
      
      // Call onDelete callback if provided (after sheet has closed)
      if (onDelete) onDelete();
      
    } catch (error) {
      console.error('Error in delete operation:', error);
      toast.error("Failed to delete event. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render the button if the user doesn't have permission
  if (!user || user.id !== hostId) return null;

  // Render the delete button
  return (
    <Button
      variant="destructive"
      onClick={handleDelete}
      disabled={isLoading}
      className="flex items-center gap-2"
    >
      <Trash2 className="h-4 w-4" />
      Delete Event
    </Button>
  );
};

export default DeleteEventButton;
