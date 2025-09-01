import React from 'react';
import { GroupsSections } from './GroupsSections';

/**
 * GroupsList Component
 * 
 * Legacy component maintained for backward compatibility.
 * Now redirects to GroupsSections.
 */

interface GroupsListProps {
  onAddGroup?: () => void; // Kept for compatibility
}

export const GroupsList: React.FC<GroupsListProps> = ({ onAddGroup }) => {
  // This component is now deprecated in favor of the new toggle pattern
  // It's maintained for backward compatibility only
  return (
    <div className="p-6">
      <GroupsSections 
        groups={[]}
        isLoading={false}
        searchQuery=""
        onCreateGroup={onAddGroup || (() => {})}
      />
    </div>
  );
};