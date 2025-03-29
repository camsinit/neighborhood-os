
/**
 * Empty state component for neighborhood data
 * Shown when the user is not a member of any neighborhoods
 */
import React from "react";

const EmptyState: React.FC = () => {
  return (
    <div className="text-center p-4 text-gray-500">
      You are not a member of any neighborhoods yet.
    </div>
  );
};

export default EmptyState;
