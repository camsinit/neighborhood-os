
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";
import { useEventSubmit } from "@/hooks/events/useEventSubmit";
import { useQueryClient } from "@tanstack/react-query";

interface EventFormProps {
  onClose: () => void;
  onAddEvent?: (event: any) => void;
  initialValues?: {
    title?: string;
    description?: string;
    date?: string;
    time?: string;
    location?: string;
    isRecurring?: boolean;
    recurrencePattern?: string;
    recurrenceEndDate?: string;
  };
  eventId?: string;
  mode?: 'create' | 'edit';
  deleteButton?: React.ReactNode;
}

const EventForm = ({ 
  onClose, 
  onAddEvent, 
  initialValues = {},
  eventId,
  mode = 'create',
  deleteButton
}: EventFormProps) => {
  const [title, setTitle] = useState(initialValues.title || "");
  const [description, setDescription] = useState(initialValues.description || "");
  const [date, setDate] = useState(initialValues.date || "");
  const [time, setTime] = useState(initialValues.time || "");
  const [location, setLocation] = useState(initialValues.location || "");
  const [isRecurring, setIsRecurring] = useState(initialValues.isRecurring || false);
  const [recurrencePattern, setRecurrencePattern] = useState(initialValues.recurrencePattern || "weekly");
  const [recurrenceEndDate, setRecurrenceEndDate] = useState(initialValues.recurrenceEndDate || "");
  
  const queryClient = useQueryClient();
  
  const { handleSubmit, handleUpdate } = useEventSubmit({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      onClose();
      if (onAddEvent && mode === 'create') {
        onAddEvent({
          title,
          description,
          date,
          time,
          location,
          isRecurring,
          recurrencePattern,
          recurrenceEndDate,
        });
      }
    }
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = {
      title,
      description,
      date,
      time,
      location,
      isRecurring,
      recurrencePattern,
      recurrenceEndDate,
    };

    if (mode === 'edit' && eventId) {
      handleUpdate(eventId, formData);
    } else {
      handleSubmit(formData);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Event Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="time">Time</Label>
          <Input
            id="time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="recurring"
          checked={isRecurring}
          onCheckedChange={setIsRecurring}
        />
        <Label htmlFor="recurring">Recurring Event</Label>
      </div>
      {isRecurring && (
        <>
          <div className="space-y-2">
            <Label>Recurrence Pattern</Label>
            <RadioGroup
              value={recurrencePattern}
              onValueChange={setRecurrencePattern}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="daily" id="daily" />
                <Label htmlFor="daily">Daily</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="weekly" id="weekly" />
                <Label htmlFor="weekly">Weekly</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="monthly" id="monthly" />
                <Label htmlFor="monthly">Monthly</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={recurrenceEndDate}
              onChange={(e) => setRecurrenceEndDate(e.target.value)}
              required={isRecurring}
            />
          </div>
        </>
      )}
      <DialogFooter className="flex justify-between items-center gap-2 sm:justify-between">
        {deleteButton}
        <Button type="submit">
          {mode === 'edit' ? 'Update Event' : 'Add Event'}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default EventForm;
