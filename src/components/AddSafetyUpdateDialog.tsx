
import UniversalDialog from "./ui/universal-dialog";
import SafetyUpdateForm from "./safety/SafetyUpdateForm";

interface AddSafetyUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddSafetyUpdateDialog = ({ open, onOpenChange }: AddSafetyUpdateDialogProps) => {
  return (
    <UniversalDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Share Safety Update"
      maxWidth="sm"
    >
      <SafetyUpdateForm onClose={() => onOpenChange(false)} />
    </UniversalDialog>
  );
};

export default AddSafetyUpdateDialog;
