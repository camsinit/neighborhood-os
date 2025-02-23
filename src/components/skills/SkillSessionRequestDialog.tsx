
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useUser } from '@supabase/auth-helpers-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import DialogWrapper from '@/components/dialog/DialogWrapper';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

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

  const onSubmit = async (data: SkillRequestFormData) => {
    if (!user) {
      toast.error('You must be logged in to request skills');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create a new skill session
      const { error } = await supabase
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
        });

      if (error) throw error;

      toast.success('Skill request submitted successfully');
      queryClient.invalidateQueries({ queryKey: ['skills-exchange'] });
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting skill request:', error);
      toast.error('Failed to submit skill request. Please try again.');
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
                <FormLabel>What times of day work best for you?</FormLabel>
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
