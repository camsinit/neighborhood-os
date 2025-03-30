
import { useState, useEffect } from "react";
import { format, parseISO, addDays } from "date-fns";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSkillSessionEvents } from "@/hooks/skills/useSkillSessionEvents";
import { useQueryClient } from "@tanstack/react-query";
import UniversalDialog from "@/components/ui/universal-dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/**
 * Helper function to generate available time slots based on preferences
 * This takes the user's preferences and creates appropriate time options
 */
const generateTimeSlots = (preferences: any) => {
  // Create an array to hold all our time options
  const slots: string[] = [];
  
  // Add appropriate time slots based on morning/afternoon/evening preferences
  if (preferences?.timePreference?.includes('morning')) {
    slots.push("09:00", "10:00", "11:00");
  }
  if (preferences?.timePreference?.includes('afternoon')) {
    slots.push("13:00", "14:00", "15:00", "16:00");
  }
  if (preferences?.timePreference?.includes('evening')) {
    slots.push("17:00", "18:00", "19:00", "20:00");
  }
  
  // If no specific preferences were found, provide a default set of times
  if (slots.length === 0) {
    slots.push("09:00", "12:00", "15:00", "18:00");
  }
  
  return slots;
};

/**
 * Props for the FinalizeDateDialog component
 */
interface FinalizeDateDialogProps {
  sessionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Dialog component for finalizing the date and time of a skill session
 * This component allows users to:
 * 1. Select a specific date
 * 2. Choose from available time slots based on preferences
 * 3. Schedule the session and create a calendar event
 */
export const FinalizeDateDialog = ({
  sessionId,
  open,
  onOpenChange,
}: FinalizeDateDialogProps) => {
  // State management
  const user = useUser();
  const [session, setSession] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Hooks
  const { scheduleSkillSession } = useSkillSessionEvents();
  const queryClient = useQueryClient();

  /**
   * Load session data when the dialog opens
   */
  useEffect(() => {
    const loadSessionData = async () => {
      if (!sessionId) return;

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('skill_sessions')
          .select(`
            *,
            requester:requester_id(*),
            provider:provider_id(*),
            skill:skill_id(*)
          `)
          .eq('id', sessionId)
          .single();

        if (error) throw error;

        setSession(data);
        
        // Generate appropriate time slots based on requester's availability
        const timeSlots = generateTimeSlots(data.requester_availability);
        setAvailableTimeSlots(timeSlots);
        
        // Reset selected values when dialog reopens
        setSelectedDate(undefined);
        setSelectedTime("");
      } catch (error) {
        console.error('Error loading session data:', error);
        toast.error("Failed to load session data", {
          description: "Please try again or contact support if the issue persists."
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (open) {
      loadSessionData();
    }
  }, [sessionId, open]);

  /**
   * Handle calendar date selection
   */
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  /**
   * Open confirmation dialog before finalizing the session
   */
  const handleProceedToConfirm = () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Please select both date and time", {
        description: "Both fields are required to schedule the session"
      });
      return;
    }
    
    setIsConfirmDialogOpen(true);
  };

  /**
   * Final submission to schedule the skill session
   */
  const handleSubmit = async () => {
    if (!user || !selectedDate || !selectedTime || !session) {
      toast.error("Missing required information", {
        description: "Please select both date and time"
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Construct the full date-time ISO string
      const eventDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':').map(Number);
      eventDateTime.setHours(hours, minutes, 0, 0);
      
      // Create calendar event for the skill session
      const eventId = await scheduleSkillSession({
        sessionId: session.id,
        skillId: session.skill_id,
        skillTitle: session.skill?.title || "Skill Session",
        providerId: session.provider_id,
        requesterId: session.requester_id,
        eventDateTime: eventDateTime,
        neighborhoodId: session.skill?.neighborhood_id
      });

      if (!eventId) {
        throw new Error("Failed to create calendar event");
      }
      
      // Update the session status to confirmed
      const { error } = await supabase
        .from('skill_sessions')
        .update({
          status: 'confirmed',
          event_id: eventId
        })
        .eq('id', sessionId);

      if (error) throw error;

      // Success feedback
      toast.success("Session scheduled successfully!", {
        description: "The session has been added to your calendar"
      });
      
      // Refresh relevant data
      queryClient.invalidateQueries({ queryKey: ['skill-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['skills-exchange'] });
      
      // Close dialogs
      setIsConfirmDialogOpen(false);
      onOpenChange(false);
    } catch (error) {
      console.error('Error scheduling session:', error);
      toast.error("Failed to schedule session", {
        description: "Please try again or contact support"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Determine the earliest selectable date (today)
  const today = new Date();
  
  // Disable past dates and dates more than 90 days in the future
  const disabledDays = {
    before: today,
    after: addDays(today, 90)
  };

  return (
    <>
      <UniversalDialog
        open={open}
        onOpenChange={onOpenChange}
        title="Schedule Your Skill Session"
        description="Select a date and time that works for both of you"
        maxWidth="md"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleProceedToConfirm} 
              disabled={!selectedDate || !selectedTime || isLoading}
            >
              {isLoading ? "Loading..." : "Schedule Session"}
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Date selection with calendar */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Select Date</label>
            <div className="border rounded-lg p-2">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={disabledDays}
                className="mx-auto"
              />
            </div>
          </div>

          {/* Time selection dropdown */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Select Time</label>
            <select
              className="w-full p-2 border rounded"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              disabled={!selectedDate || isLoading}
            >
              <option value="">Select a time</option>
              {availableTimeSlots.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>
          
          {/* Session details */}
          {session && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <h3 className="font-semibold">Session Details</h3>
              <p className="text-sm">
                <span className="font-medium">Skill:</span> {session.skill?.title || "Skill Session"}
              </p>
              <p className="text-sm">
                <span className="font-medium">With:</span> {session.requester?.display_name || "Neighbor"}
              </p>
            </div>
          )}
        </div>
      </UniversalDialog>
      
      {/* Confirmation Dialog */}
      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Session Scheduling</AlertDialogTitle>
            <AlertDialogDescription>
              You're about to schedule a skill session for{" "}
              {selectedDate && format(selectedDate, "MMMM d, yyyy")} at{" "}
              {selectedTime}. This will create a calendar event and notify the requester.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "Scheduling..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
