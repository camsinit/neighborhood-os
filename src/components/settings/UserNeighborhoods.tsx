
/**
 * UserNeighborhoods component
 * 
 * Main component that fetches and displays neighborhoods the user is a member of
 * This uses several smaller components to handle different UI states and concerns
 */
import React from "react";
import { useUserNeighborhoods } from "./neighborhoods/UserNeighborhoodsHook";
import LoadingState from "./neighborhoods/LoadingState";
import ErrorState from "./neighborhoods/ErrorState";
import EmptyState from "./neighborhoods/EmptyState";
import NeighborhoodList from "./neighborhoods/NeighborhoodList";
import TerrificTerraceAdder from "./neighborhoods/TerrificTerraceAdder";
import { refreshEvents } from "@/utils/refreshEvents";

/**
 * This component orchestrates the fetching and display of a user's neighborhoods.
 * It handles:
 *   - Loading state while fetching neighborhoods
 *   - Error state if fetching fails
 *   - Empty state if user is not a member of any neighborhoods
 *   - List of neighborhoods with names as badges
 */
export const UserNeighborhoods: React.FC = () => {
  // Use our custom hook to fetch neighborhood data
  const { 
    neighborhoods, 
    isLoading, 
    error, 
    addUserToNeighborhood,
    refreshNeighborhoods
  } = useUserNeighborhoods();

  // Function to add a neighbor that triggers refresh events
  const handleAddNeighbor = async (userId: string, neighborhoodName: string) => {
    await addUserToNeighborhood(userId, neighborhoodName);
    // Trigger refresh events to update UI
    refreshEvents.emit('notifications');
    refreshEvents.emit('activities-updated');
  };

  // Add the test user to Terrific Terrace (hidden component)
  return (
    <>
      {/* Hidden utility component for adding test user to neighborhood */}
      <TerrificTerraceAdder addUserToNeighborhood={handleAddNeighbor} />
      
      {/* Show appropriate UI based on data state */}
      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} />
      ) : neighborhoods.length === 0 ? (
        <EmptyState />
      ) : (
        <NeighborhoodList neighborhoods={neighborhoods} />
      )}
    </>
  );
};

export default UserNeighborhoods;
