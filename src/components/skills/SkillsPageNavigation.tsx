
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
        
        {/* Tabs wrapped properly with green styling for active tabs */}
        <div className="ml-auto hidden sm:block">
          <Tabs value={view} onValueChange={handleTabChange}>
            <TabsList className="bg-gray-100">
              <TabsTrigger 
                value="offers"
                className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
              >
                Offers
              </TabsTrigger>
              <TabsTrigger 
                value="requests"
                className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
              >
                Requests
              </TabsTrigger>
              <TabsTrigger 
                value="mine"
                className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
              >
                My Skills
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      {/* Show tabs on mobile below search/filter with green styling */}
      <div className="sm:hidden w-full">
        <Tabs value={view} onValueChange={handleTabChange}>
          <TabsList className="w-full bg-gray-100">
            <TabsTrigger 
              value="offers" 
              className="flex-1 data-[state=active]:bg-green-500 data-[state=active]:text-white"
            >
              Offers
            </TabsTrigger>
            <TabsTrigger 
              value="requests" 
              className="flex-1 data-[state=active]:bg-green-500 data-[state=active]:text-white"
            >
              Requests
            </TabsTrigger>
            <TabsTrigger 
              value="mine" 
              className="flex-1 data-[state=active]:bg-green-500 data-[state=active]:text-white"
            >
              My Skills
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Action buttons section - Add Skill and Request Skill with new popover */}
      <div className="flex gap-2 shrink-0">
        {/* Request Skill button with simple popover */}
        <SimpleSkillRequestPopover>
          <Button 
            variant="outline"
            className="whitespace-nowrap flex items-center gap-1.5 border-green-500 text-green-600 hover:bg-green-50"
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
