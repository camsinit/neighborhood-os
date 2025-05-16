
import React, { useEffect } from 'react';
import { ModuleLayout } from '@/components/layout';
import { UserDirectory } from '@/components/neighbors/UserDirectory'; 
import InviteNeighborPopover from '@/components/neighbors/InviteNeighborPopover';
import { useSearchParams } from 'react-router-dom';
import { highlightItem } from '@/utils/highlight';
import { useHighlightedItem } from '@/hooks/useHighlightedItem';
import { createLogger } from '@/utils/logger';
import GodModeSelector from '@/components/neighbors/GodModeSelector';

// Create a logger for this component
const logger = createLogger('NeighborsPage');

/**
 * NeighborsPage Component
 * 
 * Main page for viewing and interacting with neighbors in the community.
 * Displays a directory of all neighbors and handles highlighting specific profiles.
 * Now includes improved highlighting behavior with smooth scrolling.
 */
function NeighborsPage() {
  const [searchParams] = useSearchParams();
  const highlightedNeighbor = useHighlightedItem('neighbor');
  
  // Effect to handle deep linking to specific neighbor profiles
  useEffect(() => {
    const neighborId = searchParams.get('neighborId');
    if (neighborId) {
      logger.debug(`Highlighting neighbor from URL params: ${neighborId}`);
      
      // Use the highlight system to highlight the specified neighbor
      highlightItem('neighbor', neighborId, true); // Pass true to show toast
    }
  }, [searchParams]);
  
  return (
    <ModuleLayout
      title="Neighbors" 
      description="Get to know the people in your community"
      themeColor="neighbors"
      actions={<InviteNeighborPopover />}
    >
      <GodModeSelector />
      <UserDirectory />
    </ModuleLayout>
  );
}

export default NeighborsPage;
