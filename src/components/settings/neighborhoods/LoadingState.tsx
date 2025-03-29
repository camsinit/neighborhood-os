
/**
 * Loading state component for neighborhood data
 * Shows a loading spinner while data is being fetched
 */
import React from "react";
import { LoadingSpinner } from "@/components/ui/loading";

const LoadingState: React.FC = () => {
  return (
    <div className="flex justify-center p-4">
      <LoadingSpinner />
    </div>
  );
};

export default LoadingState;
