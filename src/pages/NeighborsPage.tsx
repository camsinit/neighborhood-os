
import React, { useEffect } from 'react';
import { ModuleLayout } from '@/components/layout';
import { UserDirectory } from '@/components/neighbors/UserDirectory'; 
import InviteNeighborPopover from '@/components/neighbors/InviteNeighborPopover';
import { useSearchParams } from 'react-router-dom';
import { highlightItem } from '@/utils/highlight';
import { useHighlightedItem } from '@/hooks/useHighlightedItem';
import GodModeSelector from '@/components/neighbors/GodModeSelector';

/**
 * NeighborsPage Component
 * 
 * Main page for viewing and interacting with neighbors in the community.
 * Displays a directory of all neighbors and handles highlighting specific profiles.
 */
function NeighborsPage() {
  const [searchParams] = useSearchParams();
  const highlightedNeighbor = useHighlightedItem('neighbor');
  
  // Effect to handle deep linking to specific neighbor profiles
  useEffect(() => {
    const neighborId = searchParams.get('neighborId');
    if (neighborId) {
      highlightItem('neighbor', neighborId);
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
