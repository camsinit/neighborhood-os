
import React, { useEffect, useState } from 'react';
import { ModuleContainer, ModuleContent, ModuleHeader } from '@/components/layout/module';
import { UserDirectory } from '@/components/neighbors/UserDirectory';
import { useSearchParams } from 'react-router-dom';
import { highlightItem } from '@/utils/highlight';
import { useHighlightedItem } from '@/hooks/useHighlightedItem';
import UnifiedInviteDialog from '@/components/invite/UnifiedInviteDialog';

/**
 * NeighborsPage Component
 * 
 * Displays the neighbors directory with proper module styling
 * and supports highlighting neighbors from deep links.
 * Now uses the unified invite dialog system.
 */
function NeighborsPage() {
  // State for route parameters and highlighting
  const [searchParams] = useSearchParams();
  const highlightedNeighbor = useHighlightedItem('neighbors');
  
  // State for dialog controls - now uses unified invite dialog
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
      {/* Header with just the title */}
      <ModuleHeader 
        title="Neighbors" 
        themeColor="neighbors"
      />
      
      {/* Full-width description box with consistent padding */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 mb-6 sm:px-[25px]">
        <div className="module-description bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-100 shadow-sm mx-0 px-[16px]">
          <p className="text-gray-700 text-sm">Get to know the people in your community</p>
        </div>
      </div>
      
      <ModuleContent>
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg">
          <UserDirectory />
        </div>
      </ModuleContent>

      {/* The unified invite dialog */}
      <UnifiedInviteDialog 
        open={isInviteOpen} 
        onOpenChange={setIsInviteOpen}
      />
    </ModuleContainer>
  );
}

export default NeighborsPage;
