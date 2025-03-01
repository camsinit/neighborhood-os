
import DialogWrapper from "./dialog/DialogWrapper";
import SafetyUpdateForm from "./safety/SafetyUpdateForm";

/**
 * AddSafetyUpdateDialog component
 * 
 * Dialog for sharing safety updates in the community.
 * Uses the universal DialogWrapper component for consistent styling.
 */
interface AddSafetyUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddSafetyUpdateDialog = ({ open, onOpenChange }: AddSafetyUpdateDialogProps) => {
  return (
    <DialogWrapper
      open={open}
      onOpenChange={onOpenChange}
      title="Share Safety Update"
      maxWidth="sm"
    >
      <SafetyUpdateForm onClose={() => onOpenChange(false)} />
    </DialogWrapper>
  );
};

export default AddSafetyUpdateDialog;
