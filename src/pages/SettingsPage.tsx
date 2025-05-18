
import React, { useEffect } from 'react';
import ModuleLayout from '@/components/layout/ModuleLayout';
import SettingsDialogContent from '@/components/settings/SettingsDialogContent';
import { useNavigate } from 'react-router-dom';

/**
 * SettingsPage component
 * 
 * Provides a page-based interface for settings by directly embedding
 * the SettingsDialogContent component without extra wrappers
 */
const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log("[SettingsPage] Page mounted");
  }, []);

  // Handle dialog close by navigating back
  const handleClose = () => {
    navigate(-1);
  };

  return (
    <ModuleLayout
      title="Account Settings"
      themeColor="neighbors" // Using 'neighbors' theme since settings are user/profile related
      className="pb-6" // Add padding to bottom for spacing
    >
      {/* Render settings content directly without the extra div wrapper */}
      <SettingsDialogContent onClose={handleClose} />
    </ModuleLayout>
  );
};

export default SettingsPage;
