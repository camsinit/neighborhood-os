
/**
 * Interface for event form values
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
 * Interface for the event form props
 */
export interface EventFormProps {
  onClose: () => void;
  onAddEvent?: (event: any) => void;
  initialValues?: EventFormValues;
  eventId?: string; // This is the primary key (id)
  event_id?: string; // This is the redundant ID field
  mode?: 'create' | 'edit';
  deleteButton?: React.ReactNode;
}
