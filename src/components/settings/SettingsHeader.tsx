
import React from 'react';
import { cn } from "@/lib/utils";
import { User, Bell, Users } from "lucide-react";

/**
 * Settings tab item interface
 */
interface SettingsTab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

/**
 * Props for the SettingsHeader component
 */
interface SettingsHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

/**
 * SettingsHeader Component
 * 
 * Provides horizontal tab navigation for the settings page with clear visual
 * hierarchy and descriptions for each settings category.
 */
export const SettingsHeader: React.FC<SettingsHeaderProps> = ({
  activeTab,
  onTabChange
}) => {
  // Tab items configuration with icons and descriptions
  const tabs: SettingsTab[] = [
    {
      id: 'account',
      label: 'Account',
      icon: User,
      description: 'Profile & preferences'
    },
    {
      id: 'neighbor',
      label: 'Neighbor Profile',
      icon: Users,
      description: 'Skills & visibility'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      description: 'Alerts & updates'
    }
  ];

  return (
    <div className="border-b border-gray-200 bg-white">
      {/* Page header */}
      <div className="px-8 pt-8 pb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">
          Manage your account and preferences
        </p>
      </div>

      {/* Horizontal tabs navigation */}
      <div className="px-8">
        <nav className="flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "group relative min-w-0 flex-1 overflow-hidden py-4 px-1 text-center text-sm font-medium hover:text-gray-700 focus:z-10 focus:outline-none",
                  isActive
                    ? "text-purple-600 border-purple-500"
                    : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Icon className={cn(
                    "h-5 w-5",
                    isActive ? "text-purple-600" : "text-gray-400 group-hover:text-gray-500"
                  )} />
                  <span className="font-medium">{tab.label}</span>
                </div>
                <p className={cn(
                  "mt-1 text-xs",
                  isActive ? "text-purple-500" : "text-gray-400"
                )}>
                  {tab.description}
                </p>
                
                {/* Active tab indicator */}
                <div
                  className={cn(
                    "absolute bottom-0 left-0 right-0 h-0.5 transition-colors",
                    isActive ? "bg-purple-500" : "bg-transparent"
                  )}
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
