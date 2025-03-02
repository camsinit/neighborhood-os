
import { LoadingSpinner } from "@/components/ui/loading";

/**
 * LoadingState Component
 * 
 * This component displays a loading spinner with a message.
 * It is shown while data is being fetched.
 */
export const LoadingState = () => {
  // Simple loading spinner with text
  return (
    <div className="p-6 text-center">
      <LoadingSpinner />
      <p className="mt-4 text-gray-500">Loading neighborhood data...</p>
    </div>
  );
};
