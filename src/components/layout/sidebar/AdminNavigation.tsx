import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCanAccessAdminPage } from '@/hooks/useCanAccessAdminPage';

/**
 * AdminNavigation Component
 * 
 * Renders admin navigation links in the sidebar
 * Only shows for users with admin or steward roles
 * Separated from main feature navigation for better organization
 */
const AdminNavigation = () => {
  // Get current location for styling active states
  const location = useLocation();
  
  // Check if user can access admin page
  const { canAccess: canAccessAdmin } = useCanAccessAdminPage();

  // Don't render anything if user can't access admin
  if (!canAccessAdmin) {
    return null;
  }

  const isActive = location.pathname === '/admin';

  return (
    <div className="space-y-1">
      <NavLink
        to="/admin"
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
          isActive
            ? "text-slate-600"
            : "text-gray-900"
        )}
      >
        <Settings className={cn(
          "h-5 w-5 flex-shrink-0",
          "text-slate-600"
        )} />
        Admin
      </NavLink>
    </div>
  );
};

export default AdminNavigation;