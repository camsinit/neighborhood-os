
import React, { useEffect, useState } from 'react';
import { ModuleContainer, ModuleContent, ModuleHeader } from '@/components/layout/module';
import { UserDirectory } from '@/components/neighbors/UserDirectory';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { highlightItem } from '@/utils/highlight';
import { useHighlightedItem } from '@/hooks/useHighlightedItem';
import InviteNeighborPopover from '@/components/neighbors/InviteNeighborPopover';

/**
 * NeighborsPage Component
 * 
 * Displays the neighbors directory with proper module styling
 * and supports highlighting neighbors from deep links.
 */
function NeighborsPage() {
  // State for route parameters and highlighting
  const [searchParams] = useSearchParams();
  const highlightedNeighbor = useHighlightedItem('neighbors');
  
  // State for dialog controls
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  
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
          <Button 
            variant="default" 
            className="flex items-center gap-1.5" 
            onClick={() => setIsInviteOpen(true)}
          >
            <Plus className="h-4 w-4" />
            <span>Invite Neighbor</span>
          </Button>
        }
      />
      <ModuleContent>
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg">
          <UserDirectory />
        </div>
      </ModuleContent>

      {/* The popover with proper props */}
      <InviteNeighborPopover 
        open={isInviteOpen} 
        onOpenChange={setIsInviteOpen}
      />
    </ModuleContainer>
  );
}

export default NeighborsPage;
