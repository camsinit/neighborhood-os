
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Calendar, Brain, Gift, Info, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrentNeighborhood } from '@/hooks/useCurrentNeighborhood';

/**
 * FeatureNavigation Component
 * 
 * Renders the main feature navigation links in the sidebar
 * Each link uses NavLink for automatic active state management
 * Icons are color-coded to match each module's theme
 * Now generates neighborhood-aware URLs using current neighborhood context
 */
const FeatureNavigation = () => {
  // Get current location and neighborhood for URL generation
  const location = useLocation();
  const currentNeighborhood = useCurrentNeighborhood();

  /**
   * Navigation items configuration
   * Each item includes path, label, icon, and color theme
   * Paths are generated as neighborhood-aware URLs
   */
  const navigationItems = [
    {
      path: 'home',
      label: 'Home',
      icon: Home,
      activeColor: 'text-gray-900'
    },
    {
      path: 'calendar',
      label: 'Calendar',
      icon: Calendar,
      activeColor: 'text-blue-600'
    },
    {
      path: 'skills',
      label: 'Skills',
      icon: Brain,
      activeColor: 'text-green-600'
    },
    {
      path: 'goods',
      label: 'Freebies',
      icon: Gift,
      activeColor: 'text-orange-600'
    },
    {
      path: 'safety',
      label: 'Updates',
      icon: Info,
      activeColor: 'text-red-600'
    },
    {
      path: 'neighbors',
      label: 'Neighbors',
      icon: Users,
      activeColor: 'text-purple-600'
    }
  ];

  // Generate neighborhood-aware URL for each navigation item
  const getNeighborhoodAwarePath = (path: string) => {
    if (!currentNeighborhood?.id) {
      // Fallback to legacy route if no neighborhood context
      return `/${path}`;
    }
    return `/n/${currentNeighborhood.id}/${path}`;
  };

  return (
    <div className="space-y-1 pt-4">
      {navigationItems.map((item, index) => {
        const fullPath = getNeighborhoodAwarePath(item.path);
        const isActive = location.pathname === fullPath;
        const Icon = item.icon;
        
        return (
          <React.Fragment key={item.path}>
            {/* Add divider between Home and Calendar with matching spacing */}
            {index === 1 && <div className="my-3 h-px bg-gray-100" />}
            
            <NavLink
              to={fullPath}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                isActive
                  ? item.activeColor
                  : "text-gray-900"
              )}
            >
              <Icon className={cn(
                "h-5 w-5 flex-shrink-0",
                isActive ? item.activeColor : item.activeColor
              )} />
              {item.label}
            </NavLink>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default FeatureNavigation;
