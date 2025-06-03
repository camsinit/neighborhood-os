
import React, { useState } from 'react';
import CategoryGridView from '@/components/skills/views/CategoryGridView';
import CategorySkillsView from '@/components/skills/views/CategorySkillsView';
import SearchResultsView from '@/components/skills/views/SearchResultsView';
import TabsView from '@/components/skills/views/TabsView';
import CategorySkillsDialog from '@/components/skills/CategorySkillsDialog';
import { SkillCategory } from '@/components/skills/types/skillTypes';

/**
 * SkillsPageContent - Main content area for the Skills page
 * 
 * This component handles the different views (category grid, category view, search results, tabs)
 * and manages the logic for switching between them based on URL state.
 * 
 * Refactored into smaller, focused view components for better maintainability.
 */
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
  setSearchParams: (params: URLSearchParams) => void;
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
  // State for the category skills dialog
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | null>(null);

  // Handle category click - check if empty and show appropriate action
  const handleCategoryClickWithEmptyCheck = async (selectedCategory: SkillCategory) => {
    // We'll need to check if the category has skills
    // For now, let's assume we'll handle this by checking in the click handler
    // If empty, show the dialog, otherwise navigate to category view
    
    // TODO: Add logic to check if category is empty
    // For now, we'll just navigate to the category view
    handleCategoryClick(selectedCategory);
  };

  // Handle skills selection from the category dialog
  const handleSkillsSelected = async (skills: string[]) => {
    // TODO: Add logic to save the selected skills
    // This would typically involve calling a mutation to save the skills
    console.log('Selected skills:', skills, 'for category:', selectedCategory);
    
    // After saving, navigate to the category view
    if (selectedCategory) {
      handleCategoryClick(selectedCategory);
    }
  };

  // Determine which view to show based on URL state
  const showCategoryGrid = !category && !searchQuery && view === 'offers';
  const showCategoryView = category && !searchQuery;
  const showSearchResults = searchQuery;
  const showRegularTabs = !showCategoryGrid && !showCategoryView && !showSearchResults;

  return (
    <>
      {/* Show category grid as default view for offers tab */}
      {showCategoryGrid && (
        <CategoryGridView
          view={view}
          searchQuery={searchQuery}
          searchParams={searchParams}
          searchInputRef={searchInputRef}
          handleTabChange={handleTabChange}
          setSearchParams={setSearchParams}
          setIsSkillDialogOpen={setIsSkillDialogOpen}
          onCategoryClick={handleCategoryClickWithEmptyCheck}
        />
      )}
      
      {/* Show category view when a category is selected */}
      {showCategoryView && (
        <CategorySkillsView
          category={category}
          getTypedCategory={getTypedCategory}
          handleBackToCategories={handleBackToCategories}
          setIsSkillDialogOpen={setIsSkillDialogOpen}
        />
      )}
      
      {/* Show search results when there's a search query */}
      {showSearchResults && (
        <SearchResultsView
          searchQuery={searchQuery}
          searchParams={searchParams}
          category={category}
          setSearchParams={setSearchParams}
          handleBackToCategories={handleBackToCategories}
          setIsSkillDialogOpen={setIsSkillDialogOpen}
          getTypedCategory={getTypedCategory}
          searchInputRef={searchInputRef}
        />
      )}
      
      {/* Show regular tabs view for requests and my skills */}
      {showRegularTabs && (
        <TabsView
          view={view}
          category={category}
          searchQuery={searchQuery}
          searchParams={searchParams}
          searchInputRef={searchInputRef}
          handleTabChange={handleTabChange}
          setSearchParams={setSearchParams}
          setIsSkillDialogOpen={setIsSkillDialogOpen}
          getTypedCategory={getTypedCategory}
        />
      )}
      
      {/* Category Skills Selection Dialog */}
      <CategorySkillsDialog
        open={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
        category={selectedCategory || 'technology'}
        onSkillsSelected={handleSkillsSelected}
      />
    </>
  );
};

export default SkillsPageContent;
