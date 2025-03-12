
import { User } from "@supabase/supabase-js";
import { Neighborhood } from "@/contexts/neighborhood/types";

/**
 * DiagnosticsPanel component props
 */
interface DiagnosticsPanelProps {
  user: User | null;
  currentNeighborhood: Neighborhood | null;
  isCoreContributor: boolean;
}

/**
 * DiagnosticsPanel component
 * 
 * Displays diagnostic information in the sidebar
 * Now with user ID and other diagnostic elements removed
 */
const DiagnosticsPanel = ({ 
  currentNeighborhood,
  isCoreContributor
}: DiagnosticsPanelProps) => {
  return (
    <div className="space-y-2 mt-4">
      {/* Only display current neighborhood info if available */}
      {currentNeighborhood && (
        <div className="px-2 py-1 bg-green-50 rounded text-xs text-green-600">
          <div className="font-semibold mb-1">Neighborhood:</div>
          <div>{currentNeighborhood.name}</div>
        </div>
      )}
      
      {/* Display core contributor status */}
      {isCoreContributor && (
        <div className="px-2 py-1 bg-amber-50 rounded text-xs text-amber-600">
          <div className="font-semibold mb-1">Access Level:</div>
          <div>Core Contributor</div>
        </div>
      )}
    </div>
  );
};

export default DiagnosticsPanel;
