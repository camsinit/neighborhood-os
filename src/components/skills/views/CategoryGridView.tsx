
import React from 'react';
import SkillsPageNavigation from '@/components/skills/SkillsPageNavigation';
import SkillCategoryGrid from '@/components/skills/SkillCategoryGrid';
import { SkillCategory } from '@/components/skills/types/skillTypes';

/**
 * CategoryGridView - Displays the grid of skill categories as the default view
 * 
 * This component shows the category grid with navigation when no specific
 * category is selected and no search is active.
 */
interface CategoryGridViewProps {
  view: string;
  searchQuery: string;
  searchParams: URLSearchParams;
  searchInputRef: React.RefObject<HTMLInputElement>;
  handleTabChange: (value: string) => void;
  setSearchParams: (params: URLSearchParams) => void;
  setIsSkillDialogOpen: (open: boolean) => void;
  onCategoryClick: (selectedCategory: SkillCategory) => void;
}

const CategoryGridView: React.FC<CategoryGridViewProps> = ({
  view,
  searchQuery,
  searchParams,
  searchInputRef,
  handleTabChange,
  setSearchParams,
  setIsSkillDialogOpen,
  onCategoryClick
}) => {
  return (
    <div className="space-y-6">
      <SkillsPageNavigation
        view={view}
        searchQuery={searchQuery}
        searchParams={searchParams}
        searchInputRef={searchInputRef}
        handleTabChange={handleTabChange}
        setSearchParams={setSearchParams}
        setIsSkillDialogOpen={setIsSkillDialogOpen}
      />
      
      <SkillCategoryGrid onCategoryClick={onCategoryClick} />
    </div>
  );
};

export default CategoryGridView;
