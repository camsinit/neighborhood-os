
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
  searchInputRef: React.RefObject<HTMLInputElement>;
  handleTabChange: (value: string) => void;
  handleCategoryClick: (selectedCategory: SkillCategory) => void;
  handleBackToCategories: () => void;
  getTypedCategory: (categoryString: string | null) => SkillCategory | undefined;
  setSearchParams: (searchParams: URLSearchParams) => void;
  setIsSkillDialogOpen: (open: boolean) => void;
}

const SkillsPageContent: React.FC<SkillsPageContentProps> = ({
  view,
  category,
  searchQuery,
  searchParams,
  searchInputRef,
  handleTabChange,
  handleCategoryClick,
  handleBackToCategories,
  getTypedCategory,
  setSearchParams,
  setIsSkillDialogOpen
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
            searchInputRef={searchInputRef}
            handleTabChange={handleTabChange}
            setSearchParams={setSearchParams}
            setIsSkillDialogOpen={setIsSkillDialogOpen}
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
