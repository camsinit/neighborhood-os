
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

/**
 * Props for the EventFormFooter component
 */
interface EventFormFooterProps {
  mode: 'create' | 'edit';
  deleteButton?: React.ReactNode;
}

/**
 * Component that renders the footer of the event form
 * 
 * This component contains the submission buttons and optional delete button
 * for the event form.
 */
const EventFormFooter = ({ mode, deleteButton }: EventFormFooterProps) => {
  return (
    <DialogFooter className="flex justify-between items-center gap-2 sm:justify-between">
      {deleteButton}
      <Button type="submit">
        {mode === 'edit' ? 'Update Event' : 'Add Event'}
      </Button>
    </DialogFooter>
  );
};

export default EventFormFooter;
