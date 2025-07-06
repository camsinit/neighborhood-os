
import React, { useState } from 'react';
import { ModuleContainer, ModuleContent, ModuleHeader } from '@/components/layout/module';
import { UserDirectory } from '@/components/neighbors/UserDirectory';
import { usePageSheetController } from '@/hooks/usePageSheetController';
import UnifiedInviteDialog from '@/components/invite/UnifiedInviteDialog';
import { Sheet } from '@/components/ui/sheet';
import NeighborSheetContent from '@/components/neighbors/NeighborSheetContent';
import { useNeighborUsers } from '@/components/neighbors/hooks/useNeighborUsers';

/**
 * NeighborsPage Component
 * 
 * Displays the neighbors directory with universal sheet management
 * and supports highlighting neighbors from deep links.
 */
function NeighborsPage() {
  const { data: users } = useNeighborUsers();
  
  // Universal page controller for sheet management
  const {
    isSheetOpen,
    sheetItem,
    openSheet,
    closeSheet
  } = usePageSheetController({
    contentType: 'neighbors',
    fetchItem: async (id: string) => {
      return users?.find(user => user.id === id) || null;
    },
    pageName: 'NeighborsPage'
  });
  
  // State for dialog controls
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  
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
        <UserDirectory />
      </ModuleContent>

      {/* Universal sheet management */}
      {isSheetOpen && sheetItem && (
        <Sheet open={isSheetOpen} onOpenChange={(open) => !open && closeSheet()}>
          <NeighborSheetContent neighbor={sheetItem} onOpenChange={closeSheet} />
        </Sheet>
      )}

      {/* The unified invite dialog */}
      <UnifiedInviteDialog 
        open={isInviteOpen} 
        onOpenChange={setIsInviteOpen}
      />
    </ModuleContainer>
  );
}

export default NeighborsPage;
