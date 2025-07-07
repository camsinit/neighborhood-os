
import React from 'react';
import { Button } from '@/components/ui/button';
import { ThemedTabs, ThemedTabsList, ThemedTabsTrigger } from '@/components/ui/themed-tabs';
import { PlusCircle, MessageSquare } from 'lucide-react';
import SearchInput from '@/components/ui/search-input';
import SkillsFilter from '@/components/skills/SkillsFilter';
import SimpleSkillRequestPopover from './SimpleSkillRequestPopover';

/**
 * SkillsPageNavigation - Navigation controls for the Skills page
 * 
 * This component handles search, filter, tabs, and the add/request skill buttons.
 * It's been extracted from the main SkillsPage for better organization.
 * Now uses the SimpleSkillRequestPopover for skill requests.
 * Updated to use standard tabs styling like Freebies.
 */
interface SkillsPageNavigationProps {
  view: string;
  searchQuery: string;
  searchParams: URLSearchParams;
  searchInputRef: React.RefObject<HTMLInputElement>;
  handleTabChange: (value: string) => void;
  setSearchParams: (params: URLSearchParams) => void;
  setIsSkillDialogOpen: (open: boolean) => void;
}

const SkillsPageNavigation: React.FC<SkillsPageNavigationProps> = ({
  view,
  searchQuery,
  searchParams,
  searchInputRef,
  handleTabChange,
  setSearchParams,
  setIsSkillDialogOpen
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between">
      {/* Search and filter section on left */}
      <div className="flex gap-2 flex-grow">
        <SearchInput 
          placeholder="Search skills..."
          onChange={(e) => {
            const newParams = new URLSearchParams(searchParams);
            if (e.target.value) {
              newParams.set('q', e.target.value);
            } else {
              newParams.delete('q');
            }
            setSearchParams(newParams);
          }}
          value={searchQuery}
          ref={searchInputRef}
        />
        <SkillsFilter />
        
        {/* Tabs using themed styling */}
        <div className="ml-auto hidden sm:block">
          <ThemedTabs value={view} onValueChange={handleTabChange}>
            <ThemedTabsList themeColor="skills">
              <ThemedTabsTrigger value="offers" themeColor="skills">Offers</ThemedTabsTrigger>
              <ThemedTabsTrigger value="requests" themeColor="skills">Requests</ThemedTabsTrigger>
              <ThemedTabsTrigger value="mine" themeColor="skills">My Skills</ThemedTabsTrigger>
            </ThemedTabsList>
          </ThemedTabs>
        </div>
      </div>
      
      {/* Show tabs on mobile below search/filter using themed styling */}
      <div className="sm:hidden w-full">
        <ThemedTabs value={view} onValueChange={handleTabChange}>
          <ThemedTabsList className="w-full" themeColor="skills">
            <ThemedTabsTrigger value="offers" className="flex-1" themeColor="skills">Offers</ThemedTabsTrigger>
            <ThemedTabsTrigger value="requests" className="flex-1" themeColor="skills">Requests</ThemedTabsTrigger>
            <ThemedTabsTrigger value="mine" className="flex-1" themeColor="skills">My Skills</ThemedTabsTrigger>
          </ThemedTabsList>
        </ThemedTabs>
      </div>
      
      {/* Action buttons section */}
      <div className="flex gap-2 shrink-0">
        {/* Request Skill button */}
        <SimpleSkillRequestPopover>
          <Button 
            className="whitespace-nowrap flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Request Skill</span>
          </Button>
        </SimpleSkillRequestPopover>
        
        {/* Add Skill button */}
        <Button 
          className="whitespace-nowrap flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white"
          onClick={() => setIsSkillDialogOpen(true)}
        >
          <PlusCircle className="h-4 w-4" />
          <span>Add Skill</span>
        </Button>
      </div>
    </div>
  );
};

export default SkillsPageNavigation;
