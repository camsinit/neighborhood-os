import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";

interface EventSubmitProps {
  onSuccess: () => void;
}

interface EventFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  isRecurring?: boolean;
  recurrencePattern?: string;
  recurrenceEndDate?: string;
}

export const useEventSubmit = ({ onSuccess }: EventSubmitProps) => {
  const user = useUser();

  const handleSubmit = async (formData: EventFormData) => {
    if (!user) {
      toast.error("You must be logged in to create an event");
      return;
    }

    try {
      const timestamp = new Date(`${formData.date}T${formData.time}`).toISOString();

      const { error } = await supabase
        .from('events')
        .insert({
          title: formData.title,
          description: formData.description,
          time: timestamp,
          location: formData.location,
          host_id: user.id,
          is_recurring: formData.isRecurring || false,
          recurrence_pattern: formData.recurrencePattern,
          recurrence_end_date: formData.recurrenceEndDate ? new Date(`${formData.recurrenceEndDate}T23:59:59`).toISOString() : null,
        });

      if (error) throw error;

      toast.success("Event created successfully");
      onSuccess();
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error("Failed to create event. Please try again.");
    }
  };

  const handleUpdate = async (eventId: string, formData: EventFormData) => {
    if (!user) {
      toast.error("You must be logged in to update an event");
      return;
    }

    try {
      const timestamp = new Date(`${formData.date}T${formData.time}`).toISOString();

      const { error } = await supabase
        .from('events')
        .update({
          title: formData.title,
          description: formData.description,
          time: timestamp,
          location: formData.location,
          is_recurring: formData.isRecurring || false,
          recurrence_pattern: formData.recurrencePattern,
          recurrence_end_date: formData.recurrenceEndDate ? new Date(`${formData.recurrenceEndDate}T23:59:59`).toISOString() : null,
        })
        .eq('id', eventId);

      if (error) throw error;

      // Notify RSVP'd users about the update
      await fetch('/functions/v1/notify-event-changes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          eventId,
          action: 'update',
          eventTitle: formData.title,
        }),
      });

      toast.success("Event updated successfully");
      onSuccess();
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error("Failed to update event. Please try again.");
    }
  };

  return { handleSubmit, handleUpdate };
};