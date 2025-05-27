
import React, { useState } from 'react';
import { SettingsLayout } from '@/components/settings/SettingsLayout';
import { AccountSettingsTab } from '@/components/settings/tabs/AccountSettingsTab';
import { NeighborSettingsTab } from '@/components/settings/tabs/NeighborSettingsTab';
import { NotificationSettingsTab } from '@/components/settings/tabs/NotificationSettingsTab';

/**
 * SettingsPage Component
 * 
 * Main settings page that displays user settings using the new dashboard-style
 * layout with sidebar navigation and auto-saving functionality.
 */
function SettingsPage() {
  // State for active tab
  const [activeTab, setActiveTab] = useState('account');

  /**
   * Render the content for the active tab
   */
  const renderTabContent = () => {
    switch (activeTab) {
      case 'account':
        return <AccountSettingsTab />;
      case 'neighbor':
        return <NeighborSettingsTab />;
      case 'notifications':
        return <NotificationSettingsTab />;
      default:
        return <AccountSettingsTab />;
    }
  };

  return (
    <SettingsLayout 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
    >
      {renderTabContent()}
    </SettingsLayout>
  );
}

export default SettingsPage;
