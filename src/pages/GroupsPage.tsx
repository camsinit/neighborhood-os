import React, { useState } from 'react';
import ModuleLayout from '@/components/layout/ModuleLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet } from '@/components/ui/sheet';
import { UserDirectory } from '@/components/neighbors/UserDirectory';
import { usePageSheetController } from '@/hooks/usePageSheetController';
import UnifiedInviteDialog from '@/components/invite/UnifiedInviteDialog';
import NeighborSheetContent from '@/components/neighbors/NeighborSheetContent';
import { useNeighborUsers } from '@/components/neighbors/hooks/useNeighborUsers';
import { moduleThemeColors } from '@/theme/moduleTheme';

// Import groups components
import { GroupsContainer } from '@/components/groups/GroupsContainer';
import { CreateGroupDialog } from '@/components/groups/CreateGroupDialog';

/**
 * GroupsPage Component
 * 
 * Transformed from NeighborsPage to be the primary Groups page
 * with a Directory tab for the existing neighbors functionality.
 * Uses tabs to switch between Groups (primary) and Directory views.
 */
function GroupsPage() {
  const { data: users } = useNeighborUsers();
  const [activeTab, setActiveTab] = useState('groups');
  
  // Universal page controller for sheet management (for neighbors tab)
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
    pageName: 'GroupsPage'
  });
  
  // State for dialogs
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };
  
  return (
    <>
      <ModuleLayout
        title="Groups"
        description="Connect with your community through groups and neighbors"
        themeColor="neighbors"
      >
        <div 
          className="backdrop-blur-sm rounded-lg p-6 shadow-lg border"
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderColor: moduleThemeColors.neighbors.primary + '40',
            boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 0 0 1px ${moduleThemeColors.neighbors.primary}10`
          }}
        >
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <GroupsContainer 
              onCreateGroup={() => setIsCreateGroupOpen(true)}
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
          </Tabs>
        </div>
      </ModuleLayout>

      {/* Universal sheet management for neighbors */}
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

      {/* Create group dialog */}
      <CreateGroupDialog 
        open={isCreateGroupOpen}
        onOpenChange={setIsCreateGroupOpen}
      />
    </>
  );
}

export default GroupsPage;