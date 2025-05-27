
import React from 'react';
import { SettingsHeader } from './SettingsHeader';

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
 * Provides the main layout structure for the settings page with horizontal
 * tab navigation at the top and content area below. Uses a clean, spacious
 * design for better user experience.
 */
export const SettingsLayout: React.FC<SettingsLayoutProps> = ({
  children,
  activeTab,
  onTabChange
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with horizontal tabs */}
      <SettingsHeader 
        activeTab={activeTab} 
        onTabChange={onTabChange} 
      />
      
      {/* Main content area */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        {children}
      </div>
    </div>
  );
};
