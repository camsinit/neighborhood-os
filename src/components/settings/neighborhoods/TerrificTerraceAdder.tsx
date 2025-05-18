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
  // This component is temporarily disabled to prevent unwanted toast messages
  // We'll keep the code for future debugging needs but not execute it
  
  // Return null so the component doesn't render anything
  return null;
};

export default TerrificTerraceAdder;
