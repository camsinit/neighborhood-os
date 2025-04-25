// Replace DialogWrapper with UniversalDialog
import UniversalDialog from "@/components/ui/universal-dialog";
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
    // Replace DialogWrapper with UniversalDialog
    <UniversalDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Share Safety Update"
      description="Share important safety information with your neighbors. Add details and optionally include an image to help illustrate the situation."
      maxWidth="sm"
    >
      {/* Pass onSuccess instead of onClose */}
      <SafetyUpdateFormNew onSuccess={handleSuccess} />
    </UniversalDialog>
  );
};

export default AddSafetyUpdateDialogNew;
