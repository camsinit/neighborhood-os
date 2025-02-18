
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

interface SkillSessionRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skillId: string;
  providerId: string;
}

export const SkillSessionRequestDialog = ({
  open,
  onOpenChange,
  skillId,
  providerId,
}: SkillSessionRequestDialogProps) => {
  const user = useUser();
  const [availability, setAvailability] = useState({
    weekday: false,
    weekend: false,
    morning: false,
    afternoon: false,
    evening: false,
  });

  const handleSubmit = async () => {
    if (!user) {
      toast.error("You must be logged in to request a skill session");
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
      const { error } = await supabase
        .from('skill_sessions')
        .insert({
          skill_id: skillId,
          provider_id: providerId,
          requester_id: user.id,
          requester_availability: availability,
        });

      if (error) throw error;

      toast.success("Skill session request sent successfully!");
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating skill session:', error);
      toast.error("Failed to create skill session request");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Skill Session</DialogTitle>
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
            Submit Request
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
