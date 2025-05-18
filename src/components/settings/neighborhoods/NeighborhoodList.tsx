
/**
 * NeighborhoodList component
 * Displays a list of neighborhoods the user is a member of
 */
import React from "react";
import { Neighborhood } from "./UserNeighborhoodsHook";
import { Badge } from "@/components/ui/badge";

// Component props interface
interface NeighborhoodListProps {
  neighborhoods: Neighborhood[];
}

/**
 * NeighborhoodList displays all neighborhoods a user belongs to
 * as a list of badges
 */
const NeighborhoodList: React.FC<NeighborhoodListProps> = ({
  neighborhoods
}) => {
  return (
    <div className="space-y-2">
      <h3 className="text-base font-medium">Your Neighborhoods</h3>
      <div className="flex flex-wrap gap-2">
        {neighborhoods.map((neighborhood) => (
          <Badge key={neighborhood.id} className="bg-purple-100 text-purple-800 hover:bg-purple-200">
            {neighborhood.name}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default NeighborhoodList;
