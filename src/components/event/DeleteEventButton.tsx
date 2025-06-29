
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUser } from "@supabase/auth-helpers-react";
import { useQueryClient } from "@tanstack/react-query";
import { unifiedEvents } from "@/utils/unifiedEventSystem";

/**
 * DeleteEventButton component
 * 
 * This button allows event hosts to delete their events and automatically refreshes
 * the calendar view to reflect the deletion without requiring a page reload.
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
  const [isLoading, setIsLoading] = useState(false);
  const user = useUser();
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    if (!user || user.id !== hostId) {
      toast.error("You don't have permission to delete this event");
      return;
    }
    
    if (onSheetClose) {
      onSheetClose();
    }

    await new Promise(resolve => setTimeout(resolve, 100));
    setIsLoading(true);
    
    try {
      const { error: deleteError } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (deleteError) {
        console.error('Error deleting event:', deleteError);
        throw new Error(deleteError.message);
      }

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
        console.error('Error notifying users:', notifyError);
      }

      toast.success("Event deleted successfully");
      queryClient.invalidateQueries({ queryKey: ['events'] });
      unifiedEvents.emit('events');
      
      if (onDelete) onDelete();
      
    } catch (error) {
      console.error('Error in delete operation:', error);
      toast.error("Failed to delete event. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || user.id !== hostId) return null;

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
