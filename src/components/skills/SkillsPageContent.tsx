
import React from 'react';
import { SkillCategory } from './types/skillTypes';
import CategorySkillsView from './views/CategorySkillsView';
import SkillCategoryGrid from './SkillCategoryGrid';
import SkillsPageNavigation from './SkillsPageNavigation';
import SkillsList from './SkillsList';

interface SkillsPageContentProps {
  view: string;
  category: string | null;
  searchQuery: string;
  searchParams: URLSearchParams;
  handleTabChange: (value: string) => void;
  handleCategoryClick: (selectedCategory: SkillCategory) => void;
  handleBackToCategories: () => void;
  getTypedCategory: (categoryString: string | null) => SkillCategory | undefined;
  setSearchParams: (searchParams: URLSearchParams) => void;
  setIsSkillDialogOpen: (open: boolean) => void;
  // Function to open the skill request sheet
  setIsSkillRequestSheetOpen?: (open: boolean) => void;
}

const SkillsPageContent: React.FC<SkillsPageContentProps> = ({
  view,
  category,
  searchQuery,
  searchParams,
  handleTabChange,
  handleCategoryClick,
  handleBackToCategories,
  getTypedCategory,
  setSearchParams,
  setIsSkillDialogOpen,
  setIsSkillRequestSheetOpen
}) => {
  return (
    <div className="space-y-6">
      {/* Category view - when a specific category is selected */}
      {/* This view has its own header with back button, title, and add skill button */}
      {category && (
        <CategorySkillsView 
          category={getTypedCategory(category)!} 
          onBack={handleBackToCategories}
          onAddSkill={() => setIsSkillDialogOpen(true)}
        />
      )}

      {/* Main view - when no category is selected */}
      {!category && (
        <>
          {/* Show the navigation header with search, tabs, and action buttons */}
          <SkillsPageNavigation
            view={view}
            searchQuery={searchQuery}
            searchParams={searchParams}
            handleTabChange={handleTabChange}
            setSearchParams={setSearchParams}
            setIsSkillDialogOpen={setIsSkillDialogOpen}
            setIsSkillRequestSheetOpen={setIsSkillRequestSheetOpen}
          />

          {/* Show different content based on the selected view */}
          {view === 'offers' && !searchQuery && (
            <SkillCategoryGrid onCategoryClick={handleCategoryClick} />
          )}
          
          {view === 'requests' && (
            <SkillsList showRequests={true} searchQuery={searchQuery} />
          )}
          
          {view === 'mine' && (
            <SkillsList showMine={true} searchQuery={searchQuery} />
          )}
          
          {/* Show search results when there's a search query */}
          {searchQuery && (
            <SkillsList 
              showRequests={view === 'requests'} 
              showMine={view === 'mine'} 
              searchQuery={searchQuery} 
            />
          )}
        </>
      )}
    </div>
  );
};

export default SkillsPageContent;
