
/**
 * DiagnosticsPanel component (SIMPLIFIED VERSION)
 * 
 * A diagnostic panel shown at the bottom of the sidebar with reduced information
 * for debugging purposes. Core contributor mode has been simplified.
 */
import { User } from '@supabase/supabase-js';
import { Neighborhood } from '@/contexts/neighborhood';

// Define the component props interface
interface DiagnosticsPanelProps {
  user: User | null | undefined;
  currentNeighborhood: Neighborhood | null;
  isCoreContributor: boolean;
}

/**
 * DiagnosticsPanel displays debugging information in the sidebar
 * This simplified version has removed the core contributor functionality
 */
const DiagnosticsPanel = ({ 
  user,
  currentNeighborhood,
  isCoreContributor
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
      <div>
        {currentNeighborhood ? (
          <span>🏘️ {currentNeighborhood.name}</span>
        ) : (
          <span className="text-amber-700">⚠️ No neighborhood</span>
        )}
      </div>
    </div>
  );
};

export default DiagnosticsPanel;
