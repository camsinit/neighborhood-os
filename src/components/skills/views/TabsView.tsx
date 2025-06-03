
import React from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import SkillsPageNavigation from '@/components/skills/SkillsPageNavigation';
import SkillsList from '@/components/skills/SkillsList';
import { SkillCategory } from '@/components/skills/types/skillTypes';

/**
 * TabsView - Displays the regular tabbed interface for skills
 * 
 * This component shows the tabs for offers, requests, and my skills
 * when not in category grid or search mode.
 */
interface TabsViewProps {
  view: string;
  category: string | null;
  searchQuery: string;
  searchParams: URLSearchParams;
  searchInputRef: React.RefObject<HTMLInputElement>;
  handleTabChange: (value: string) => void;
  setSearchParams: (params: URLSearchParams) => void;
  setIsSkillDialogOpen: (open: boolean) => void;
  getTypedCategory: (categoryString: string | null) => SkillCategory | undefined;
}

const TabsView: React.FC<TabsViewProps> = ({
  view,
  category,
  searchQuery,
  searchParams,
  searchInputRef,
  handleTabChange,
  setSearchParams,
  setIsSkillDialogOpen,
  getTypedCategory
}) => {
  return (
    <Tabs value={view} onValueChange={handleTabChange}>
      <SkillsPageNavigation
        view={view}
        searchQuery={searchQuery}
        searchParams={searchParams}
        searchInputRef={searchInputRef}
        handleTabChange={handleTabChange}
        setSearchParams={setSearchParams}
        setIsSkillDialogOpen={setIsSkillDialogOpen}
      />
      
      <TabsContent value="offers" className="mt-0">
        <SkillsList showRequests={false} selectedCategory={getTypedCategory(category)} searchQuery={searchQuery} />
      </TabsContent>
      <TabsContent value="requests" className="mt-0">
        <SkillsList showRequests={true} selectedCategory={getTypedCategory(category)} searchQuery={searchQuery} />
      </TabsContent>
      <TabsContent value="mine" className="mt-0">
        <SkillsList showMine={true} selectedCategory={getTypedCategory(category)} searchQuery={searchQuery} />
      </TabsContent>
    </Tabs>
  );
};

export default TabsView;
