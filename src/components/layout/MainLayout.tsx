
import { Outlet } from 'react-router-dom';
import Sidebar from './sidebar';
import Header from './Header';

/**
 * MainLayout component
 * 
 * This component provides a consistent layout for all protected pages, including:
 * 1. The sidebar navigation
 * 2. Header with user info and actions
 * 3. A content area for page-specific components
 * 
 * Uses React Router's Outlet to render child routes within this layout
 */
const MainLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar navigation */}
      <Sidebar />
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Header with user info and actions */}
        <Header />
        
        {/* Page content - rendered via Outlet */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
