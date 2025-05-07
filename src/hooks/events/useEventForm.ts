
import { useState } from "react";
import { useEventSubmit } from "@/hooks/events/useEventSubmit";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Interface for the initial values of the event form
 */
export interface EventFormValues {
  title?: string;
  description?: string;
  date?: string;
  time?: string;
  location?: string;
  isRecurring?: boolean;
  recurrencePattern?: string;
  recurrenceEndDate?: string;
}

/**
 * Interface for the useEventForm hook props
 */
interface UseEventFormProps {
  initialValues?: EventFormValues;
  onClose: () => void;
  onAddEvent?: (event: any) => void;
  eventId?: string;
  mode?: 'create' | 'edit';
  neighborhoodTimezone?: string; // Add timezone parameter
}

/**
 * Custom hook to manage event form state and submission
 * 
 * This hook centralizes the form logic that was previously in the EventForm component,
 * making it reusable and easier to test.
 * 
 * @param props - Hook configuration props
 * @returns Form state and handlers for the event form
 */
export const useEventForm = ({
  initialValues = {},
  onClose,
  onAddEvent,
  eventId,
  mode = 'create',
  neighborhoodTimezone = 'America/Los_Angeles' // Default timezone
}: UseEventFormProps) => {
  // Initialize form state from initial values or defaults
  const [title, setTitle] = useState(initialValues.title || "");
  const [description, setDescription] = useState(initialValues.description || "");
  const [date, setDate] = useState(initialValues.date || "");
  const [time, setTime] = useState(initialValues.time || "");
  const [location, setLocation] = useState(initialValues.location || "");
  
  // UI-ONLY FIELDS - these are for the UI but not stored in the database yet
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
  const handleFormSubmit = (e: React.FormEvent) => {
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
      
      // Include the timezone for correct date/time handling
      timezone: neighborhoodTimezone
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

  return {
    // Form state
    title,
    setTitle,
    description,
    setDescription,
    date,
    setDate,
    time,
    setTime,
    location,
    setLocation,
    
    // Recurrence fields
    isRecurring,
    setIsRecurring,
    recurrencePattern,
    setRecurrencePattern,
    recurrenceEndDate,
    setRecurrenceEndDate,
    
    // Form handling
    handleFormSubmit,
    
    // Mode
    mode
  };
};
