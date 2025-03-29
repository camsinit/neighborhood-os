
/**
 * Error state component for neighborhood data
 * Displays an error message when fetching neighborhood data fails
 */
import React from "react";

interface ErrorStateProps {
  message: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({ message }) => {
  return (
    <div className="text-red-500 p-4 border border-red-200 rounded-md">
      {message}
    </div>
  );
};

export default ErrorState;
