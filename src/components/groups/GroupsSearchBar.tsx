import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, UsersRound, Users } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface GroupsSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCreateGroup: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

/**
 * GroupsSearchBar - Search and navigation component for the groups page
 * 
 * This component provides search functionality, tab navigation between Groups and Directory,
 * and action button for creating new groups. Styled to match the neighbors theme with purple colors.
 */
export const GroupsSearchBar: React.FC<GroupsSearchBarProps> = ({
  searchQuery,
  onSearchChange,
  onCreateGroup,
  activeTab,
  onTabChange
}) => {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        {/* Search input with magnifying glass icon */}
        <div className="relative w-[180px]">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <Input 
            type="text" 
            placeholder="Search..." 
            value={searchQuery} 
            onChange={e => onSearchChange(e.target.value)} 
            className="pl-10" 
          />
        </div>

        {/* Tab navigation for switching between Groups and Directory */}
        <Tabs value={activeTab} onValueChange={onTabChange}>
          <TabsList>
            <TabsTrigger value="groups" className="flex items-center gap-1.5">
              <UsersRound className="h-4 w-4" />
              Groups
            </TabsTrigger>
            <TabsTrigger value="directory" className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              Directory
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Create group button with purple theme matching neighbors color */}
      <Button 
        onClick={onCreateGroup} 
        className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1.5"
      >
        <UsersRound className="h-4 w-4" />
        New Group
      </Button>
    </div>
  );
};