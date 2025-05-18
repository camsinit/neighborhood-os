
import React, { useState, useEffect } from 'react';
import ModuleLayout from '@/components/layout/ModuleLayout';
import SettingsDialog from '@/components/SettingsDialog';
import { useNavigate } from 'react-router-dom'; // Import for navigation

/**
 * SettingsPage component
 * 
 * This page displays the settings interface directly in the page layout
 * rather than in a dialog/popover.
 * 
 * It handles the settings form in-page and provides navigation back to previous pages.
 */
const SettingsPage: React.FC = () => {
  // We'll use this state to control the embedded settings component
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate(); // For navigation back when closed
  
  // Handle dialog close by navigating back
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Navigate back when dialog is closed
      navigate(-1);
    }
  };

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
          * When dialog is "closed" we navigate back instead of just hiding it
          */}
        <SettingsDialog 
          open={isOpen} 
          onOpenChange={handleOpenChange} 
        />
      </div>
    </ModuleLayout>
  );
};

export default SettingsPage;
