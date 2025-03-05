
/**
 * Main Sidebar component for the application
 * 
 * This component renders the sidebar with navigation items,
 * logo, and action buttons.
 */
import React, { useState } from 'react';
import { useNeighborhood } from '@/contexts/neighborhood';
import { useUser } from '@supabase/auth-helpers-react';
import Logo from './Logo';
import MainNavigation from './MainNavigation';
import FeatureNavigation from './FeatureNavigation';
import ActionButtons from './ActionButtons';
import DiagnosticsPanel from './DiagnosticsPanel';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';

/**
 * Sidebar component
 * 
 * This component renders the sidebar with navigation items,
 * logo, and action buttons.
 */
const Sidebar: React.FC = () => {
  // Get the current user and neighborhood information
  const user = useUser();
  const { 
    currentNeighborhood, 
    isLoading, 
    error, 
    refreshNeighborhoodData 
  } = useNeighborhood();
  
  // Set up auto refresh for neighborhood data
  useAutoRefresh(refreshNeighborhoodData, 5 * 60 * 1000); // Refresh every 5 minutes
  
  // State to track if diagnostics panel is open
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  
  // Toggle diagnostics panel 
  const toggleDiagnostics = () => {
    setShowDiagnostics(!showDiagnostics);
  };

  return (
    <div className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col py-5 px-4">
      <Logo />
      
      <div className="mt-8 flex-1 overflow-y-auto">
        <MainNavigation />
        
        {/* Only show feature navigation if we have a neighborhood */}
        {currentNeighborhood && !isLoading && (
          <FeatureNavigation />
        )}
      </div>
      
      <div className="mt-auto">
        <ActionButtons 
          user={user} 
          neighborhood={currentNeighborhood} 
          showDiagnostics={showDiagnostics}
          toggleDiagnostics={toggleDiagnostics}
        />
        
        {/* Show diagnostics panel if toggled on */}
        {showDiagnostics && (
          <DiagnosticsPanel 
            user={user} 
            neighborhood={currentNeighborhood}
            error={error}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
};

export default Sidebar;
