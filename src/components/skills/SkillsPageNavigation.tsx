
import React from 'react';
import { Button } from '@/components/ui/button';
import { ThemedTabs, ThemedTabsList, ThemedTabsTrigger } from '@/components/ui/themed-tabs';
import { PlusCircle, MessageSquare } from 'lucide-react';
import SearchInput from '@/components/ui/search-input';
import SkillsFilter from '@/components/skills/SkillsFilter';

/**
 * SkillsPageNavigation - Navigation controls for the Skills page
 * 
 * This component handles search, filter, tabs, and the add skill button.
 * It's been extracted from the main SkillsPage for better organization.
 * Updated to use standard tabs styling consistent with other pages.
 * Simplified to focus on core navigation functionality.
 */
interface SkillsPageNavigationProps {
  view: string;
  searchQuery: string;
  searchParams: URLSearchParams;
  handleTabChange: (value: string) => void;
  setSearchParams: (params: URLSearchParams) => void;
  setIsSkillOfferSheetOpen: (open: boolean) => void;
  // Function to open the skill request sheet
  setIsSkillRequestSheetOpen?: (open: boolean) => void;
}

const SkillsPageNavigation: React.FC<SkillsPageNavigationProps> = ({
  view,
  searchQuery,
  searchParams,
  handleTabChange,
  setSearchParams,
  setIsSkillOfferSheetOpen,
  setIsSkillRequestSheetOpen
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
              newParams.set('search', e.target.value);
            } else {
              newParams.delete('search');
            }
            setSearchParams(newParams);
          }}
          value={searchQuery}
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
        {/* Request Skill button - allows users to request help from neighbors */}
        {setIsSkillRequestSheetOpen && (
          <Button 
            className="whitespace-nowrap flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white"
            onClick={() => setIsSkillRequestSheetOpen(true)}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Request</span>
          </Button>
        )}
        
        {/* Add Skill button - allows users to offer skills to neighbors */}
        <Button 
          className="whitespace-nowrap flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white"
          onClick={() => setIsSkillOfferSheetOpen(true)}
        >
          <PlusCircle className="h-4 w-4" />
          <span>Add Skill</span>
        </Button>
      </div>
    </div>
  );
};

export default SkillsPageNavigation;
