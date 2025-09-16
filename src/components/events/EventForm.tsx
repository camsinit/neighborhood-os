
import { useEventForm } from "@/hooks/events/useEventForm";
import EventFormBasicFields from "./form/EventFormBasicFields";
import EventFormRecurrenceFields from "./form/EventFormRecurrenceFields";
import EventFormFooter from "./form/EventFormFooter";
import { EventFormProps } from "./types/eventFormTypes";

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
  deleteButton,
  neighborhoodTimezone = 'America/Los_Angeles'
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
    groupId,
    setGroupId,
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
    mode,
    neighborhoodTimezone, // Pass the neighborhood timezone to the event form hook
    selectedGroupId: initialValues?.groupId // Pass pre-selected group if any
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
        selectedGroupId={groupId}
        onGroupChange={setGroupId}
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
