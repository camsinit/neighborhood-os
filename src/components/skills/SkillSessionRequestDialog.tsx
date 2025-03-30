
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Calendar } from "@/components/ui/calendar";
import { addDays, format } from "date-fns";
import TimeSlotSelector, { TimeSlot } from "./contribution/TimeSlotSelector";

// Define the form data structure
interface SkillRequestFormData {
  description: string;
  availability: 'weekdays' | 'weekends' | 'both';
  timePreference: ('morning' | 'afternoon' | 'evening')[];
}

interface SkillSessionRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skillId: string;
  skillTitle: string;
  providerId: string;
}

const SkillSessionRequestDialog = ({
  open,
  onOpenChange,
  skillId,
  skillTitle,
  providerId,
}: SkillSessionRequestDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Add state for date selection
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<TimeSlot[]>([]);
  
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

  // Handler for date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    const formattedDate = format(date, 'yyyy-MM-dd');
    const existingSlotIndex = selectedTimeSlots.findIndex(
      slot => format(slot.date, 'yyyy-MM-dd') === formattedDate
    );

    if (existingSlotIndex === -1) {
      if (selectedTimeSlots.length < 3) {
        // Add a new date with no time preferences selected yet
        setSelectedTimeSlots([...selectedTimeSlots, { date, preferences: [] }]);
      } else {
        toast.error("Maximum 3 dates can be selected", {
          description: "Please remove a date before adding another one"
        });
      }
    } else {
      // Remove the date if clicked again
      setSelectedTimeSlots(selectedTimeSlots.filter((_, index) => index !== existingSlotIndex));
    }
  };

  const onSubmit = async (data: SkillRequestFormData) => {
    if (!user) {
      toast.error('You must be logged in to request skills');
      return;
    }

    // Make sure at least 3 dates are selected
    if (selectedTimeSlots.length < 3) {
      toast.error('Date selection required', {
        description: 'Please select exactly 3 different dates for your request'
      });
      return;
    }

    // Make sure each date has at least one time preference
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

          {/* Date Selection Section */}
          <div className="space-y-2">
            <FormLabel>Select 3 dates that work for you</FormLabel>
            <div className="border rounded-lg p-4">
              <Calendar
                mode="single"
                selected={undefined}
                onSelect={handleDateSelect}
                disabled={disabledDays}
                className="mx-auto"
              />
            </div>
          </div>

          {/* Display selected dates with time preferences */}
          <div className="space-y-4">
            {selectedTimeSlots.map((slot, index) => (
              <TimeSlotSelector
                key={format(slot.date, 'yyyy-MM-dd')}
                timeSlot={slot}
                onRemove={() => setSelectedTimeSlots(slots => 
                  slots.filter((_, i) => i !== index)
                )}
                onPreferenceChange={(timeId) => {
                  setSelectedTimeSlots(slots =>
                    slots.map((s, i) => {
                      if (i === index) {
                        const preferences = s.preferences.includes(timeId)
                          ? s.preferences.filter(p => p !== timeId)
                          : [...s.preferences, timeId];
                        return { ...s, preferences };
                      }
                      return s;
                    })
                  );
                }}
              />
            ))}
          </div>

          {/* Availability Field */}
          <FormField
            control={form.control}
            name="availability"
            render={({ field }) => (
              <FormItem>
                <FormLabel>When are you generally available?</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="weekdays" id="weekdays" />
                      <label htmlFor="weekdays">Weekdays</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="weekends" id="weekends" />
                      <label htmlFor="weekends">Weekends</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="both" id="both" />
                      <label htmlFor="both">Both weekdays and weekends</label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Time Preference Field */}
          <FormField
            control={form.control}
            name="timePreference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>What times of day generally work best for you?</FormLabel>
                <FormControl>
                  <div className="flex flex-wrap gap-4">
                    {['morning', 'afternoon', 'evening'].map((time) => (
                      <div key={time} className="flex items-center">
                        <input
                          type="checkbox"
                          id={time}
                          checked={field.value.includes(time as any)}
                          onChange={(e) => {
                            const updatedValue = e.target.checked
                              ? [...field.value, time]
                              : field.value.filter((t) => t !== time);
                            field.onChange(updatedValue);
                          }}
                          className="mr-2"
                        />
                        <label htmlFor={time} className="capitalize">
                          {time}
                        </label>
                      </div>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
