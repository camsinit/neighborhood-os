/**
 * NeighborhoodList component
 * Displays a list of neighborhoods the user is a member of
 */
import React from "react";
import { Neighborhood } from "./UserNeighborhoodsHook";
interface NeighborhoodListProps {
  neighborhoods: Neighborhood[];
}
const NeighborhoodList: React.FC<NeighborhoodListProps> = ({
  neighborhoods
}) => {
  // Render neighborhoods inline
  return;
};
export default NeighborhoodList;