
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import SearchInput from '@/components/ui/search-input';
import SkillsFilter from '@/components/skills/SkillsFilter';
import SkillsList from '@/components/skills/SkillsList';
import { SkillCategory } from '@/components/skills/types/skillTypes';

/**
 * SearchResultsView - Displays search results for skills
 * 
 * This component shows the search interface and results when a user
 * has entered a search query.
 */
interface SearchResultsViewProps {
  searchQuery: string;
  searchParams: URLSearchParams;
  category: string | null;
  setSearchParams: (params: URLSearchParams) => void;
  handleBackToCategories: () => void;
  setIsSkillDialogOpen: (open: boolean) => void;
  getTypedCategory: (categoryString: string | null) => SkillCategory | undefined;
  searchInputRef: React.RefObject<HTMLInputElement>;
}

const SearchResultsView: React.FC<SearchResultsViewProps> = ({
  searchQuery,
  searchParams,
  category,
  setSearchParams,
  handleBackToCategories,
  setIsSkillDialogOpen,
  getTypedCategory,
  searchInputRef
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between">
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
          
          <Button 
            variant="outline"
            onClick={handleBackToCategories}
          >
            Clear Search
          </Button>
        </div>
        
        <Button 
          className="whitespace-nowrap flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white shrink-0"
          onClick={() => setIsSkillDialogOpen(true)}
        >
          <PlusCircle className="h-4 w-4" />
          <span>Add Skill</span>
        </Button>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Search Results for "{searchQuery}"
        </h2>
        <SkillsList showRequests={false} selectedCategory={getTypedCategory(category)} searchQuery={searchQuery} />
      </div>
    </div>
  );
};

export default SearchResultsView;
