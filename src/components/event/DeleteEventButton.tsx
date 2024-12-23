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
      // Notify RSVP'd users about the cancellation
      await fetch('/functions/v1/notify-event-changes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          eventId,
          action: 'delete',
          eventTitle,
        }),
      });

      // Delete the event
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      toast.success("Event deleted successfully");
      if (onDelete) onDelete();
    } catch (error) {
      toast.error("Failed to delete event");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || user.id !== hostId) return null;

  return (
    <Button
      variant="destructive"
      size="icon"
      onClick={handleDelete}
      disabled={isLoading}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
};

export default DeleteEventButton;