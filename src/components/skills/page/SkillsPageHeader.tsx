
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search, UserPlus } from 'lucide-react'; // Added UserPlus icon
import SearchInput from '@/components/ui/search-input';
import SkillsFilter from '@/components/skills/SkillsFilter';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SkillCategory } from '@/components/skills/types/skillTypes';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Props for the SkillsPageHeader component
interface SkillsPageHeaderProps {
  searchQuery: string;
  handleSearchChange: (value: string) => void;
  category: string | null;
  handleCategoryChange: (newCategory: SkillCategory | null) => void;
  view: string;
  handleTabChange: (value: string) => void;
  handleOpenSkillDialog: (mode: 'offer' | 'request' | 'multi-request') => void; // Updated to include multi-request
}

/**
 * SkillsPageHeader - Component for the skills page header with search, filter and tabs
 * 
 * This component has been updated to include multi-provider request functionality
 */
const SkillsPageHeader: React.FC<SkillsPageHeaderProps> = ({
  searchQuery,
  handleSearchChange,
  category,
  handleCategoryChange,
  view,
  handleTabChange,
  handleOpenSkillDialog
}) => {
  // Convert string category to SkillCategory type or undefined
  const getTypedCategory = (categoryString: string | null): SkillCategory | undefined => {
    if (!categoryString) return undefined;
    return categoryString as SkillCategory;
  };
  
  return (
    <div className="flex flex-col space-y-4">
      {/* Reorganized top section with all controls in a single row */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center w-full">
          {/* Search input */}
          <SearchInput 
            placeholder="Search skills..."
            onChange={(e) => handleSearchChange(e.target.value)}
            value={searchQuery}
            className="w-full sm:w-[200px]"
          />
          
          {/* Category filter */}
          <SkillsFilter 
            selectedCategory={getTypedCategory(category) || null}
            onCategoryChange={handleCategoryChange}
          />
          
          {/* TabsList for navigation */}
          <TabsList className="ml-0 sm:ml-2">
            <TabsTrigger value="offers">Offers</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="mine">My Skills</TabsTrigger>
          </TabsList>
        </div>
        
        {/* Add Skills dropdown with options */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              className="whitespace-nowrap flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Add Skill</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              onClick={() => handleOpenSkillDialog('offer')}
              className="cursor-pointer"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Offer a Skill
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleOpenSkillDialog('request')}
              className="cursor-pointer"
            >
              <Search className="h-4 w-4 mr-2" />
              Request a Skill
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleOpenSkillDialog('multi-request')}
              className="cursor-pointer"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Request from Multiple Providers
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default SkillsPageHeader;
