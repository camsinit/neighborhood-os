
import DialogWrapper from "./dialog/DialogWrapper";
import EventForm from "./events/EventForm";
import { format } from "date-fns";

interface AddEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddEvent: (event: any) => void;
  initialDate?: Date | null;
}

/**
 * A dialog component to add new events to the community calendar
 * 
 * @param open - Whether the dialog is currently open
 * @param onOpenChange - Function to call when the open state changes
 * @param onAddEvent - Callback function when an event is added successfully
 * @param initialDate - Optional initial date to pre-fill in the form
 */
const AddEventDialog = ({ open, onOpenChange, onAddEvent, initialDate }: AddEventDialogProps) => {
  // Format the initial date for the form if provided
  const formattedDate = initialDate ? format(initialDate, 'yyyy-MM-dd') : '';
  const formattedTime = initialDate ? format(initialDate, 'HH:mm') : '';

  return (
    <DialogWrapper
      open={open}
      onOpenChange={onOpenChange}
      title="Add New Event"
    >
      <EventForm 
        onClose={() => onOpenChange(false)} 
        onAddEvent={onAddEvent}
        initialValues={{
          date: formattedDate,
          time: formattedTime
        }}
      />
    </DialogWrapper>
  );
};

export default AddEventDialog;
