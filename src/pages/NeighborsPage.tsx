
import React, { useState } from 'react';
import ModuleLayout from '@/components/layout/ModuleLayout';
import { UserDirectory } from '@/components/neighbors/UserDirectory';
import { usePageSheetController } from '@/hooks/usePageSheetController';
import UnifiedInviteDialog from '@/components/invite/UnifiedInviteDialog';
import { Sheet } from '@/components/ui/sheet';
import NeighborSheetContent from '@/components/neighbors/NeighborSheetContent';
import { useNeighborUsers } from '@/components/neighbors/hooks/useNeighborUsers';
import { moduleThemeColors } from '@/theme/moduleTheme';

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
    <>
      <ModuleLayout
        title="Neighbors"
        description="Get to know the people in your community"
        themeColor="neighbors"
      >
        <div 
          className="backdrop-blur-sm rounded-lg border"
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderColor: moduleThemeColors.neighbors.primary + '40',
            boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 0 0 1px ${moduleThemeColors.neighbors.primary}10`
          }}
        >
          <UserDirectory />
        </div>
      </ModuleLayout>

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
    </>
  );
}

export default NeighborsPage;
