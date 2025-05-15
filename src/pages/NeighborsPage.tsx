import React, { useEffect } from 'react';
import { ModuleContainer, ModuleContent, ModuleHeader } from '@/components/layout/module';
import UserDirectory from '@/components/neighbors/UserDirectory';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import InviteNeighborPopover from '@/components/neighbors/InviteNeighborPopover';
import { useSearchParams } from 'react-router-dom';
import { highlightItem } from '@/utils/highlight';
import { useHighlightedItem } from '@/hooks/useHighlightedItem';
import GodModeSelector from '@/components/neighbors/GodModeSelector';

function NeighborsPage() {
  const [searchParams] = useSearchParams();
  const highlightedNeighbor = useHighlightedItem('neighbors');
  
  // Effect to handle deep linking to specific neighbor profiles
  useEffect(() => {
    const neighborId = searchParams.get('neighborId');
    if (neighborId) {
      // Fixed highlightItem call
      highlightItem('neighbors', neighborId);
    }
  }, [searchParams]);
  
  return (
    <ModuleContainer>
      <ModuleHeader 
        title="Neighbors" 
        description="Get to know the people in your community"
        actions={
          <InviteNeighborPopover>
            <Button variant="default" className="flex items-center gap-1.5">
              <Plus className="h-4 w-4" />
              Invite Neighbor
            </Button>
          </InviteNeighborPopover>
        }
      />
      <ModuleContent>
        <GodModeSelector />
        <UserDirectory />
      </ModuleContent>
    </ModuleContainer>
  );
}

export default NeighborsPage;
