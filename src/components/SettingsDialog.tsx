
import { Dialog, DialogContent } from "@/components/ui/dialog";
import SettingsDialogContent from "./settings/SettingsDialogContent";

/**
 * SettingsDialog Component
 * 
 * This is a simplified wrapper component that provides the dialog shell
 * and delegates the actual content to the SettingsDialogContent component.
 * 
 * @param open - Whether the dialog is open
 * @param onOpenChange - Function to call when open state changes
 */
const SettingsDialog = ({ 
  open, 
  onOpenChange 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void 
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[calc(96vh)] overflow-hidden flex flex-col">
        <SettingsDialogContent onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
