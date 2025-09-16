import React, { useState } from 'react';
import { UserDirectory } from '@/components/neighbors/UserDirectory';
import { GroupsSections } from '@/components/groups/GroupsSections';
import { GroupsSearchBar } from '@/components/groups/GroupsSearchBar';
import { PhysicalUnitsView } from '@/components/groups/PhysicalUnitsView';
import { GroupProfileDialog } from '@/components/groups/GroupProfileDialog';
import { useGroups } from '@/hooks/useGroups';
import { TabsContent } from '@/components/ui/tabs';
import { Group } from '@/types/groups';

interface GroupsContainerProps {
  onCreateGroup: (templateData?: { name: string; description: string }) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

/**
 * GroupsContainer Component
 * 
 * Main container for the Groups page, structured similarly to GoodsPageContainer.
 * Handles the toggle between Groups and Directory views with consistent styling.
 */
export const GroupsContainer: React.FC<GroupsContainerProps> = ({
  onCreateGroup,
  activeTab,
  onTabChange
}) => {
  // State management for search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  // Fetch groups data
  const { data: groups = [], isLoading } = useGroups({
    search: searchQuery,
    includeCurrentUserMembership: true
  });

  // Handle group selection for profile dialog
  const handleGroupSelect = (group: Group) => {
    setSelectedGroup(group);
  };

  const handleCloseGroupProfile = () => {
    setSelectedGroup(null);
  };

  return (
    <div className="space-y-6">
      {/* Search bar with toggle and create button */}
      <GroupsSearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCreateGroup={onCreateGroup}
        activeTab={activeTab}
        onTabChange={onTabChange}
      />

      {/* Tab content */}
      <TabsContent value="groups" className="m-0">
        <GroupsSections 
          groups={groups}
          isLoading={isLoading}
          searchQuery={searchQuery}
          onCreateGroup={onCreateGroup}
          onGroupSelect={handleGroupSelect}
        />
      </TabsContent>
      
      <TabsContent value="units" className="m-0">
        <PhysicalUnitsView searchQuery={searchQuery} />
      </TabsContent>
      
      <TabsContent value="directory" className="m-0">
        <UserDirectory searchQuery={searchQuery} />
      </TabsContent>

      {/* Group Profile Dialog */}
      <GroupProfileDialog 
        group={selectedGroup}
        onClose={handleCloseGroupProfile}
      />
    </div>
  );
};