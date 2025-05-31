
import React from 'react';
import { Button } from "@/components/ui/button";
import { DialogHeader } from "@/components/ui/dialog";

/**
 * Props for SettingsHeader component
 */
interface SettingsHeaderProps {
  onSave: () => void;
  isDirty: boolean;
  loading: boolean;
}

/**
 * SettingsHeader Component
 * 
 * Displays the header with save button for the settings dialog
 */
export const SettingsHeader: React.FC<SettingsHeaderProps> = ({
  onSave,
  isDirty,
  loading
}) => {
  return (
    <DialogHeader className="flex flex-row items-center justify-between">
      <Button 
        type="submit"
        onClick={onSave}
        disabled={!isDirty || loading}
      >
        {loading ? "Saving..." : "Save changes"}
      </Button>
    </DialogHeader>
  );
};
