
import DialogWrapper from "@/components/dialog/DialogWrapper";
import SafetyUpdateFormNew from "./SafetyUpdateFormNew";

/**
 * AddSafetyUpdateDialogNew component
 * 
 * Updated dialog for sharing safety updates in the community
 * with a cleaner interface and more specific fields
 */
interface AddSafetyUpdateDialogNewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddSafetyUpdateDialogNew = ({ open, onOpenChange }: AddSafetyUpdateDialogNewProps) => {
  // Create an onSuccess handler that closes the dialog
  const handleSuccess = () => {
    onOpenChange(false);
  };

  return (
    <DialogWrapper
      open={open}
      onOpenChange={onOpenChange}
      title="Share Safety Update"
      maxWidth="sm"
    >
      {/* Pass onSuccess instead of onClose */}
      <SafetyUpdateFormNew onSuccess={handleSuccess} />
    </DialogWrapper>
  );
};

export default AddSafetyUpdateDialogNew;
