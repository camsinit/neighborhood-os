
/**
 * Hidden component for development that adds test user to a specific neighborhood
 * Only adds the user if they aren't already a member
 */
import React, { useEffect, useState } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { checkNeighborhoodMembership } from '@/contexts/neighborhood/utils';
import { supabase } from '@/integrations/supabase/client';
import { createLogger } from '@/utils/logger';

// Create a logger for this component
const logger = createLogger('TerrificTerraceAdder');

// Define props interface
interface TerrificTerraceAdderProps {
  addUserToNeighborhood: (userId: string, neighborhoodName: string) => Promise<void>;
}

/**
 * This is a hidden utility component that helps with testing by automatically
 * adding the current user to a test neighborhood called "Terrific Terrace"
 * 
 * The enhanced version now checks if a user is already a member before attempting to add them,
 * which prevents unnecessary toasts.
 */
const TerrificTerraceAdder: React.FC<TerrificTerraceAdderProps> = ({ addUserToNeighborhood }) => {
  const user = useUser();
  const [hasCheckedMembership, setHasCheckedMembership] = useState(false);

  // When component mounts, check if user is already a member before adding them
  useEffect(() => {
    // Skip if no user or if we've already checked
    if (!user || hasCheckedMembership) return;

    const checkAndAddUser = async () => {
      try {
        // First, find the neighborhood ID
        const { data: neighborhoods } = await supabase
          .from('neighborhoods')
          .select('id')
          .eq('name', 'Terrific Terrace')
          .limit(1);
        
        if (!neighborhoods || neighborhoods.length === 0) {
          logger.debug('Terrific Terrace neighborhood not found');
          return;
        }
        
        const neighborhoodId = neighborhoods[0].id;
        
        // Check if user is already a member
        const isMember = await checkNeighborhoodMembership(user.id, neighborhoodId);
        
        // Only add if not already a member
        if (!isMember) {
          logger.debug('User is not a member, adding to Terrific Terrace');
          // This is intentionally delayed to allow the app to initialize first
          const timer = setTimeout(() => {
            addUserToNeighborhood(user.id, 'Terrific Terrace');
          }, 1500);
          
          return () => clearTimeout(timer);
        } else {
          logger.debug('User is already a member of Terrific Terrace, not adding');
        }
        
        setHasCheckedMembership(true);
      } catch (error) {
        logger.error('Error in TerrificTerraceAdder:', error);
      }
    };

    checkAndAddUser();
  }, [user, addUserToNeighborhood, hasCheckedMembership]);

  // This component doesn't render anything
  return null;
};

export default TerrificTerraceAdder;
