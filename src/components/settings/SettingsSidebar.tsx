
import React from 'react';
import { cn } from "@/lib/utils";
import { User, Bell, Users, Shield } from "lucide-react";

/**
 * Settings navigation item interface
 */
interface SettingsNavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

/**
 * Props for the SettingsSidebar component
 */
interface SettingsSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

/**
 * SettingsSidebar Component
 * 
 * Provides navigation sidebar for the settings page with clear visual hierarchy
 * and descriptions for each settings category.
 */
export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
  activeTab,
  onTabChange
}) => {
  // Navigation items configuration with icons and descriptions
  const navItems: SettingsNavItem[] = [
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
    <div className="w-64 bg-white border-r border-gray-200 p-6">
      {/* Sidebar header */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Settings</h2>
        <p className="text-sm text-gray-500">
          Manage your account and preferences
        </p>
      </div>

      {/* Navigation menu */}
      <nav className="space-y-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-all duration-200",
                isActive
                  ? "bg-purple-50 border border-purple-200 text-purple-700"
                  : "hover:bg-gray-50 text-gray-700 hover:text-gray-900"
              )}
            >
              <Icon className={cn(
                "h-5 w-5 mt-0.5 flex-shrink-0",
                isActive ? "text-purple-600" : "text-gray-400"
              )} />
              <div className="flex-1 min-w-0">
                <div className={cn(
                  "font-medium text-sm",
                  isActive ? "text-purple-700" : "text-gray-900"
                )}>
                  {item.label}
                </div>
                <div className={cn(
                  "text-xs mt-0.5",
                  isActive ? "text-purple-600" : "text-gray-500"
                )}>
                  {item.description}
                </div>
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
