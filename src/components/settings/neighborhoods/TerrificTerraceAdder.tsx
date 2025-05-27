
/**
 * Hidden component for development that adds test user to a specific neighborhood
 * DISABLED - No longer automatically adds users to prevent toast notifications
 */
import React from 'react';

// Define props interface for backward compatibility
interface TerrificTerraceAdderProps {
  addUserToNeighborhood: (userId: string, neighborhoodName: string) => Promise<void>;
}

/**
 * This component has been disabled to prevent automatic toast notifications
 * when users navigate to the Neighbor Profile settings tab
 */
const TerrificTerraceAdder: React.FC<TerrificTerraceAdderProps> = ({ addUserToNeighborhood }) => {
  // Component disabled - no longer automatically adds users to neighborhoods
  // This prevents the "User is already a member of Terrific Terrace" toast message
  
  // This component doesn't render anything and doesn't perform any actions
  return null;
};

export default TerrificTerraceAdder;
