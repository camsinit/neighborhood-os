
/**
 * DiagnosticsPanel component (SIMPLIFIED VERSION)
 * 
 * A diagnostic panel shown at the bottom of the sidebar with basic information
 * for debugging purposes. Core contributor mode has been removed.
 * Logging controls have been temporarily disabled.
 */
import { User } from '@supabase/supabase-js';
import { Neighborhood } from '@/contexts/neighborhood';
// Removed LoggingControls import since it's temporarily disabled

// Define the component props interface
interface DiagnosticsPanelProps {
  user: User | null | undefined;
  currentNeighborhood: Neighborhood | null;
}

/**
 * DiagnosticsPanel displays basic debugging information in the sidebar
 * This simplified version has removed the core contributor functionality
 * Logging controls are temporarily disabled
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
      
      {/* Logging Controls temporarily removed */}
      <div className="mt-3 pt-2 border-t border-gray-200">
        <h6 className="font-medium mb-1">Logging Controls</h6>
        <p className="text-amber-600 text-[10px]">
          Temporarily disabled - Coming soon in Phase 2
        </p>
      </div>
    </div>
  );
};

export default DiagnosticsPanel;
