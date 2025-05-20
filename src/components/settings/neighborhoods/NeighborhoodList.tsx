
/**
 * NeighborhoodList component
 * Displays a list of neighborhoods the user is a member of
 */
import React from "react";
import { Neighborhood } from "./UserNeighborhoodsHook";

interface NeighborhoodListProps {
  neighborhoods: Neighborhood[];
}

const NeighborhoodList: React.FC<NeighborhoodListProps> = ({ neighborhoods }) => {
  // Render neighborhoods inline
  return (
    <div className="flex items-center gap-2">
      <span className="font-semibold text-lg">Your Neighborhoods:</span>
      <span className="text-blue-500 text-lg font-medium">
        {neighborhoods.map(n => n.name).join(", ")}
      </span>
    </div>
  );
};

export default NeighborhoodList;
