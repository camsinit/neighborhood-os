
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrentNeighborhood } from '@/hooks/useCurrentNeighborhood';
import { BASE_ROUTES, neighborhoodPath } from '@/utils/routes';

/**
 * MainNavigation Component
 * 
 * Renders the main dashboard/home navigation link
 * Updated to use neighborhood-aware URLs
 * Uses current neighborhood context to generate proper paths
 */
const MainNavigation = () => {
  const currentNeighborhood = useCurrentNeighborhood();
  
  // Generate neighborhood-aware home path using our routes helper
  const homePath = neighborhoodPath(BASE_ROUTES.home, currentNeighborhood?.id);
  
  return (
    <div className="space-y-1">
      <NavLink
        to={homePath}
        className={({ isActive }) =>
          cn(
            "flex items-center gap-3 px-3 py-2 text-gray-900 rounded-lg transition-all",
            isActive
              ? "text-gray-900 font-semibold"
              : "hover:font-semibold"
          )
        }
      >
        <Home className="h-5 w-5 flex-shrink-0" />
        Home
      </NavLink>
    </div>
  );
};

export default MainNavigation;
