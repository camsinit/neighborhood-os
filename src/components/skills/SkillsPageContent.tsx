
import React from 'react';
import { SkillCategory } from './types/skillTypes';
import CategorySelector from './components/CategorySelector';
import CategorySkillsView from './views/CategorySkillsView';
import SkillCategoryGrid from './SkillCategoryGrid';

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
      {category && (
        <CategorySkillsView 
          category={getTypedCategory(category)!} 
          onBack={handleBackToCategories}
          onAddSkill={() => setIsSkillDialogOpen(true)}
        />
      )}

      {/* Main category grid view - when no category is selected */}
      {!category && (
        <SkillCategoryGrid onCategoryClick={handleCategoryClick} />
      )}
    </div>
  );
};

export default SkillsPageContent;
