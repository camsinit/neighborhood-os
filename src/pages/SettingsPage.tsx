
import React, { useState, useEffect } from 'react';
import ModuleLayout from '@/components/layout/ModuleLayout';
import SettingsDialog from '@/components/SettingsDialog';

/**
 * SettingsPage component
 * 
 * This page displays the settings interface directly in the page layout
 * rather than in a dialog/popover
 */
const SettingsPage: React.FC = () => {
  // We'll use this state to control the embedded settings component
  const [isOpen, setIsOpen] = useState(true);

  // Log when the component mounts for debugging
  useEffect(() => {
    console.log("[SettingsPage] Page mounted");
  }, []);

  return (
    <ModuleLayout
      title="Account Settings"
      themeColor="neighbors" // Using 'neighbors' theme since settings are user/profile related
    >
      <div className="bg-white rounded-lg border shadow-sm">
        {/* 
          * We're reusing the existing SettingsDialog component but embedding it directly in the page
          * The dialog's open state is always true since it's now embedded in the page 
          */}
        <SettingsDialog 
          open={isOpen} 
          onOpenChange={setIsOpen} 
        />
      </div>
    </ModuleLayout>
  );
};

export default SettingsPage;
