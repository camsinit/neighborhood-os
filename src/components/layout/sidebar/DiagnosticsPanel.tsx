
import { User } from "@supabase/supabase-js";
import { Neighborhood } from "@/contexts/neighborhood/types";

/**
 * DiagnosticsPanel component props
 */
interface DiagnosticsPanelProps {
  user: User | null;
  currentNeighborhood: Neighborhood | null;
  isCoreContributor: boolean; // We keep this prop to avoid breaking changes
}

/**
 * DiagnosticsPanel component - SIMPLIFIED VERSION
 * 
 * Displays diagnostic information in the sidebar
 * Core contributor status display has been removed
 */
const DiagnosticsPanel = ({ 
  currentNeighborhood
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
      
      {/* Core contributor status display removed */}
    </div>
  );
};

export default DiagnosticsPanel;
