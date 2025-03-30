
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import DialogWrapper from "@/components/dialog/DialogWrapper";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { addDays } from "date-fns";
import { TimeSlot } from "./contribution/TimeSlotSelector";
import TimeSlotSelectionSection from "./TimeSlotSelectionSection";
import GeneralAvailabilitySection from "./GeneralAvailabilitySection";

/**
 * Define the form data structure
 */
interface SkillRequestFormData {
  description: string;
  availability: 'weekdays' | 'weekends' | 'both';
  timePreference: ('morning' | 'afternoon' | 'evening')[];
}

/**
 * Props for the dialog component
 */
interface SkillSessionRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skillId: string;
  skillTitle: string;
  providerId: string;
}

/**
 * A dialog component for requesting a skill session
 * 
 * This component allows users to:
 * 1. Describe what they need help with
 * 2. Select specific dates and time preferences
 * 3. Specify general availability patterns
 */
const SkillSessionRequestDialog = ({
  open,
  onOpenChange,
  skillId,
  skillTitle,
  providerId,
}: SkillSessionRequestDialogProps) => {
  // State management
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<TimeSlot[]>([]);
  
  // Hooks
  const user = useUser();
  const queryClient = useQueryClient();

  // Initialize form
  const form = useForm<SkillRequestFormData>({
    defaultValues: {
      description: '',
      availability: 'both',
      timePreference: ['morning', 'afternoon', 'evening'],
    },
  });

  // Settings for the date picker
  const disabledDays = {
    before: new Date(),
    after: addDays(new Date(), 90) // Limit date selection to 90 days in the future
  };

  /**
   * Handles the form submission
   * Creates a skill session and time slots in the database
   */
  const onSubmit = async (data: SkillRequestFormData) => {
    // Check user authentication
    if (!user) {
      toast.error('You must be logged in to request skills');
      return;
    }

    // Validate date selection
    if (selectedTimeSlots.length < 3) {
      toast.error('Date selection required', {
        description: 'Please select exactly 3 different dates for your request'
      });
      return;
    }

    // Validate time preferences
    if (selectedTimeSlots.some(slot => slot.preferences.length === 0)) {
      toast.error('Time preferences required', {
        description: 'Please select at least one time preference for each selected date'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // First create the skill session
      const { data: session, error: sessionError } = await supabase
        .from('skill_sessions')
        .insert({
          skill_id: skillId,
          provider_id: providerId,
          requester_id: user.id,
          requester_availability: {
            availability: data.availability,
            timePreference: data.timePreference,
            description: data.description,
          },
          status: 'pending_provider_times',
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Then create time slots for the selected dates
      const timeSlotPromises = selectedTimeSlots.flatMap(slot =>
        slot.preferences.map(preference => ({
          session_id: session.id,
          proposed_time: new Date(slot.date.setHours(
            preference === 'morning' ? 9 :
            preference === 'afternoon' ? 13 :
            18
          )).toISOString(),
        }))
      );

      // Insert the time slots
      const { error: timeSlotError } = await supabase
        .from('skill_session_time_slots')
        .insert(timeSlotPromises);

      if (timeSlotError) throw timeSlotError;

      // Show success message and update UI
      toast.success('Skill request submitted successfully');
      queryClient.invalidateQueries({ queryKey: ['skills-exchange'] });
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error submitting skill request:', error);
      toast.error('Request submission failed', {
        description: error.message || 'Failed to submit skill request. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogWrapper
      open={open}
      onOpenChange={onOpenChange}
      title={`Request Help with: ${skillTitle}`}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Description Field */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>What do you need help with?</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe what you'd like to learn or get help with..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Date and Time Selection Section */}
          <TimeSlotSelectionSection
            selectedTimeSlots={selectedTimeSlots}
            setSelectedTimeSlots={setSelectedTimeSlots}
            disabledDays={disabledDays}
          />

          {/* General Availability Section */}
          <GeneralAvailabilitySection form={form} />

          {/* Form Controls */}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </Form>
    </DialogWrapper>
  );
};

export default SkillSessionRequestDialog;
