
import { User } from "@supabase/supabase-js";
import { Neighborhood } from "@/contexts/neighborhood/types";

/**
 * DiagnosticsPanel component props
 */
interface DiagnosticsPanelProps {
  user: User | null;
  neighborhood: Neighborhood | null;
  error: Error | null;
  isLoading: boolean;
}

/**
 * DiagnosticsPanel component
 * 
 * Displays diagnostic information in the sidebar
 */
const DiagnosticsPanel = ({ 
  neighborhood,
  error,
  isLoading,
  user
}: DiagnosticsPanelProps) => {
  return (
    <div className="space-y-2 mt-4">
      {/* Only display current neighborhood info if available */}
      {neighborhood && (
        <div className="px-2 py-1 bg-green-50 rounded text-xs text-green-600">
          <div className="font-semibold mb-1">Neighborhood:</div>
          <div>{neighborhood.name}</div>
        </div>
      )}
      
      {/* Display user info */}
      {user && (
        <div className="px-2 py-1 bg-blue-50 rounded text-xs text-blue-600">
          <div className="font-semibold mb-1">User:</div>
          <div className="truncate">{user.email}</div>
        </div>
      )}
      
      {/* Display loading status */}
      {isLoading && (
        <div className="px-2 py-1 bg-yellow-50 rounded text-xs text-yellow-600">
          <div>Loading data...</div>
        </div>
      )}
      
      {/* Display error if any */}
      {error && (
        <div className="px-2 py-1 bg-red-50 rounded text-xs text-red-600">
          <div className="font-semibold mb-1">Error:</div>
          <div className="truncate">{error.message}</div>
        </div>
      )}
    </div>
  );
};

export default DiagnosticsPanel;
