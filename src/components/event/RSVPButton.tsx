
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
    if (user) {
      checkRsvpStatus();
    }
  }, [user, eventId]);

  const checkRsvpStatus = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('event_rsvps')
      .select()
      .eq('event_id', eventId)
      .eq('user_id', user.id)
      .maybeSingle();

    setIsRsvped(!!data);
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
        await supabase
          .from('event_rsvps')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', user.id);

        // Delete the notification
        await supabase
          .from('notifications')
          .delete()
          .eq('content_id', eventId)
          .eq('user_id', user.id)
          .eq('content_type', 'event_rsvp');

      } else {
        // Create RSVP
        await supabase
          .from('event_rsvps')
          .insert([
            { event_id: eventId, user_id: user.id }
          ]);

        // Create notification with correct types and required fields
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: user.id,
            actor_id: user.id, // Required field that was missing
            title: "Event RSVP Confirmation",
            content_type: 'event_rsvp',
            content_id: eventId,
            notification_type: 'event', // Changed from 'events' to 'event' to match the enum
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
