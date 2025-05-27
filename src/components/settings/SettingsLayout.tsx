
import React from 'react';
import { SettingsSidebar } from './SettingsSidebar';

/**
 * Props for the SettingsLayout component
 */
interface SettingsLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

/**
 * SettingsLayout Component
 * 
 * Provides the main layout structure for the settings page with sidebar
 * navigation and content area. Uses a dashboard-style layout for better
 * space utilization and user experience.
 */
export const SettingsLayout: React.FC<SettingsLayoutProps> = ({
  children,
  activeTab,
  onTabChange
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main container with flexbox layout */}
      <div className="flex h-screen">
        {/* Sidebar navigation */}
        <SettingsSidebar 
          activeTab={activeTab} 
          onTabChange={onTabChange} 
        />
        
        {/* Main content area */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="max-w-4xl mx-auto">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
