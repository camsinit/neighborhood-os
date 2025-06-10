
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Calendar, Brain, Gift, Info, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * FeatureNavigation Component
 * 
 * Renders the main feature navigation links in the sidebar
 * Each link uses NavLink for automatic active state management
 * Icons are color-coded to match each module's theme
 * REVERTED: Back to original font sizing and weight
 */
const FeatureNavigation = () => {
  // Get current location for styling active states
  const location = useLocation();

  /**
   * Navigation items configuration
   * Each item includes path, label, icon, and color theme
   */
  const navigationItems = [
    {
      path: '/calendar',
      label: 'Calendar',
      icon: Calendar,
      activeColor: 'text-blue-600',
      hoverColor: 'hover:text-blue-600'
    },
    {
      path: '/skills',
      label: 'Skills',
      icon: Brain,
      activeColor: 'text-green-600',
      hoverColor: 'hover:text-green-600'
    },
    {
      path: '/goods',
      label: 'Freebies',
      icon: Gift,
      activeColor: 'text-orange-600',
      hoverColor: 'hover:text-orange-600'
    },
    {
      path: '/safety',
      label: 'Updates',
      icon: Info,
      activeColor: 'text-red-600',
      hoverColor: 'hover:text-red-600'
    },
    {
      path: '/neighbors',
      label: 'Neighbors',
      icon: Users,
      activeColor: 'text-purple-600',
      hoverColor: 'hover:text-purple-600'
    }
  ];

  return (
    <div className="space-y-1">
      {navigationItems.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;
        
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-3 py-2 text-gray-900 rounded-lg transition-colors",
              isActive
                ? `bg-gray-100`
                : `hover:bg-gray-50 ${item.hoverColor}`
            )}
          >
            <Icon className={cn(
              "h-5 w-5 flex-shrink-0",
              isActive ? item.activeColor : item.activeColor
            )} />
            {item.label}
          </NavLink>
        );
      })}
    </div>
  );
};

export default FeatureNavigation;
