
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";

interface RSVPButtonProps {
  eventId: string;
}

const RSVPButton = ({ eventId }: RSVPButtonProps) => {
  const [isRsvped, setIsRsvped] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const user = useUser();

  useEffect(() => {
    if (user && eventId) {
      checkRsvpStatus();
    }
  }, [user, eventId]);

  const checkRsvpStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('event_rsvps')
        .select()
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error checking RSVP status:', error);
        return;
      }

      setIsRsvped(!!data);
    } catch (error) {
      console.error('Error checking RSVP status:', error);
    }
  };

  const handleRSVP = async () => {
    if (!user) {
      toast.error("Please log in to RSVP");
      return;
    }

    setIsLoading(true);
    try {
      if (isRsvped) {
        // Cancel RSVP
        const { error: deleteError } = await supabase
          .from('event_rsvps')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', user.id);

        if (deleteError) throw deleteError;

        // Delete the notification
        await supabase
          .from('notifications')
          .delete()
          .eq('content_id', eventId)
          .eq('user_id', user.id)
          .eq('content_type', 'event_rsvp');

      } else {
        // Create RSVP
        const { error: rsvpError } = await supabase
          .from('event_rsvps')
          .insert({
            event_id: eventId,
            user_id: user.id
          });

        if (rsvpError) throw rsvpError;

        // Create notification
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: user.id,
            actor_id: user.id,
            title: "Event RSVP Confirmation",
            content_type: 'event_rsvp',
            content_id: eventId,
            notification_type: 'event',
            action_type: 'view',
            action_label: 'View Event',
            metadata: {
              event_id: eventId,
              rsvp_status: 'confirmed'
            }
          });

        if (notificationError) throw notificationError;
      }

      setIsRsvped(!isRsvped);
      toast(isRsvped ? "RSVP cancelled" : "Successfully RSVP'd to event!");
    } catch (error) {
      console.error('Error updating RSVP:', error);
      toast.error("Failed to update RSVP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant={isRsvped ? "destructive" : "default"}
      className="flex-1"
      onClick={handleRSVP}
      disabled={isLoading}
    >
      {isRsvped ? "Cancel RSVP" : "RSVP"}
    </Button>
  );
};

export default RSVPButton;
