
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * MainNavigation Component
 * 
 * Renders the main dashboard/home navigation link
 * UPDATED: Consistent font styling with other navigation items
 */
const MainNavigation = () => {
  return (
    <div className="space-y-1">
      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          cn(
            "flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-lg transition-colors",
            isActive
              ? "bg-gray-100 text-gray-900"
              : "text-gray-900 hover:bg-gray-50"
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
