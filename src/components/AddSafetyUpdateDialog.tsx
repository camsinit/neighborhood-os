import DialogWrapper from "./dialog/DialogWrapper";
import SafetyUpdateForm from "./safety/SafetyUpdateForm";

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
    >
      <SafetyUpdateForm onClose={() => onOpenChange(false)} />
    </DialogWrapper>
  );
};

export default AddSafetyUpdateDialog;