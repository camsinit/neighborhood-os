
import { useEventForm } from "@/hooks/events/useEventForm";
import EventFormBasicFields from "./form/EventFormBasicFields";
import EventFormRecurrenceFields from "./form/EventFormRecurrenceFields";
import EventFormFooter from "./form/EventFormFooter";

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
  // Use our custom hook to manage form state and submission
  const {
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
    isRecurring,
    setIsRecurring,
    recurrencePattern,
    setRecurrencePattern,
    recurrenceEndDate,
    setRecurrenceEndDate,
    handleFormSubmit,
    mode: formMode
  } = useEventForm({
    initialValues,
    onClose,
    onAddEvent,
    eventId,
    mode
  });

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      {/* Basic Fields Component */}
      <EventFormBasicFields
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
        date={date}
        setDate={setDate}
        time={time}
        setTime={setTime}
        location={location}
        setLocation={setLocation}
      />
      
      {/* Recurrence Fields Component */}
      <EventFormRecurrenceFields
        isRecurring={isRecurring}
        setIsRecurring={setIsRecurring}
        recurrencePattern={recurrencePattern}
        setRecurrencePattern={setRecurrencePattern}
        recurrenceEndDate={recurrenceEndDate}
        setRecurrenceEndDate={setRecurrenceEndDate}
      />
      
      {/* Form Buttons */}
      <EventFormFooter mode={formMode} deleteButton={deleteButton} />
    </form>
  );
};

export default EventForm;
