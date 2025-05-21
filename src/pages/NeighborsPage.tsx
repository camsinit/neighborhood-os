
import React, { useEffect } from 'react';
import { ModuleContainer, ModuleContent, ModuleHeader } from '@/components/layout/module';
import { UserDirectory } from '@/components/neighbors/UserDirectory';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import InviteNeighborPopover from '@/components/neighbors/InviteNeighborPopover';
import { useSearchParams } from 'react-router-dom';
import { highlightItem } from '@/utils/highlight';
import { useHighlightedItem } from '@/hooks/useHighlightedItem';
import GodModeSelector from '@/components/neighbors/GodModeSelector';

/**
 * NeighborsPage Component
 * 
 * This page displays the neighbors directory for the community.
 * Uses the module system for consistent layout and theming.
 */
function NeighborsPage() {
  // Hooks for handling URL params and highlighted items
  const [searchParams] = useSearchParams();
  const highlightedNeighbor = useHighlightedItem('neighbors');
  const [isInviteOpen, setIsInviteOpen] = React.useState(false);
  
  // Effect to handle deep linking to specific neighbor profiles
  useEffect(() => {
    const neighborId = searchParams.get('neighborId');
    if (neighborId) {
      highlightItem('neighbors', neighborId);
    }
  }, [searchParams]);
  
  return (
    <ModuleContainer themeColor="neighbors">
      <ModuleHeader 
        title="Neighbors" 
        description="Get to know the people in your community"
        themeColor="neighbors"
        actions={
          <InviteNeighborPopover>
            <Button className="whitespace-nowrap flex items-center gap-1.5">
              <PlusCircle className="h-4 w-4" />
              <span>Invite Neighbor</span>
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
