
/**
 * DEPRECATED: This component is no longer used in the main application flow.
 * Settings functionality is now provided through the dedicated SettingsPage component.
 * This file is kept only for reference or legacy support.
 */

import { Dialog, DialogContent } from "@/components/ui/dialog";
import SettingsDialogContent from "./settings/SettingsDialogContent";

/**
 * SettingsDialog Component
 * 
 * This is a simplified wrapper component that provides the dialog shell
 * and delegates the actual content to the SettingsDialogContent component.
 * 
 * @deprecated Use SettingsPage instead for the main application flow
 */
const SettingsDialog = ({ 
  open, 
  onOpenChange 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void 
}) => {
  console.log("[SettingsDialog] DEPRECATED: This component should not be used directly anymore");
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[calc(96vh)] overflow-hidden flex flex-col">
        <SettingsDialogContent onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
