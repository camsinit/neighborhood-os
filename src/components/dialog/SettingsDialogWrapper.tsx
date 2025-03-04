
import React, { useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
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
  useEffect(() => {
    console.log("[SettingsDialogWrapper] Dialog open state changed:", open);
  }, [open]);

  // Setup a ref to track if this component has been mounted
  // This helps us avoid any issues with state updates during render
  const isMounted = React.useRef(false);
  
  // Make sure we're properly tracking when the dialog should be open
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
    }
  }, []);

  return (
    // Use the base Dialog component from shadcn/ui with forced rendering
    // The forceMount prop ensures the dialog is always in the DOM
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" /> 
            Account Settings
          </DialogTitle>
          {/* Add DialogDescription to fix the accessibility warning */}
          <DialogDescription className="sr-only">
            Manage your account settings and preferences
          </DialogDescription>
        </DialogHeader>
        
        {/* Render the actual settings dialog content */}
        <SettingsDialog 
          open={open}
          onOpenChange={onOpenChange}
        />
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialogWrapper;
