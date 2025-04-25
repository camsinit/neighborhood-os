
import UniversalDialog from "@/components/ui/universal-dialog";
import CareRequestForm from "./CareRequestForm";

interface AddCareRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * AddCareRequestDialog component
 * 
 * This dialog displays a form for creating care requests
 * It uses the UniversalDialog component for consistent UI
 */
const AddCareRequestDialog = ({ 
  open, 
  onOpenChange,
}: AddCareRequestDialogProps) => {
  return (
    <UniversalDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Request Care"
      maxWidth="sm"
    >
      <CareRequestForm 
        onClose={() => onOpenChange(false)}
        initialValues={{}} // No need to specify requestType anymore
      />
    </UniversalDialog>
  );
};

export default AddCareRequestDialog;
