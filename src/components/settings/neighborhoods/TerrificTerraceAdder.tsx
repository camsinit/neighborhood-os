
// It's likely that this file might import from neighborhoodUtils, so let's update it:
// Note: If the import isn't present, this update won't affect functionality

/**
 * Hidden component for development that adds test user to a specific neighborhood
 */
import React, { useEffect } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { addNeighborhoodMember } from '@/contexts/neighborhood/utils';

// Define props interface
interface TerrificTerraceAdderProps {
  addUserToNeighborhood: (userId: string, neighborhoodName: string) => Promise<void>;
}

/**
 * This is a hidden utility component that helps with testing by automatically
 * adding the current user to a test neighborhood called "Terrific Terrace"
 */
const TerrificTerraceAdder: React.FC<TerrificTerraceAdderProps> = ({ addUserToNeighborhood }) => {
  const user = useUser();

  // When component mounts, attempt to add the user to the test neighborhood
  useEffect(() => {
    if (user) {
      // This is intentionally delayed to allow the app to initialize first
      const timer = setTimeout(() => {
        addUserToNeighborhood(user.id, 'Terrific Terrace');
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [user, addUserToNeighborhood]);

  // This component doesn't render anything
  return null;
};

export default TerrificTerraceAdder;
