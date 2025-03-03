
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import SettingsDialog from "@/components/SettingsDialog";

/**
 * SettingsDialogWrapper props 
 */
interface SettingsDialogWrapperProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * SettingsDialogWrapper component
 * 
 * A wrapper component that handles rendering the settings dialog
 * This provides better separation of concerns and isolates the dialog functionality
 */
const SettingsDialogWrapper: React.FC<SettingsDialogWrapperProps> = ({ 
  open, 
  onOpenChange 
}) => {
  // Log when the dialog opens or closes for debugging
  React.useEffect(() => {
    console.log("[SettingsDialogWrapper] Dialog open state changed:", open);
  }, [open]);

  return (
    // We're using the base Dialog component from shadcn/ui
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" /> 
            Account Settings
          </DialogTitle>
        </DialogHeader>
        
        {/* Render the actual settings dialog content */}
        <SettingsDialog 
          onClose={() => onOpenChange(false)} 
        />
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialogWrapper;
