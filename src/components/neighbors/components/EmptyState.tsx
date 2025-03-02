
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

/**
 * EmptyState Component
 * 
 * This component is shown when the neighborhood exists but has no users.
 * 
 * @param neighborhoodName - The name of the current neighborhood
 * @param onRefresh - Callback function to refresh the data
 */
interface EmptyStateProps {
  neighborhoodName: string;
  onRefresh: () => void;
}

export const EmptyState = ({ neighborhoodName, onRefresh }: EmptyStateProps) => {
  return (
    <div className="p-6">
      <div className="text-center bg-white rounded-lg p-8 shadow">
        <h3 className="text-lg font-medium mb-2">No neighbors found</h3>
        <p className="text-gray-500 mb-4">Your neighborhood "{neighborhoodName}" doesn't have any members yet.</p>
        {/* Refresh button to try loading the data again */}
        <Button onClick={onRefresh} variant="outline" className="flex items-center mx-auto">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
    </div>
  );
};
