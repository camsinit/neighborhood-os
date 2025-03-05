
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading";

/**
 * LoadingState Component
 * 
 * This component displays a loading spinner and message while
 * neighborhood data is being fetched. It also provides a refresh button
 * in case loading takes too long.
 * 
 * @param isRefreshing - Whether a refresh operation is in progress
 * @param onRefresh - Function to call when the refresh button is clicked
 */
interface LoadingStateProps {
  isRefreshing: boolean;
  onRefresh: () => void;
}

const LoadingState = ({ isRefreshing, onRefresh }: LoadingStateProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Display a loading spinner to indicate data is being fetched */}
      <LoadingSpinner />
      
      {/* Title to inform the user what's happening */}
      <h1 className="text-xl font-bold mb-2">Loading Your Neighborhood</h1>
      
      {/* Descriptive text to set expectations */}
      <p className="text-gray-600 max-w-md text-center mb-8">
        We're connecting you with your neighborhood information.
        This should only take a moment.
      </p>
      
      {/* Refresh button in case loading takes too long */}
      <Button 
        variant="outline" 
        onClick={onRefresh}
        disabled={isRefreshing}
      >
        {isRefreshing ? "Refreshing..." : "Refresh"}
      </Button>
    </div>
  );
};

export default LoadingState;
