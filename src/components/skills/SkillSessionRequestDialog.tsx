
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

// Define the type for our availability state
interface Availability {
  weekday: boolean;
  weekend: boolean;
  morning: boolean;
  afternoon: boolean;
  evening: boolean;
}

interface SkillSessionRequestDialogProps {
  sessionId: string | null;
  onOpenChange: (open: boolean) => void;
}

export const SkillSessionRequestDialog = ({
  sessionId,
  onOpenChange,
}: SkillSessionRequestDialogProps) => {
  const user = useUser();
  const [availability, setAvailability] = useState<Availability>({
    weekday: false,
    weekend: false,
    morning: false,
    afternoon: false,
    evening: false,
  });

  // Load existing session data when dialog opens
  useEffect(() => {
    const loadSessionData = async () => {
      if (!sessionId) return;

      try {
        const { data, error } = await supabase
          .from('skill_sessions')
          .select('*')
          .eq('id', sessionId)
          .single();

        if (error) throw error;

        // Safely parse the requester_availability data
        if (data?.requester_availability) {
          const parsedAvailability = typeof data.requester_availability === 'string' 
            ? JSON.parse(data.requester_availability) 
            : data.requester_availability;

          // Ensure all required boolean fields exist
          const validatedAvailability: Availability = {
            weekday: Boolean(parsedAvailability?.weekday),
            weekend: Boolean(parsedAvailability?.weekend),
            morning: Boolean(parsedAvailability?.morning),
            afternoon: Boolean(parsedAvailability?.afternoon),
            evening: Boolean(parsedAvailability?.evening),
          };

          setAvailability(validatedAvailability);
        }
      } catch (error) {
        console.error('Error loading session data:', error);
        toast.error("Failed to load session data");
      }
    };

    loadSessionData();
  }, [sessionId]);

  const handleSubmit = async () => {
    if (!user) {
      toast.error("You must be logged in to update availability");
      return;
    }

    if (!sessionId) {
      toast.error("No session found");
      return;
    }

    // Validate that at least one time and day is selected
    if (!availability.weekday && !availability.weekend) {
      toast.error("Please select at least one day preference");
      return;
    }
    if (!availability.morning && !availability.afternoon && !availability.evening) {
      toast.error("Please select at least one time preference");
      return;
    }

    try {
      // Convert Availability type to a plain object that matches Json type
      const availabilityJson: { [key: string]: boolean } = {
        weekday: availability.weekday,
        weekend: availability.weekend,
        morning: availability.morning,
        afternoon: availability.afternoon,
        evening: availability.evening,
      };

      const { error } = await supabase
        .from('skill_sessions')
        .update({
          requester_availability: availabilityJson,
        })
        .eq('id', sessionId);

      if (error) throw error;

      toast.success("Availability updated successfully!");
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating availability:', error);
      toast.error("Failed to update availability");
    }
  };

  return (
    <Dialog open={!!sessionId} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Your Availability</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Days Available</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="weekday"
                    checked={availability.weekday}
                    onCheckedChange={(checked) => 
                      setAvailability(prev => ({ ...prev, weekday: !!checked }))
                    }
                  />
                  <Label htmlFor="weekday">Weekdays</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="weekend"
                    checked={availability.weekend}
                    onCheckedChange={(checked) => 
                      setAvailability(prev => ({ ...prev, weekend: !!checked }))
                    }
                  />
                  <Label htmlFor="weekend">Weekends</Label>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Times Available</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="morning"
                    checked={availability.morning}
                    onCheckedChange={(checked) => 
                      setAvailability(prev => ({ ...prev, morning: !!checked }))
                    }
                  />
                  <Label htmlFor="morning">Morning (8am - 12pm)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="afternoon"
                    checked={availability.afternoon}
                    onCheckedChange={(checked) => 
                      setAvailability(prev => ({ ...prev, afternoon: !!checked }))
                    }
                  />
                  <Label htmlFor="afternoon">Afternoon (12pm - 5pm)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="evening"
                    checked={availability.evening}
                    onCheckedChange={(checked) => 
                      setAvailability(prev => ({ ...prev, evening: !!checked }))
                    }
                  />
                  <Label htmlFor="evening">Evening (5pm - 9pm)</Label>
                </div>
              </div>
            </div>
          </div>

          <Button onClick={handleSubmit} className="w-full">
            Submit Availability
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
