
/**
 * TerrificTerraceAdder component
 * A utility component that adds a specific user to the Terrific Terrace neighborhood
 * This is used for onboarding/testing purposes
 */
import React, { useEffect } from "react";
import { useUser } from "@supabase/auth-helpers-react";

interface TerrificTerraceAdderProps {
  addUserToNeighborhood: (userId: string, neighborhoodName: string) => Promise<void>;
}

const TerrificTerraceAdder: React.FC<TerrificTerraceAdderProps> = ({ 
  addUserToNeighborhood 
}) => {
  const user = useUser();
  
  // On component mount, add the specified user to Terrific Terrace
  // This is a one-time operation for the specific user ID requested
  useEffect(() => {
    // The specific user ID we want to add to Terrific Terrace
    const targetUserId = "74bf3085-8275-4eb2-a721-8c8e91b3d3d8";

    // Only run this once when the component mounts
    if (user) {
      // Run the add user function for the specific user
      addUserToNeighborhood(targetUserId, "Terrific Terrace");
    }

    // This effect should only run once when the component is mounted and user is available
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // This component doesn't render anything
  return null;
};

export default TerrificTerraceAdder;
