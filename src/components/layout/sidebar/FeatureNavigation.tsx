
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Calendar, Brain, UsersRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrentNeighborhood } from '@/hooks/useCurrentNeighborhood';
// Use centralized routes to avoid hardcoding and ensure consistency
import { BASE_ROUTES, neighborhoodPath } from '@/utils/routes';

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
   * Each item includes basePath, label, icon, and color theme
   * We use centralized BASE_ROUTES to avoid hardcoded strings.
   */
  const navigationItems = [
    {
      basePath: BASE_ROUTES.home,
      label: 'Home',
      icon: Home,
      activeColor: 'text-gray-900'
    },
    {
      basePath: BASE_ROUTES.calendar,
      label: 'Calendar',
      icon: Calendar,
      activeColor: 'text-blue-600'
    },
    {
      basePath: BASE_ROUTES.skills,
      label: 'Skills',
      icon: Brain,
      activeColor: 'text-green-600'
    },
    {
      basePath: BASE_ROUTES.neighbors,
      label: 'Groups',
      icon: UsersRound,
      activeColor: 'text-purple-600'
    }
  ];

  // Generate neighborhood-aware URL for each navigation item using helper
  const getNeighborhoodAwarePath = (basePath: string) => neighborhoodPath(basePath, currentNeighborhood?.id);

  return (
    <div className="space-y-1 pt-4">
      {navigationItems.map((item, index) => {
        const fullPath = getNeighborhoodAwarePath(item.basePath);
        const isActive = location.pathname === fullPath;
        const Icon = item.icon;
        
        return (
          <div key={item.basePath}>
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
          </div>
        );
      })}
    </div>
  );
};

export default FeatureNavigation;
