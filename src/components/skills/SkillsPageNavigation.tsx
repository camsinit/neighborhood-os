
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle } from 'lucide-react';
import SearchInput from '@/components/ui/search-input';
import SkillsFilter from '@/components/skills/SkillsFilter';

/**
 * SkillsPageNavigation - Navigation controls for the Skills page
 * 
 * This component handles search, filter, tabs, and the add skill button.
 * It's been extracted from the main SkillsPage for better organization.
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
        
        {/* Tabs wrapped properly */}
        <div className="ml-auto hidden sm:block">
          <Tabs value={view} onValueChange={handleTabChange}>
            <TabsList>
              <TabsTrigger value="offers">Offers</TabsTrigger>
              <TabsTrigger value="requests">Requests</TabsTrigger>
              <TabsTrigger value="mine">My Skills</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      {/* Show tabs on mobile below search/filter */}
      <div className="sm:hidden w-full">
        <Tabs value={view} onValueChange={handleTabChange}>
          <TabsList className="w-full">
            <TabsTrigger value="offers" className="flex-1">Offers</TabsTrigger>
            <TabsTrigger value="requests" className="flex-1">Requests</TabsTrigger>
            <TabsTrigger value="mine" className="flex-1">My Skills</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Green Add Skills button with click handler */}
      <Button 
        className="whitespace-nowrap flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white shrink-0"
        onClick={() => setIsSkillDialogOpen(true)}
      >
        <PlusCircle className="h-4 w-4" />
        <span>Add Skill</span>
      </Button>
    </div>
  );
};

export default SkillsPageNavigation;
