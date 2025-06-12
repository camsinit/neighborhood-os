
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * MainNavigation Component
 * 
 * Renders the main dashboard/home navigation link
 * Updated to use bold font weight on hover instead of color changes
 * Fixed to point to '/home' route instead of '/dashboard'
 * Updated to keep text black when active instead of blue
 */
const MainNavigation = () => {
  return (
    <div className="space-y-1">
      <NavLink
        to="/home"
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
