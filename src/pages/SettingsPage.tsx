
import React, { useState, useEffect } from 'react';
import ModuleLayout from '@/components/layout/ModuleLayout';
import SettingsDialogContent from '@/components/settings/SettingsDialogContent';
import { useNavigate } from 'react-router-dom';

/**
 * SettingsPage component
 * 
 * Provides a page-based interface for settings by directly embedding
 * the SettingsDialogContent component
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
    >
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <SettingsDialogContent onClose={handleClose} />
      </div>
    </ModuleLayout>
  );
};

export default SettingsPage;
