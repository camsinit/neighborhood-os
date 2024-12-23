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
        await supabase
          .from('event_rsvps')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('event_rsvps')
          .insert([
            { event_id: eventId, user_id: user.id }
          ]);
      }

      setIsRsvped(!isRsvped);
      toast(isRsvped ? "RSVP cancelled" : "Successfully RSVP'd to event!");
    } catch (error) {
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