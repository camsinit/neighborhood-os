
import { LoadingSpinner } from "@/components/ui/loading";

/**
 * LoadingState Component
 * 
 * Displays a loading spinner while invitation data is being fetched.
 */
const LoadingState = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      {/* Show loading spinner while fetching invitation data */}
      <LoadingSpinner />
    </div>
  );
};

export default LoadingState;
