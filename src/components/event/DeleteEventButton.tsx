import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUser } from "@supabase/auth-helpers-react";

interface DeleteEventButtonProps {
  eventId: string;
  hostId: string;
  eventTitle: string;
  onDelete?: () => void;
}

const DeleteEventButton = ({ eventId, hostId, eventTitle, onDelete }: DeleteEventButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const user = useUser();

  const handleDelete = async () => {
    if (!user || user.id !== hostId) {
      toast.error("You don't have permission to delete this event");
      return;
    }

    setIsLoading(true);
    try {
      // First delete the event
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
        const { data: sessionData } = await supabase.auth.getSession();
        const anonKey = supabase.supabaseKey;
        
        await fetch('/functions/v1/notify-event-changes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${anonKey}`,
          },
          body: JSON.stringify({
            eventId,
            action: 'delete',
            eventTitle,
          }),
        });
      } catch (notifyError) {
        // If notification fails, we still consider the deletion successful
        console.error('Error notifying users:', notifyError);
      }

      toast.success("Event deleted successfully");
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