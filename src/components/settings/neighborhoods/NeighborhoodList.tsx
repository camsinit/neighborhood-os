
/**
 * NeighborhoodList component
 * Displays just the neighborhood name in a simple, clean format
 */
import React from "react";
import { Neighborhood } from "./UserNeighborhoodsHook";

interface NeighborhoodListProps {
  neighborhoods: Neighborhood[];
}

const NeighborhoodList: React.FC<NeighborhoodListProps> = ({ neighborhoods }) => {
  // Render just the neighborhood name without repetitive labels
  return (
    <div className="text-lg font-medium text-gray-900">
      {neighborhoods.map(n => n.name).join(", ")}
    </div>
  );
};

export default NeighborhoodList;
