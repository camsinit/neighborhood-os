
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
import { format } from "date-fns";

/**
 * Interface for the EventForm component props
 * 
 * @param onClose - Function to call when the form should close
 * @param onAddEvent - Optional callback for when an event is added
 * @param initialValues - Optional initial values for the form fields
 * @param eventId - Optional ID if editing an existing event
 * @param mode - Whether we're creating or editing an event
 * @param deleteButton - Optional delete button component
 */
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

/**
 * EventForm component for creating and editing events
 * 
 * Handles both database fields (title, description, date, time, location)
 * and UI-only fields for future features (isRecurring, recurrencePattern, recurrenceEndDate)
 */
const EventForm = ({ 
  onClose, 
  onAddEvent, 
  initialValues = {},
  eventId,
  mode = 'create',
  deleteButton
}: EventFormProps) => {
  // Initialize form state from initial values or defaults
  // DATABASE FIELDS - these will be saved to the database
  const [title, setTitle] = useState(initialValues.title || "");
  const [description, setDescription] = useState(initialValues.description || "");
  const [date, setDate] = useState(initialValues.date || "");
  const [time, setTime] = useState(initialValues.time || "");
  const [location, setLocation] = useState(initialValues.location || "");
  
  // UI-ONLY FIELDS - these are for the UI but not stored in the database yet
  // They're kept separate from database fields to avoid schema validation errors
  const [isRecurring, setIsRecurring] = useState(initialValues.isRecurring || false);
  const [recurrencePattern, setRecurrencePattern] = useState(initialValues.recurrencePattern || "weekly");
  const [recurrenceEndDate, setRecurrenceEndDate] = useState(initialValues.recurrenceEndDate || "");
  
  const queryClient = useQueryClient();
  
  // Use the event submission hook
  const { handleSubmit, handleUpdate } = useEventSubmit({
    onSuccess: () => {
      // Invalidate query cache to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['events'] });
      
      // Close the dialog
      onClose();
      
      // If callback exists and we're creating a new event
      if (onAddEvent && mode === 'create') {
        onAddEvent({
          title,
          description,
          date,
          time,
          location,
          // Include UI-only fields in the callback for completeness
          // (even though they won't be stored in the DB yet)
          isRecurring,
          recurrencePattern,
          recurrenceEndDate,
        });
      }
    }
  });

  /**
   * Form submission handler
   * 
   * Collects form data and calls the appropriate submit/update handler
   */
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Collect form data including UI-only fields
    const formData = {
      // DATABASE FIELDS - these will be sent to the database
      title,
      description,
      date,
      time,
      location,
      
      // UI-ONLY FIELDS - these won't be stored in the database
      // but are included here for future functionality
      isRecurring,
      recurrencePattern,
      recurrenceEndDate,
    };

    // Log the form data to help with debugging
    console.log("[EventForm] Submitting form data:", {
      ...formData,
      mode,
      eventId: eventId || 'new',
      timestamp: new Date().toISOString()
    });

    if (mode === 'edit' && eventId) {
      handleUpdate(eventId, formData);
    } else {
      handleSubmit(formData);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Event Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Event Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Enter event title"
        />
      </div>
      
      {/* Event Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          placeholder="Describe your event"
          className="min-h-[100px]"
        />
      </div>
      
      {/* Event Date and Time */}
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
      
      {/* Event Location */}
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
          placeholder="Where will this event take place?"
        />
      </div>
      
      {/* Recurring Event Toggle - UI only feature (not stored in DB yet) */}
      <div className="flex items-center space-x-2">
        <Switch
          id="recurring"
          checked={isRecurring}
          onCheckedChange={setIsRecurring}
        />
        <Label htmlFor="recurring">Recurring Event</Label>
      </div>
      
      {/* Recurrence Options (shown only if event is recurring) - UI only feature */}
      {isRecurring && (
        <>
          <div className="space-y-2 pl-6 border-l-2 border-gray-100">
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
          <div className="space-y-2 pl-6 border-l-2 border-gray-100">
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
      
      {/* Form Buttons */}
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
