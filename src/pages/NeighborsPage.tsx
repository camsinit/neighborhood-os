
import React, { useEffect } from 'react';
import { ModuleContainer, ModuleContent, ModuleHeader } from '@/components/layout/module';
import { UserDirectory } from '@/components/neighbors/UserDirectory'; // Changed to named import
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { highlightItem } from '@/utils/highlight';
import { useHighlightedItem } from '@/hooks/useHighlightedItem';
import GodModeSelector from '@/components/neighbors/GodModeSelector';
import { useState } from 'react';
import InviteNeighborPopover from '@/components/neighbors/InviteNeighborPopover';

/**
 * NeighborsPage Component
 * 
 * Displays the neighbors directory with proper module styling
 * and supports highlighting neighbors from deep links.
 */
function NeighborsPage() {
  const [searchParams] = useSearchParams();
  const highlightedNeighbor = useHighlightedItem('neighbors');
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
        <div className="module-card">
          <GodModeSelector />
          <UserDirectory />
        </div>
      </ModuleContent>
    </ModuleContainer>
  );
}

export default NeighborsPage;
