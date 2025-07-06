
import React, { useEffect, useState } from 'react';
import { ModuleContainer, ModuleContent, ModuleHeader } from '@/components/layout/module';
import { UserDirectory } from '@/components/neighbors/UserDirectory';
import { useSearchParams } from 'react-router-dom';
import { highlightItem } from '@/utils/highlight';
import { useHighlightedItem } from '@/hooks/useHighlightedItem';
import UnifiedInviteDialog from '@/components/invite/UnifiedInviteDialog';
import { createLogger } from '@/utils/logger';

const logger = createLogger('NeighborsPage');

/**
 * NeighborsPage Component
 * 
 * Displays the neighbors directory with proper module styling
 * and supports highlighting neighbors from deep links.
 * Now uses the unified invite dialog system and matches safety page margins.
 */
function NeighborsPage() {
  // State for route parameters and highlighting
  const [searchParams] = useSearchParams();
  const highlightedNeighbor = useHighlightedItem('neighbors');
  
  // State for dialog controls - now uses unified invite dialog
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  
  // Enhanced contextual navigation handling
  useEffect(() => {
    const neighborId = searchParams.get('neighborId');
    const highlightId = searchParams.get('highlight');
    const profileParam = searchParams.get('profile');
    const dialogParam = searchParams.get('dialog');
    
    // Handle legacy neighborId parameter
    if (neighborId) {
      highlightItem('neighbors', neighborId);
    }
    
    // Handle new highlight parameter
    if (highlightId) {
      highlightItem('neighbors', highlightId);
    }
    
    // Auto-open neighbor profile if requested
    if (highlightId && (dialogParam === 'true' || profileParam === 'open')) {
      // Delay to ensure neighbor is highlighted first
      setTimeout(() => {
        const neighborElement = document.querySelector(`[data-neighbor-id="${highlightId}"]`) as HTMLElement;
        if (neighborElement) {
          neighborElement.click(); // Trigger neighbor profile opening
          logger.info(`Auto-opened neighbor profile for: ${highlightId}`);
        }
      }, 1000);
    }
    
    logger.info('Neighbors page contextual navigation:', {
      highlight: highlightId,
      profile: profileParam,
      dialog: dialogParam
    });
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
        {/* Remove the bg-white wrapper to match safety updates structure */}
        <UserDirectory />
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
