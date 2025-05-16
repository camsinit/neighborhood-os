
import UniversalDialog from "@/components/ui/universal-dialog";
import SafetyUpdateFormNew from "./SafetyUpdateFormNew";

/**
 * AddSafetyUpdateDialogNew component
 * 
 * Updated dialog for sharing community updates
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
    <UniversalDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Share Community Update"
      description="Share important information with your neighbors. Add details to help everyone stay informed about what's happening in your community."
      maxWidth="sm"
    >
      {/* Pass onSuccess instead of onClose */}
      <SafetyUpdateFormNew onSuccess={handleSuccess} />
    </UniversalDialog>
  );
};

export default AddSafetyUpdateDialogNew;
