
import DialogWrapper from "./dialog/DialogWrapper";
import EventForm from "./events/EventForm";
import { format } from "date-fns";

interface AddEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddEvent: (event: any) => void;
  initialDate?: Date | null;
}

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
