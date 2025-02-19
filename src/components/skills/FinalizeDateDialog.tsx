
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

// Helper function to generate available time slots based on preferences
const generateTimeSlots = (preferences: any) => {
  const slots: string[] = [];
  if (preferences?.morning) slots.push("9:00 AM", "10:00 AM", "11:00 AM");
  if (preferences?.afternoon) slots.push("1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM");
  if (preferences?.evening) slots.push("5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM");
  return slots;
};

interface FinalizeDateDialogProps {
  sessionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const FinalizeDateDialog = ({
  sessionId,
  open,
  onOpenChange,
}: FinalizeDateDialogProps) => {
  const user = useUser();
  const [session, setSession] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);

  useEffect(() => {
    const loadSessionData = async () => {
      if (!sessionId) return;

      try {
        const { data, error } = await supabase
          .from('skill_sessions')
          .select('*, requester:requester_id(*), provider:provider_id(*)')
          .eq('id', sessionId)
          .single();

        if (error) throw error;

        setSession(data);
        
        // Generate time slots based on overlapping preferences
        const timeSlots = generateTimeSlots(data.requester_availability);
        setAvailableTimeSlots(timeSlots);
      } catch (error) {
        console.error('Error loading session data:', error);
        toast.error("Failed to load session data");
      }
    };

    loadSessionData();
  }, [sessionId]);

  const handleSubmit = async () => {
    if (!user || !selectedDate || !selectedTime) {
      toast.error("Please select both date and time");
      return;
    }

    try {
      const finalDateTime = `${selectedDate}T${selectedTime}`;

      const { error } = await supabase
        .from('skill_sessions')
        .update({
          scheduled_time: finalDateTime,
          status: 'scheduled'
        })
        .eq('id', sessionId);

      if (error) throw error;

      toast.success("Session scheduled successfully!");
      onOpenChange(false);
    } catch (error) {
      console.error('Error scheduling session:', error);
      toast.error("Failed to schedule session");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Your Session</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Date</label>
              <input
                type="date"
                className="w-full p-2 border rounded"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Select Time</label>
              <select
                className="w-full p-2 border rounded"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
              >
                <option value="">Select a time</option>
                {availableTimeSlots.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Button onClick={handleSubmit} className="w-full">
            Schedule Session
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
