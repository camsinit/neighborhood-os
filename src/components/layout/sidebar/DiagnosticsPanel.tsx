
/**
 * DiagnosticsPanel component (SIMPLIFIED VERSION)
 * 
 * A diagnostic panel shown at the bottom of the sidebar with basic information
 * for debugging purposes. Core contributor mode has been removed.
 * Now includes embedded LoggingControls component for easier access to logging settings.
 */
import { User } from '@supabase/supabase-js';
import { Neighborhood } from '@/contexts/neighborhood';
import LoggingControls from '@/components/debug/LoggingControls';

// Define the component props interface
interface DiagnosticsPanelProps {
  user: User | null | undefined;
  currentNeighborhood: Neighborhood | null;
}

/**
 * DiagnosticsPanel displays basic debugging information in the sidebar
 * This simplified version has removed the core contributor functionality
 * Now includes the LoggingControls component embedded directly in the panel
 */
const DiagnosticsPanel = ({ 
  user,
  currentNeighborhood
}: DiagnosticsPanelProps) => {
  // Only show diagnostics in development mode
  if (import.meta.env.PROD) {
    return null;
  }
  
  return (
    <div className="mt-4 p-2 text-xs text-gray-500 bg-gray-50 rounded border border-gray-100">
      <h6 className="font-medium mb-1">Diagnostics</h6>
      
      {/* User information */}
      <div className="mb-1">
        {user ? (
          <span>👤 {user.email?.split('@')[0] || 'User'}</span>
        ) : (
          <span className="text-amber-700">⚠️ No user</span>
        )}
      </div>
      
      {/* Neighborhood information */}
      <div className="mb-2">
        {currentNeighborhood ? (
          <span>🏘️ {currentNeighborhood.name}</span>
        ) : (
          <span className="text-amber-700">⚠️ No neighborhood</span>
        )}
      </div>
      
      {/* Integrated LoggingControls section */}
      <div className="mt-3 pt-2 border-t border-gray-200">
        <h6 className="font-medium mb-1">Logging Controls</h6>
        <LoggingControls embedded={true} />
      </div>
    </div>
  );
};

export default DiagnosticsPanel;
