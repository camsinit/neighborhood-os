import DialogWrapper from "./dialog/DialogWrapper";
import EventForm from "./events/EventForm";

interface AddEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddEvent: (event: any) => void;
}

const AddEventDialog = ({ open, onOpenChange, onAddEvent }: AddEventDialogProps) => {
  return (
    <DialogWrapper
      open={open}
      onOpenChange={onOpenChange}
      title="Add New Event"
    >
      <EventForm onClose={() => onOpenChange(false)} onAddEvent={onAddEvent} />
    </DialogWrapper>
  );
};

export default AddEventDialog;