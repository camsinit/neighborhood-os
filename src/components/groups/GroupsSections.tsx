import React from 'react';
import { Group } from '@/types/groups';
import { GroupCard } from '@/components/groups/GroupCard';
import { GroupsEmptyState } from '@/components/groups/GroupsEmptyState';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, Loader2 } from 'lucide-react';
import { useNeighborhoodPhysicalConfig } from '@/hooks/useGroups';

interface GroupsSectionsProps {
  groups: Group[];
  isLoading: boolean;
  searchQuery: string;
  onCreateGroup: (templateData?: { name: string; description: string }) => void;
  onGroupSelect?: (group: Group) => void;
}

/**
 * GroupsSections Component
 * 
 * Displays groups organized by type (Physical vs Social) with proper loading and empty states.
 * Follows the same pattern as other sections in the app.
 */
export const GroupsSections: React.FC<GroupsSectionsProps> = ({
  groups,
  isLoading,
  searchQuery,
  onCreateGroup,
  onGroupSelect
}) => {
  const { data: physicalConfig } = useNeighborhoodPhysicalConfig();

  // Filter groups based on search
  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Only show social groups in the Groups tab (physical groups are shown in Streets tab)
  const socialGroups = filteredGroups.filter(group => group.group_type === 'social');

  // Dynamic section title for physical groups
  const physicalSectionTitle = physicalConfig?.physical_unit_label 
    ? `${physicalConfig.physical_unit_label} Groups`
    : 'Physical Groups';

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading groups...</span>
        </div>
      </div>
    );
  }

  // Empty state (no groups or no search results)
  if (filteredGroups.length === 0) {
    if (searchQuery) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <p className="text-lg">No groups found matching "{searchQuery}"</p>
          <p className="text-sm">Try a different search term</p>
        </div>
      );
    }
    
    return <GroupsEmptyState onCreateGroup={onCreateGroup} />;
  }

  return (
    <div className="space-y-8">
      {/* Social Groups Section - Only social groups are shown in Groups tab */}
      {socialGroups.length > 0 && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {socialGroups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                showJoinButton={true}
                onClick={onGroupSelect}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};