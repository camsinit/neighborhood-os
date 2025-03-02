
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

/**
 * NeighborhoodHeader Component
 * 
 * This component displays the name of the current neighborhood
 * and a refresh button.
 * 
 * @param neighborhoodName - The name of the current neighborhood
 * @param onRefresh - Callback function to refresh the data
 */
interface NeighborhoodHeaderProps {
  neighborhoodName: string;
  onRefresh: () => void;
}

export const NeighborhoodHeader = ({ neighborhoodName, onRefresh }: NeighborhoodHeaderProps) => {
  return (
    <div className="mb-4 flex justify-between items-center">
      <div>
        <h3 className="text-sm font-medium text-gray-500">Current Neighborhood:</h3>
        <p className="text-base font-semibold">{neighborhoodName}</p>
      </div>
      <Button onClick={onRefresh} variant="outline" size="sm" className="flex items-center">
        <RefreshCw className="h-4 w-4 mr-2" />
        Refresh
      </Button>
    </div>
  );
};
