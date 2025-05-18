
import { DialogFooter } from "@/components/ui/dialog";
import ActionButton from "@/components/ui/button/ActionButton";

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
 * for the event form. Uses ActionButton with calendar theme for consistency.
 */
const EventFormFooter = ({ mode, deleteButton }: EventFormFooterProps) => {
  return (
    <DialogFooter className="flex justify-between items-center gap-2 sm:justify-between">
      {deleteButton}
      <ActionButton type="submit" theme="calendar">
        {mode === 'edit' ? 'Update Event' : 'Add Event'}
      </ActionButton>
    </DialogFooter>
  );
};

export default EventFormFooter;
